"""Code generation and self-healing repair module for standalone automation bots."""

import re
from typing import List, Tuple

from pydantic import BaseModel, Field

from core.brain import generate_structured
from core.memory import get_relevant_snippets
from core.state import TeacherState


class GeneratedBotOutput(BaseModel):
    """Pydantic schema for generated automation bot code."""

    code: str = Field(
        description="The complete, standalone, production-ready Python script (bot.py). No placeholders or comments like 'TODO'."
    )
    dependencies: List[str] = Field(
        description="List of external PyPI packages required to execute the bot (e.g. ['requests', 'apscheduler', 'python-dotenv'])."
    )


class RepairedBotOutput(BaseModel):
    """Pydantic schema for repaired automation bot code."""

    code: str = Field(
        description="The complete repaired standalone Python code for bot.py."
    )
    explanation: str = Field(
        description="Brief summary of the issue identified and the fix applied."
    )


CODER_SYSTEM_PROMPT = """You are an expert Python automation systems engineer.
Your task is to write a single, completely standalone, production-grade Python script (bot.py) based on the supplied ProcessSpec and verified reference code patterns.

MANDATORY RULES FOR THE BOT:
1. Self-contained: All imports and logic must reside in a single executable bot.py script.
2. CLI Flags (--run-once & --dry-run):
   - Must implement an argparse CLI with:
     `--run-once`: Executes the primary automation task once immediately and exits cleanly (exit code 0).
     `--dry-run`: Executes the task in simulated mock mode without making real network calls or sending real notifications if credentials are placeholder/mock values. Must print mock activity to logs and exit cleanly (exit code 0).
   - If neither flag is provided, arm the scheduler (e.g. APScheduler) to run periodically in the foreground.
3. Environment & Secrets:
   - Call `from dotenv import load_dotenv; load_dotenv()` at the top.
   - Access all configuration and credentials via `os.getenv(...)`.
   - Never hardcode secrets.
4. Logging:
   - Configure `logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")`.
   - Log informative messages at each major step (fetching, processing, delivering).
5. Error Resilience:
   - Use try/except blocks around network calls with proper logging.
   - In dry-run mode, never crash if credentials are dummy values (e.g., 'your_app_password_here' or 'mock_key').
6. No Placeholders: Write complete, operational code. No 'pass', 'TODO', or ellipsis (...).
"""

REPAIR_SYSTEM_PROMPT = """You are a senior Python debugging engineer.
Your task is to analyze a failing automation script and its error traceback (syntax error, runtime error, or unexpected exception), and return a 100% complete, corrected script.

MANDATORY REPAIR RULES:
1. Fix the root cause shown in the traceback (e.g., missing imports, undefined variables, incorrect function arguments, unhandled exceptions).
2. Ensure that running `python bot.py --dry-run` executes completely without errors or hanging and exits with code 0.
3. Keep all required features: `--run-once`, `--dry-run`, `load_dotenv()`, logging, and scheduler logic.
4. Return the entire corrected script without placeholders.
"""

# Common standard library modules to omit from requirements.txt
STD_LIB_MODULES = {
    "os", "sys", "re", "json", "time", "datetime", "email", "imaplib",
    "smtplib", "urllib", "argparse", "logging", "pathlib", "dataclasses",
    "typing", "hashlib", "math", "collections", "itertools", "functools",
    "ast", "traceback", "subprocess", "socket", "ssl", "tempfile"
}


def _strip_markdown_fences(code: str) -> str:
    """Strip markdown backticks if returned in raw code string."""
    cleaned = code.strip()
    match = re.search(r"```(?:python)?\s*([\s\S]*?)\s*```", cleaned)
    if match:
        cleaned = match.group(1).strip()
    return cleaned


def _clean_dependencies(raw_deps: List[str], code: str) -> List[str]:
    """Normalize and deduplicate external pip dependencies."""
    deps = set()
    for dep in raw_deps:
        name = dep.strip().lower().split(">")[0].split("=")[0].split("<")[0].strip()
        if name and name not in STD_LIB_MODULES:
            deps.add(name)

    # Automatically detect common requirements from code imports
    if "requests" in code and "requests" not in deps:
        deps.add("requests")
    if "apscheduler" in code and "apscheduler" not in deps:
        deps.add("apscheduler")
    if "dotenv" in code and "python-dotenv" not in deps:
        deps.add("python-dotenv")

    # Always ensure python-dotenv is present for .env support
    deps.add("python-dotenv")
    return sorted(list(deps))


def generate_automation_code(state: TeacherState) -> Tuple[str, List[str]]:
    """Generate standalone bot.py code and required pip packages.

    Args:
        state: The current TeacherState with a locked ProcessSpec.

    Returns:
        A tuple of (bot_code_str, required_pip_packages).
    """
    spec = state.spec
    if not spec:
        raise ValueError("Cannot generate code: ProcessSpec is missing from state.")

    reference_snippets = get_relevant_snippets(spec)

    prompt = f"""Target Automation Specification:
- Process Name: {spec.name}
- Trigger Type: {spec.trigger_type}
- Execution Schedule: {spec.schedule}
- Processing Steps:
{chr(10).join(f"  * {step}" for step in spec.processing_steps)}
- Delivery Channel: {spec.delivery_channel}
- Required Secrets: {', '.join(spec.required_secrets)}

Verified Reference Building-Block Snippets to adhere to:
{reference_snippets}

Please synthesize the complete standalone bot.py script and return the GeneratedBotOutput model.
"""

    output: GeneratedBotOutput = generate_structured(
        prompt=prompt,
        system_instruction=CODER_SYSTEM_PROMPT,
        schema_cls=GeneratedBotOutput,
    )

    clean_code = _strip_markdown_fences(output.code)
    deps = _clean_dependencies(output.dependencies, clean_code)

    state.draft_code = clean_code
    state.dependencies = deps
    return clean_code, deps


def repair_automation_code(state: TeacherState, error_traceback: str = "") -> Tuple[str, str]:
    """Repair an automation script that failed sandbox testing.

    Args:
        state: The TeacherState containing draft_code and last_error_traceback.
        error_traceback: Optional error traceback from the sandbox.

    Returns:
        A tuple of (repaired_code_str, explanation_str).
    """
    if not state.draft_code:
        raise ValueError("Cannot repair code: draft_code is empty.")

    if error_traceback:
        state.last_error_traceback = error_traceback

    prompt = f"""Failing Python Automation Script (bot.py):
```python
{state.draft_code}
```

Error / Traceback Observed in Sandbox:
{state.last_error_traceback or 'Execution failed with non-zero exit code or timeout.'}

Please analyze the failure, correct the code to be fully robust and ensure `python bot.py --dry-run` succeeds cleanly.
Return the RepairedBotOutput model.
"""

    output: RepairedBotOutput = generate_structured(
        prompt=prompt,
        system_instruction=REPAIR_SYSTEM_PROMPT,
        schema_cls=RepairedBotOutput,
    )

    repaired_code = _strip_markdown_fences(output.code)
    state.draft_code = repaired_code
    state.dependencies = _clean_dependencies(state.dependencies, repaired_code)
    return repaired_code, output.explanation
