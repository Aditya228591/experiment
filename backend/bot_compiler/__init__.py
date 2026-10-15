"""Teacher AI Bot Compiler Feature Module.

Contains requirement interviewing, automation code synthesis, sandbox execution, and packaging.
"""

from .coder import generate_automation_code, repair_automation_code
from .interviewer import evaluate_requirement
from .sandbox import test_code_in_sandbox
from .packager import package_automation

__all__ = [
    "generate_automation_code",
    "repair_automation_code",
    "evaluate_requirement",
    "test_code_in_sandbox",
    "package_automation",
]
