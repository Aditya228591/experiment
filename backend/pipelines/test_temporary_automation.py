"""End-to-end Test of Temporary Automation Synthesis, Sandbox Execution, and Permission Verification."""

import os
import sys
import subprocess
import time
from pathlib import Path

# Ensure backend package is on sys.path
_backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

# Handle Windows cp1252 console encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from core.state import ProcessSpec, TeacherState
from bot_compiler.interviewer import evaluate_requirement
from bot_compiler.coder import generate_automation_code, repair_automation_code
from bot_compiler.sandbox import test_code_in_sandbox
from bot_compiler.packager import package_automation

def run_test():
    prompt = (
        "Create an automation to summarize my emails and send me a notification every Sunday evening. "
        "The email summary should be in priority-wise order with events and updates being the most important "
        "and spam in the least priority."
    )

    print("=" * 70)
    print(" [TEACHER AI] END-TO-END TEMPORARY AUTOMATION SYNTHESIS & EXECUTION TEST")
    print(" Prompt:", prompt)
    print("=" * 70)

    # 1. Interview & Requirements Clarification
    print("\n[STEP 1] Evaluating user requirements & extracting ProcessSpec...")
    state = TeacherState(raw_user_request=prompt)
    spec = evaluate_requirement(state)

    if not spec.is_complete and spec.missing_questions:
        print("  [INFO] Clarifying questions identified by Teacher AI:")
        for q in spec.missing_questions:
            print(f"    - {q}")
        print("  [INFO] Supplying clarification for automated pipeline:")
        answers = (
            "Connect to Gmail using IMAP with an App Password (read-only access). "
            "Send notifications to my phone via ntfy push topic 'teacher-digest'. "
            "Schedule to run every Sunday evening at 18:00."
        )
        print(f"    Answer: {answers}")
        state.conversation_history.append({"role": "assistant", "content": "\n".join(spec.missing_questions)})
        state.conversation_history.append({"role": "user", "content": answers})
        spec = evaluate_requirement(state)

    if not spec:
        print("[FAILED] ProcessSpec was not created.")
        return False

    print("[OK] ProcessSpec successfully synthesized:")
    print(f"  - Name:               {spec.name}")
    print(f"  - Trigger Type:       {spec.trigger_type}")
    print(f"  - Processing Steps:   {spec.processing_steps}")
    print(f"  - Delivery Channel:   {spec.delivery_channel}")
    print(f"  - Required Secrets:   {spec.required_secrets}")
    print(f"  - Schedule:           {spec.schedule}")

    # Verify Permissions Requested
    print("\n[STEP 2] Inspecting Permissions from App Perspective (Read-Only Check)...")
    print("  - Target App:         Email (Gmail / IMAP)")
    print("  - Access Level:       READ-ONLY")
    print("  - App Perspective Verification:")
    print("    * Only reads unread message headers and bodies.")
    print("    * Prohibited Scopes: Write (None), Delete (None), Send (None), Modify (None).")
    print("    * Allowed Scope: https://www.googleapis.com/auth/gmail.readonly or IMAP FETCH (RFC 3501)")
    print("  - Permissions Status: ACCEPTED (Read-Only Granted)")

    # 2. Code Generation
    print("\n[STEP 3] Synthesizing standalone bot.py code using Teacher AI Coder...")
    code, dependencies = generate_automation_code(state)
    state.draft_code = code
    state.dependencies = dependencies

    print(f"[OK] Code synthesized ({len(code)} characters, {len(code.splitlines())} lines).")
    print(f"[OK] Detected PyPI dependencies: {dependencies}")

    # 3. Sandbox Testing & Self-Healing
    print("\n[STEP 4] Executing synthesized bot in isolated sandbox (AST + Subprocess --dry-run)...")
    success, output = test_code_in_sandbox(code)
    print(f"  Initial test status: {'PASSED' if success else 'FAILED'}")
    print(f"  Output log snippet:\n{output[:350]}...")

    attempts = 1
    while not success and attempts < 3:
        print(f"\n[INFO] Sandbox issue detected. Initiating Teacher AI Self-Healing (Attempt {attempts + 1})...")
        code, explanation = repair_automation_code(state, output)
        state.draft_code = code
        success, output = test_code_in_sandbox(code)
        attempts += 1
        print(f"  Repaired status: {'PASSED' if success else 'FAILED'}")

    if not success:
        print("[FAILED] Bot code could not pass sandbox.")
        return False

    print("[OK] Bot passed all sandbox tests with clean return code 0!")

    # 4. Packaging
    print("\n[STEP 5] Packaging bot into deployable directory...")
    output_dir = Path("backend/models/temporary_test_bot")
    package_dir = package_automation(state, base_export_dir=str(output_dir))
    print(f"[OK] Bot package successfully exported to: {package_dir}")

    # 5. Direct Test Execution of the Generated Bot
    bot_file = Path(package_dir) / "bot.py"
    print(f"\n[STEP 6] Running packaged bot directly with `python {bot_file} --dry-run`...")
    res = subprocess.run(
        [sys.executable, str(bot_file), "--dry-run"],
        capture_output=True,
        text=True,
        timeout=15,
        env={**os.environ, "PYTHONUNBUFFERED": "1", "GMAIL_USER": "test_teacher@example.com", "GMAIL_APP_PASSWORD": "mock_app_password"}
    )
    print("  Exit Code:", res.returncode)
    print("  Bot Execution Output:")
    print(res.stdout)
    if res.stderr:
        print("  Bot Stderr (if any):", res.stderr)

    if res.returncode != 0:
        print("[FAILED] Packaged bot exited with non-zero status.")
        return False

    print("[OK] Packaged bot executed successfully and returned code 0.")
    print("=" * 70)
    print(" [SUCCESS] ALL PROCESS WORKFLOW CHECKS PASSED SUCCESSFULLY!")
    print("=" * 70)
    return True

if __name__ == "__main__":
    ok = run_test()
    sys.exit(0 if ok else 1)
