"""Working memory and state models for Teacher AI."""

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class ProcessSpec:
    """Locked-in or in-progress specification for an automation process."""

    name: str = ""
    trigger_type: str = ""
    processing_steps: List[str] = field(default_factory=list)
    delivery_channel: str = ""
    required_secrets: List[str] = field(default_factory=list)
    schedule: str = ""
    is_complete: bool = False
    missing_questions: List[str] = field(default_factory=list)


@dataclass
class TeacherState:
    """Global working memory for the Teacher AI compilation pipeline."""

    raw_user_request: str
    conversation_history: List[Dict[str, str]] = field(default_factory=list)
    spec: Optional[ProcessSpec] = None
    draft_code: str = ""
    dependencies: List[str] = field(default_factory=list)
    test_attempts: int = 0
    max_retries: int = 3
    last_error_traceback: Optional[str] = None
    verified: bool = False
