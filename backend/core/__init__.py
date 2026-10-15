"""Teacher AI Core Feature Module.

Contains LLM reasoning (brain), verified automation snippets (memory), and state management (state).
"""

from .brain import generate_text, generate_structured, is_configured, set_api_key
from .memory import get_relevant_snippets
from .state import ProcessSpec, TeacherState

__all__ = [
    "generate_text",
    "generate_structured",
    "is_configured",
    "set_api_key",
    "get_relevant_snippets",
    "ProcessSpec",
    "TeacherState",
]
