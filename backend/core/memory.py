"""Verified building-blocks library for reliable automation code generation.

Provides battle-tested, minimal boilerplate patterns to inject into prompts,
preventing LLM hallucination and ensuring runtime compatibility.
"""

from typing import Optional
from core.state import ProcessSpec

IMAP_FETCH_BLOCK = '''
# --- IMAP / GMAIL FETCH BLOCK ---
import imaplib
import email
from email.header import decode_header
import os
import logging

def decode_mime_words(s: str) -> str:
    """Safely decode MIME-encoded header fields (RFC 2047)."""
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
    """Fetch unread emails from IMAP/Gmail server.
    
    If dry_run is True or mock credentials are detected, returns synthetic emails.
    """
    email_user = os.getenv("GMAIL_USER") or os.getenv("EMAIL_USER")
    email_pass = os.getenv("GMAIL_APP_PASSWORD") or os.getenv("EMAIL_PASSWORD")

    if dry_run or not email_user or "example" in (email_user or "").lower() or not email_pass:
        logging.info("[DRY-RUN] Simulating email fetch (mock mode active)...")
        return [
            {
                "id": "1",
                "from": "alice@example.com",
                "subject": "Project Status Update & Roadmap",
                "body": "Hi team, the sprint went very well. All deliverables for the Teacher AI are on track for today."
            },
            {
                "id": "2",
                "from": "newsletter@techdigest.com",
                "subject": "Weekly Tech Highlights",
                "body": "Here are top stories in autonomous agent engineering and workflow compilers."
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

        # Fetch most recent unread emails up to max_emails
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
'''

NTFY_PUSH_BLOCK = '''
# --- NTFY PUSH NOTIFICATION BLOCK ---
import requests
import os
import logging

def send_ntfy_push(message: str, title: str = "Automation Alert", topic: Optional[str] = None, dry_run: bool = False):
    """Send a push notification to phone using ntfy.sh (free, zero setup on iOS/Android)."""
    target_topic = topic or os.getenv("NTFY_TOPIC")
    if not target_topic:
        logging.warning("NTFY_TOPIC not configured. Using default topic 'teacher_ai_alerts'.")
        target_topic = "teacher_ai_alerts"

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
'''

TELEGRAM_BLOCK = '''
# --- TELEGRAM BOT MESSAGE BLOCK ---
import requests
import os
import logging

def send_telegram_message(message: str, bot_token: Optional[str] = None, chat_id: Optional[str] = None, dry_run: bool = False):
    """Send a message via Telegram Bot API."""
    token = bot_token or os.getenv("TELEGRAM_BOT_TOKEN")
    cid = chat_id or os.getenv("TELEGRAM_CHAT_ID")

    if dry_run or not token or not cid:
        logging.info("[DRY-RUN] Simulating Telegram message delivery...")
        logging.info("[DRY-RUN] Chat ID: %s | Message: %s", cid, message[:200])
        return True

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": cid,
        "text": message,
        "parse_mode": "HTML"
    }
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        logging.info("Telegram message successfully sent to chat %s", cid)
        return True
    except Exception as exc:
        logging.error("Failed to send Telegram message: %s", exc)
        raise
'''

SCHEDULER_BLOCK = '''
# --- SCHEDULER & CLI ARGPARSE BLOCK ---
import argparse
import sys
import logging
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

def run_scheduler_or_cli(job_func, schedule_config=None):
    """Handle CLI argument flags (--run-once, --dry-run) and APScheduler daemon loop."""
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

    # Background scheduler execution
    scheduler = BlockingScheduler()
    # Default to daily at 08:00 AM or specified schedule
    scheduler.add_job(lambda: job_func(dry_run=False), CronTrigger(hour=8, minute=0), id="automation_job")
    logging.info("Scheduler armed. Running in foreground. Press Ctrl+C to exit.")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logging.info("Scheduler stopped by user.")
'''


def get_relevant_snippets(spec: Optional[ProcessSpec]) -> str:
    """Select and assemble relevant code snippets based on the ProcessSpec."""
    snippets = []

    # Always provide scheduler block because every standalone bot needs CLI flags
    snippets.append(SCHEDULER_BLOCK)

    if not spec:
        snippets.extend([IMAP_FETCH_BLOCK, NTFY_PUSH_BLOCK, TELEGRAM_BLOCK])
        return "\n\n".join(snippets)

    combined_text = (
        f"{spec.name} {spec.trigger_type} {' '.join(spec.processing_steps)} {spec.delivery_channel}"
    ).lower()

    if any(keyword in combined_text for keyword in ["gmail", "email", "imap", "mail", "inbox"]):
        snippets.append(IMAP_FETCH_BLOCK)

    if any(keyword in combined_text for keyword in ["ntfy", "push", "phone", "alert", "notification"]):
        snippets.append(NTFY_PUSH_BLOCK)

    if any(keyword in combined_text for keyword in ["telegram", "tg", "bot"]):
        snippets.append(TELEGRAM_BLOCK)

    # If delivery channel is not explicitly telegram, default to ntfy
    if "telegram" not in combined_text and NTFY_PUSH_BLOCK not in snippets:
        snippets.append(NTFY_PUSH_BLOCK)

    return "\n\n".join(snippets)
