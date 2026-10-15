import argparse
import sys
import os
import logging
import imaplib
import email
from email.header import decode_header
import requests
from typing import Optional
from dotenv import load_dotenv

try:
    from apscheduler.schedulers.blocking import BlockingScheduler
    from apscheduler.triggers.cron import CronTrigger
    HAS_APSCHEDULER = True
except ImportError:
    HAS_APSCHEDULER = False

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

def decode_mime_words(s: str) -> str:
    if not s:
        return ""
    decoded_fragments = decode_header(s)
    result = []
    for text, charset in decoded_fragments:
        if isinstance(text, bytes):
            result.append(text.decode(charset or "utf-8", errors="replace"))
        else:
            result.append(str(text))
    return "".join(result)

def fetch_unread_emails(imap_server="imap.gmail.com", imap_port=993, max_emails=10, dry_run=False):
    email_user = os.getenv("GMAIL_USER") or os.getenv("EMAIL_USER")
    email_pass = os.getenv("GMAIL_APP_PASSWORD") or os.getenv("EMAIL_PASSWORD")

    if dry_run or not email_user or "example" in (email_user or "").lower() or not email_pass:
        logging.info("[DRY-RUN] Simulating email fetch (mock mode active)...")
        return [
            {
                "id": "1",
                "from": "alice@example.com",
                "subject": "Project Status Update & Roadmap Event",
                "body": "Hi team, the sprint went very well. All deliverables are on track for today's meeting."
            },
            {
                "id": "2",
                "from": "newsletter@techdigest.com",
                "subject": "Weekly Tech Highlights",
                "body": "Here are top stories in autonomous agent engineering."
            },
            {
                "id": "3",
                "from": "spam@winfreestuff.com",
                "subject": "Claim your free prize now!!",
                "body": "Click here to win an amazing vacation."
            }
        ]

    emails = []
    mail = None
    try:
        logging.info("Connecting to IMAP server %s:%s...", imap_server, imap_port)
        mail = imaplib.IMAP4_SSL(imap_server, imap_port)
        mail.login(email_user, email_pass)
        mail.select("INBOX")

        status, response = mail.search(None, "UNSEEN")
        if status != "OK":
            logging.warning("Failed to search mailbox: %s", status)
            return emails

        message_ids = response[0].split()
        logging.info("Found %d unread emails.", len(message_ids))

        for msg_id in message_ids[-max_emails:]:
            res, msg_data = mail.fetch(msg_id, "(RFC822)")
            if res != "OK":
                continue
            for part in msg_data:
                if isinstance(part, tuple):
                    raw_email = part[1]
                    msg = email.message_from_bytes(raw_email)
                    subject = decode_mime_words(msg.get("Subject", "(No Subject)"))
                    from_ = decode_mime_words(msg.get("From", "(Unknown Sender)"))
                    date_ = msg.get("Date", "")
                    
                    body = ""
                    if msg.is_multipart():
                        for payload in msg.walk():
                            if payload.get_content_type() == "text/plain":
                                try:
                                    body = payload.get_payload(decode=True).decode("utf-8", errors="replace")
                                    break
                                except Exception:
                                    pass
                    else:
                        try:
                            body = msg.get_payload(decode=True).decode("utf-8", errors="replace")
                        except Exception:
                            body = str(msg.get_payload())

                    emails.append({
                        "id": msg_id.decode("utf-8", errors="ignore"),
                        "from": from_,
                        "subject": subject,
                        "date": date_,
                        "body": body.strip()
                    })
    except Exception as exc:
        logging.error("IMAP error during fetch: %s", exc)
        raise
    finally:
        if mail:
            try:
                mail.close()
                mail.logout()
            except Exception:
                pass

    return emails

def send_ntfy_push(message: str, title: str = "Automation Alert", topic: Optional[str] = None, dry_run: bool = False):
    target_topic = topic or os.getenv("NTFY_TOPIC")
    if not target_topic:
        logging.warning("NTFY_TOPIC not configured. Using default topic 'gmail_summary_alerts'.")
        target_topic = "gmail_summary_alerts"

    if dry_run:
        logging.info("[DRY-RUN] Would publish ntfy push to https://ntfy.sh/%s", target_topic)
        logging.info("[DRY-RUN] Title: %s", title)
        logging.info("[DRY-RUN] Body: %s", message[:200] + ("..." if len(message) > 200 else ""))
        return True

    url = f"https://ntfy.sh/{target_topic}"
    headers = {
        "Title": title.encode("utf-8"),
        "Priority": "default",
        "Tags": "robot,bell",
    }
    try:
        response = requests.post(url, data=message.encode("utf-8"), headers=headers, timeout=10)
        response.raise_for_status()
        logging.info("Push notification successfully sent to ntfy topic: %s", target_topic)
        return True
    except Exception as exc:
        logging.error("Failed to send ntfy push notification: %s", exc)
        raise

def categorize_and_summarize(emails):
    high_priority = []
    medium_priority = []
    low_priority = []

    event_keywords = ["event", "meeting", "schedule", "calendar", "urgent", "update", "roadmap", "track"]
    spam_keywords = ["win", "free", "prize", "spam", "claim", "offer"]

    for email_item in emails:
        text_blob = (email_item["subject"] + " " + email_item["body"]).lower()
        
        is_spam = any(kw in text_blob for kw in spam_keywords)
        is_high = any(kw in text_blob for kw in event_keywords)

        if is_spam:
            low_priority.append(email_item)
        elif is_high:
            high_priority.append(email_item)
        else:
            medium_priority.append(email_item)

    summary_lines = []
    summary_lines.append(f"Total Emails Processed: {len(emails)}")
    summary_lines.append(f"- High Priority (Events/Updates): {len(high_priority)}")
    summary_lines.append(f"- Medium Priority (General): {len(medium_priority)}")
    summary_lines.append(f"- Low Priority (Spam/Promotions): {len(low_priority)}")
    summary_lines.append("")

    if high_priority:
        summary_lines.append("=== HIGH PRIORITY ===")
        for item in high_priority:
            summary_lines.append(f"* From: {item['from']} | Subject: {item['subject']}")

    if medium_priority:
        summary_lines.append("=== MEDIUM PRIORITY ===")
        for item in medium_priority:
            summary_lines.append(f"* From: {item['from']} | Subject: {item['subject']}")

    if low_priority:
        summary_lines.append("=== LOW PRIORITY / SPAM ===")
        for item in low_priority:
            summary_lines.append(f"* From: {item['from']} | Subject: {item['subject']}")

    return "\n".join(summary_lines)

def job_handler(dry_run: bool = False):
    logging.info("Starting Sunday Email Summarizer job execution...")
    emails = fetch_unread_emails(dry_run=dry_run)
    summary = categorize_and_summarize(emails)
    send_ntfy_push(message=summary, title="Weekly Gmail Summary", dry_run=dry_run)
    logging.info("Sunday Email Summarizer job execution finished successfully.")

def run_scheduler_or_cli(job_func):
    parser = argparse.ArgumentParser(description="Standalone Automation Runner")
    parser.add_argument("--run-once", action="store_true", help="Execute automation job once immediately and exit")
    parser.add_argument("--dry-run", action="store_true", help="Run with simulated/mocked network requests")
    args = parser.parse_args()

    if args.dry_run or args.run_once:
        logging.info("Executing single pass (dry_run=%s, run_once=%s)...", args.dry_run, args.run_once)
        try:
            job_func(dry_run=args.dry_run)
            logging.info("Single pass execution completed successfully.")
            sys.exit(0)
        except Exception as exc:
            logging.exception("Error executing single pass: %s", exc)
            sys.exit(1)

    if not HAS_APSCHEDULER:
        logging.error("APScheduler is required to run the continuous scheduler, but is not installed.")
        sys.exit(1)

    scheduler = BlockingScheduler()
    scheduler.add_job(lambda: job_func(dry_run=False), CronTrigger(day_of_week="sun", hour=18, minute=0), id="automation_job")
    logging.info("Scheduler armed. Running for Sundays at 18:00. Press Ctrl+C to exit.")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logging.info("Scheduler stopped by user.")

if __name__ == "__main__":
    run_scheduler_or_cli(job_handler)