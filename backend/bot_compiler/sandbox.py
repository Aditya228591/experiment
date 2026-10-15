"""Sandbox testing module for verifying generated Python automations."""

import ast
import os
import re
import subprocess
import sys
import tempfile
import traceback
from typing import Dict, List, Tuple


def _extract_env_vars(code_str: str) -> List[str]:
    """Extract environment variable names accessed in the code string."""
    pattern = r'(?:os\.getenv|os\.environ\.get|os\.environ\[)\s*\(\s*["\']([A-Z0-9_]+)["\']'
    matches = re.findall(pattern, code_str)
    return sorted(list(set(matches)))


def _build_dummy_env(env_vars: List[str]) -> Dict[str, str]:
    """Generate safe mock values for expected environment variables."""
    dummy_env: Dict[str, str] = {}
    for var in env_vars:
        var_lower = var.lower()
        if "mail" in var_lower or "user" in var_lower:
            dummy_env[var] = "mock_user@example.com"
        elif "pass" in var_lower or "secret" in var_lower or "token" in var_lower or "key" in var_lower:
            dummy_env[var] = "mock_secret_token_12345"
        elif "topic" in var_lower:
            dummy_env[var] = "mock_test_topic_789"
        elif "chat" in var_lower or "id" in var_lower:
            dummy_env[var] = "123456789"
        else:
            dummy_env[var] = "mock_value_for_sandbox"
    return dummy_env


def test_code_in_sandbox(code_str: str) -> Tuple[bool, str]:
    """Test Python automation code in a local isolated sandbox.

    1. Performs static syntax check with ast.parse().
    2. Writes code and dummy .env to a temporary directory.
    3. Runs `python temp_bot.py --dry-run` with a 15-second timeout.

    Args:
        code_str: The Python code to test.

    Returns:
        A tuple of (success_bool, message_or_traceback).
    """
    # 1. Static AST Syntax Check
    try:
        ast.parse(code_str)
    except SyntaxError as syn_err:
        tb = f"SyntaxError at line {syn_err.lineno}, col {syn_err.offset}: {syn_err.msg}\n"
        tb += f"Problematic line: {syn_err.text}"
        return False, tb
    except Exception as exc:
        return False, f"Static parse failure: {exc}\n{traceback.format_exc()}"

    # 2. Extract expected environment variables and prepare dummy credentials
    env_vars = _extract_env_vars(code_str)
    dummy_env_dict = _build_dummy_env(env_vars)

    # 3. Isolated Subprocess Dry-Run Check
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_bot_path = os.path.join(temp_dir, "temp_bot.py")
        temp_env_path = os.path.join(temp_dir, ".env")

        # Write bot code
        with open(temp_bot_path, "w", encoding="utf-8") as f:
            f.write(code_str)

        # Write dummy .env
        with open(temp_env_path, "w", encoding="utf-8") as f:
            for k, v in dummy_env_dict.items():
                f.write(f"{k}={v}\n")

        # Prepare execution environment inheriting current system PATH and Python libs
        execution_env = os.environ.copy()
        execution_env.update(dummy_env_dict)
        execution_env["PYTHONUNBUFFERED"] = "1"

        try:
            result = subprocess.run(
                [sys.executable, "temp_bot.py", "--dry-run"],
                cwd=temp_dir,
                env=execution_env,
                capture_output=True,
                text=True,
                timeout=15,
            )

            if result.returncode == 0:
                output_log = (result.stdout or "").strip()
                return True, f"OK: {output_log}" if output_log else "OK"

            error_msg = result.stderr.strip() or result.stdout.strip()
            if not error_msg:
                error_msg = f"Process terminated with non-zero exit code ({result.returncode})."
            return False, error_msg

        except subprocess.TimeoutExpired as timeout_err:
            out = timeout_err.stdout or ""
            err = timeout_err.stderr or ""
            return False, (
                "Execution timed out after 15 seconds. Ensure that the bot cleanly handles "
                f"the `--dry-run` flag and exits immediately without entering an infinite loop.\nStdout: {out}\nStderr: {err}"
            )
        except Exception as exc:
            return False, f"Subprocess execution error: {exc}\n{traceback.format_exc()}"
