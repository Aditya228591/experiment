import os
import sys
import logging
import argparse
import imaplib
import email
from email.header import decode_header
import requests
from typing import Optional
from dotenv import load_dotenv

try:
    from apscheduler.schedulers.blocking import BlockingScheduler
    from apscheduler.triggers.cron import CronTrigger
    APSCHEDULER_AVAILABLE = True
except ImportError:
    APSCHEDULER_AVAILABLE = False

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

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

def fetch_unread_emails(imap_server="imap.gmail.com", imap_port=993, max_emails=20, dry_run=False):
    email_user = os.getenv("GMAIL_USER")
    email_pass = os.getenv("GMAIL_APP_PASSWORD")

    if dry_run or not email_user or "example" in (email_user or "").lower() or not email_pass:
        logging.info("[DRY-RUN] Simulating email fetch (mock mode active)...")
        return [
            {
                "id": "1",
                "from": "events@school.edu",
                "subject": "Parent Teacher Conference Event",
                "body": "Important event scheduled for next Tuesday regarding student curriculum."
            },
            {
                "id": "2",
                "from": "update@platform.com",
                "subject": "System Update Version 2.4 Released",
                "body": "New features and bug fixes have been deployed."
            },
            {
                "id": "3",
                "from": "promo@bestdeals.com",
                "subject": "Win a free cruise today!",
                "body": "Click here to claim your spam reward now!"
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

def categorize_and_summarize(emails):
    high_priority = []
    normal_priority = []
    spam_priority = []

    spam_keywords = ["win", "free", "deal", "offer", "click", "spam", "casino", "prize"]
    event_keywords = ["event", "conference", "meeting", "schedule", "calendar", "urgent", "important", "update"]

    for mail in emails:
        text_blob = (mail.get("subject", "") + " " + mail.get("body", "")).lower()
        
        is_spam = any(kw in text_blob for kw in spam_keywords)
        is_event = any(kw in text_blob for kw in event_keywords)

        if is_spam:
            spam_priority.append(mail)
        elif is_event:
            high_priority.append(mail)
        else:
            normal_priority.append(mail)

    summary_lines = []
    summary_lines.append("=== GMAIL SUNDAY DIGEST ===")
    summary_lines.append(f"Total Processed: {len(emails)}\n")

    summary_lines.append(f"--- High Priority (Events/Updates): {len(high_priority)} ---")
    for item in high_priority:
        summary_lines.append(f"• From: {item['from']}\n  Subject: {item['subject']}")

    summary_lines.append(f"\n--- Normal Priority: {len(normal_priority)} ---")
    for item in normal_priority:
        summary_lines.append(f"• From: {item['from']}\n  Subject: {item['subject']}")

    summary_lines.append(f"\n--- Spam / Low Priority: {len(spam_priority)} ---")
    for item in spam_priority:
        summary_lines.append(f"• From: {item['from']}\n  Subject: {item['subject']}")

    return "\n".join(summary_lines)

def send_ntfy_push(message: str, title: str = "Sunday Email Digest", topic: Optional[str] = None, dry_run: bool = False):
    target_topic = topic or os.getenv("NTFY_TOPIC")
    if not target_topic:
        target_topic = "teacher-digest"

    if dry_run:
        logging.info("[DRY-RUN] Would publish ntfy push to https://ntfy.sh/%s", target_topic)
        logging.info("[DRY-RUN] Title: %s", title)
        logging.info("[DRY-RUN] Body:\n%s", message)
        return True

    url = f"https://ntfy.sh/{target_topic}"
    headers = {
        "Title": title.encode("utf-8"),
        "Priority": "default",
        "Tags": "mailbox,memo",
    }
    try:
        response = requests.post(url, data=message.encode("utf-8"), headers=headers, timeout=10)
        response.raise_for_status()
        logging.info("Push notification successfully sent to ntfy topic: %s", target_topic)
        return True
    except Exception as exc:
        logging.error("Failed to send ntfy push notification: %s", exc)
        raise

def job_handler(dry_run: bool = False):
    logging.info("Starting Gmail Sunday Digest automation job...")
    emails = fetch_unread_emails(dry_run=dry_run)
    summary = categorize_and_summarize(emails)
    send_ntfy_push(summary, dry_run=dry_run)
    logging.info("Gmail Sunday Digest automation job completed successfully.")

def main():
    parser = argparse.ArgumentParser(description="Gmail Sunday Digest Bot Runner")
    parser.add_argument("--run-once", action="store_true", help="Execute automation job once immediately and exit")
    parser.add_argument("--dry-run", action="store_true", help="Run with simulated/mocked network requests")
    args = parser.parse_args()

    if args.dry_run or args.run_once:
        logging.info("Executing single pass (dry_run=%s, run_once=%s)...", args.dry_run, args.run_once)
        try:
            job_handler(dry_run=args.dry_run)
            logging.info("Single pass execution completed successfully.")
            sys.exit(0)
        except Exception as exc:
            logging.exception("Error executing single pass: %s", exc)
            sys.exit(1)

    if not APSCHEDULER_AVAILABLE:
        logging.error("apscheduler package is not installed. Cannot run scheduler mode. Use --dry-run or --run-once.")
        sys.exit(1)

    scheduler = BlockingScheduler()
    scheduler.add_job(lambda: job_handler(dry_run=False), CronTrigger(day_of_week="sun", hour=18, minute=0), id="gmail_sunday_digest_job")
    logging.info("Scheduler armed for Sunday at 18:00. Running in foreground. Press Ctrl+C to exit.")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logging.info("Scheduler stopped by user.")

if __name__ == "__main__":
    main()