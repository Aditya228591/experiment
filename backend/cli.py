"""CLI Entrypoint and orchestrator for Teacher AI."""

import os
import sys
from typing import Dict, List

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from dotenv import load_dotenv

# Ensure backend root package is on sys.path
_backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

from bot_compiler.coder import generate_automation_code, repair_automation_code
from bot_compiler.interviewer import evaluate_requirement
from bot_compiler.packager import package_automation
from bot_compiler.sandbox import test_code_in_sandbox
from core.state import TeacherState

# ANSI Color Codes for enhanced terminal UX
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"


def print_banner():
    banner = f"""
{CYAN}{BOLD}====================================================================
 🎓 TEACHER AI: Autonomous Automation Compiler & Self-Healing Bot Lab
===================================================================={RESET}
Describe your automation idea in plain English. Teacher AI will:
  1. Clarify missing parameters and credentials
  2. Synthesize a single standalone Python bot
  3. Test & self-heal the bot inside an isolated sandbox
  4. Export a production-ready package you can run anywhere
"""
    print(banner)


def ensure_api_key():
    """Verify that GEMINI_API_KEY is available or prompt user for it."""
    load_dotenv()
    if not os.getenv("GEMINI_API_KEY"):
        print(f"{YELLOW}⚠️  GEMINI_API_KEY was not found in environment or .env file.{RESET}")
        key = input(f"{BOLD}Enter your Gemini API key (or press Enter to exit): {RESET}").strip()
        if not key:
            print(f"{RED}Error: Cannot proceed without a GEMINI_API_KEY.{RESET}")
            sys.exit(1)
        os.environ["GEMINI_API_KEY"] = key
        # Persist to .env for future convenience
        try:
            with open(".env", "a", encoding="utf-8") as f:
                f.write(f"\nGEMINI_API_KEY={key}\n")
            print(f"{GREEN}Saved GEMINI_API_KEY to .env{RESET}\n")
        except Exception:
            pass


def run_interview_phase(state: TeacherState):
    """Iteratively clarify requirements with the user until specification is complete."""
    print(f"\n{CYAN}{BOLD}[Phase 1/5] 💬 REQUIREMENTS INTERVIEW{RESET}")
    print("Analyzing your request and checking for missing technical details...\n")

    while True:
        spec = evaluate_requirement(state)

        if spec.is_complete:
            print(f"{GREEN}✓ All requirements clarified! Automation specification locked.{RESET}\n")
            break

        print(f"{YELLOW}{BOLD}A few quick questions are needed to make your bot bulletproof:{RESET}")
        questions_text = []
        for i, q in enumerate(spec.missing_questions, start=1):
            formatted_q = f"  {i}. {q}"
            print(f"{BOLD}{formatted_q}{RESET}")
            questions_text.append(formatted_q)

        # Record assistant questions in conversation history
        state.conversation_history.append({
            "role": "assistant",
            "content": "\n".join(questions_text)
        })

        print()
        user_response = input(f"{BOLD}Your answer: {RESET}").strip()
        while not user_response:
            user_response = input(f"{YELLOW}Please provide an answer (or type 'quit' to exit): {RESET}").strip()
            if user_response.lower() in ("quit", "exit"):
                print("Exiting Teacher AI.")
                sys.exit(0)

        # Record user answer in conversation history
        state.conversation_history.append({
            "role": "user",
            "content": user_response
        })
        print(f"\n{CYAN}Updating blueprint...{RESET}\n")


def display_spec_summary(state: TeacherState):
    """Print a clean summary of the locked specification."""
    spec = state.spec
    if not spec:
        return

    print(f"{CYAN}{BOLD}[Phase 2/5] 📋 SPECIFICATION BLUEPRINT{RESET}")
    print(f"  • {BOLD}Bot Name:{RESET}         {spec.name}")
    print(f"  • {BOLD}Trigger Type:{RESET}     {spec.trigger_type}")
    print(f"  • {BOLD}Schedule:{RESET}         {spec.schedule}")
    print(f"  • {BOLD}Delivery Channel:{RESET} {spec.delivery_channel}")
    print(f"  • {BOLD}Required Secrets:{RESET} {', '.join(spec.required_secrets)}")
    print(f"  • {BOLD}Execution Steps:{RESET}")
    for step in spec.processing_steps:
        print(f"      - {step}")
    print()


def run_coding_phase(state: TeacherState):
    """Generate the initial bot code and dependencies."""
    print(f"{CYAN}{BOLD}[Phase 3/5] ⚙️ CODE SYNTHESIS{RESET}")
    print("Injecting verified building blocks and generating standalone bot.py...")
    code, deps = generate_automation_code(state)
    print(f"{GREEN}✓ Initial code synthesized ({len(code.splitlines())} lines).{RESET}")
    print(f"  Identified external dependencies: {', '.join(deps) if deps else 'None (Standard Library only)'}\n")


def run_sandbox_phase(state: TeacherState) -> bool:
    """Test code in isolated sandbox and perform self-healing repairs if needed."""
    print(f"{CYAN}{BOLD}[Phase 4/5] 🧪 SANDBOX TESTING & SELF-HEALING{RESET}")

    state.test_attempts = 0
    while state.test_attempts <= state.max_retries:
        attempt_num = state.test_attempts + 1
        print(f"Running sandbox verification (Attempt {attempt_num}/{state.max_retries + 1})...")

        passed, feedback = test_code_in_sandbox(state.draft_code)

        if passed:
            print(f"{GREEN}{BOLD}✓ Sandbox test PASSED! (AST syntax clean, --dry-run exited 0){RESET}\n")
            state.verified = True
            return True

        print(f"{RED}✗ Sandbox verification failed:{RESET}")
        print(f"{YELLOW}{feedback}{RESET}\n")

        state.last_error_traceback = feedback
        state.test_attempts += 1

        if state.test_attempts > state.max_retries:
            print(f"{RED}{BOLD}Reached maximum self-healing retries ({state.max_retries}). Packaging aborted.{RESET}")
            return False

        print(f"{YELLOW}🔧 Initiating self-healing repair loop...{RESET}")
        repair_automation_code(state)
        print(f"{GREEN}✓ Repaired code draft prepared. Re-testing in sandbox...{RESET}\n")

    return False


def run_packaging_phase(state: TeacherState):
    """Package the verified bot into a standalone directory."""
    print(f"{CYAN}{BOLD}[Phase 5/5] 📦 PACKAGE EXPORT{RESET}")
    export_path = package_automation(state)

    print(f"""
{GREEN}{BOLD}====================================================================
 🎉 AUTOMATION EXPORT SUCCESSFUL!
===================================================================={RESET}
Your standalone bot has been verified and exported to:
  {BOLD}{CYAN}{export_path}{RESET}

Package Contents:
  - {BOLD}bot.py{RESET}: Standalone automation bot with scheduler & CLI flags
  - {BOLD}requirements.txt{RESET}: Isolated pip packages needed to run
  - {BOLD}.env.example{RESET}: Credentials template with required environment variables
  - {BOLD}README.md{RESET}: Complete setup, testing, and deployment instructions

To test your new bot right away:
  {BOLD}cd "{export_path}"{RESET}
  {BOLD}python bot.py --dry-run{RESET}
  {BOLD}python bot.py --run-once{RESET}
""")


def main():
    if "--studio" in sys.argv or "-s" in sys.argv:
        import run_studio
        run_studio.main()
        return

    try:
        print_banner()
        ensure_api_key()

        user_input = input(
            f"{BOLD}What would you like to automate?{RESET}\n> "
        ).strip()

        while not user_input:
            user_input = input(f"{YELLOW}Please enter an automation idea: {RESET}").strip()

        state = TeacherState(raw_user_request=user_input)

        # 1. Clarification & Interview Loop
        run_interview_phase(state)

        # 2. Spec Review
        display_spec_summary(state)

        # 3. Code Generation
        run_coding_phase(state)

        # 4. Sandbox Testing & Repair
        success = run_sandbox_phase(state)
        if not success:
            sys.exit(1)

        # 5. Packaging
        run_packaging_phase(state)

    except KeyboardInterrupt:
        print(f"\n{YELLOW}Process cancelled by user. Exiting.{RESET}")
        sys.exit(0)
    except Exception as exc:
        print(f"\n{RED}{BOLD}Unexpected Fatal Error:{RESET} {exc}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
