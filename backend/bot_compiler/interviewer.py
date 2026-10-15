"""Interviewer module for evaluating and clarifying automation requirements."""

import json
from typing import List

from pydantic import BaseModel, Field

from core.brain import generate_structured
from core.state import ProcessSpec, TeacherState


class ProcessSpecModel(BaseModel):
    """Pydantic schema used for structured LLM requirement evaluation."""

    name: str = Field(
        description="A concise pythonic snake_case name for the bot, e.g. 'gmail_morning_summarizer'"
    )
    trigger_type: str = Field(
        description="Trigger mechanism: 'schedule' (APScheduler cron/interval), 'webhook', 'watch', or 'manual'"
    )
    processing_steps: List[str] = Field(
        description="Numbered or bulleted logical steps of what the bot executes"
    )
    delivery_channel: str = Field(
        description="Output or notification delivery channel, e.g. 'ntfy_push', 'telegram', 'email', 'console'"
    )
    required_secrets: List[str] = Field(
        description="List of environment variable keys needed, e.g. ['GMAIL_USER', 'GMAIL_APP_PASSWORD', 'NTFY_TOPIC']"
    )
    schedule: str = Field(
        description="Execution frequency or timing, e.g. 'Every day at 08:00 AM', 'Every hour', or 'None / on-demand'"
    )
    is_complete: bool = Field(
        description="True ONLY if user prompt + answers clarify intent, trigger, data source, actions, and output channel with no critical ambiguity. False if important details are missing."
    )
    missing_questions: List[str] = Field(
        default_factory=list,
        description="1 to 3 friendly, targeted clarifying questions if is_complete is False. Keep questions concise and offer sensible defaults (e.g. ntfy.sh for phone push). Empty list if is_complete is True.",
    )


INTERVIEWER_SYSTEM_INSTRUCTION = """You are an expert Systems Requirements Analyst for Teacher AI.
Your objective is to inspect a user's plain-English automation idea and conversation history, then evaluate whether we have a complete and unambiguous blueprint to write a standalone Python bot.

Evaluation Criteria:
1. Trigger / Schedule: When and how does it run? (e.g., daily at 8:00 AM, hourly, or manual invocation)
2. Data Source & Authentication: Where does it fetch data, and what credentials are required? (e.g., Gmail via IMAP with App Password, RSS feed, public REST API)
3. Transformation / Processing: What exact logic does it perform? (e.g., fetch unread messages, summarize text, filter records)
4. Delivery Channel: Where does the final payload go?
   - Note: If user says "send to my phone", recommend `ntfy_push` via ntfy.sh (free, zero account setup on iOS/Android) or Telegram bot as friendly options if unspecified.

Completeness Rules:
- If any critical component (source, credentials approach, delivery channel, or schedule) is unclear, set `is_complete=False` and supply 1 to 3 targeted `missing_questions`.
- If the user's initial prompt or follow-up answers provide sufficient clarity for an engineer to build it, set `is_complete=True`, leave `missing_questions` empty, and lock down the specification fields.
- Ensure `name` is a clean snake_case identifier (e.g., `gmail_summarizer_bot`).
- Ensure `required_secrets` enumerates all necessary UPPERCASE environment variables.
"""


def evaluate_requirement(state: TeacherState) -> ProcessSpec:
    """Evaluate the user's requirement and conversation history.

    Returns a ProcessSpec indicating whether the specification is complete or
    clarifying questions are needed.
    """
    history_formatted = "\n".join(
        f"{turn.get('role', 'user').capitalize()}: {turn.get('content', '')}"
        for turn in state.conversation_history
    )

    prompt = f"""User's Original Request:
{state.raw_user_request}

Conversation History (Questions & Answers so far):
{history_formatted if history_formatted else "(No prior turns)"}

Please evaluate the requirement against the criteria and return the structured ProcessSpecModel.
"""

    model_spec: ProcessSpecModel = generate_structured(
        prompt=prompt,
        system_instruction=INTERVIEWER_SYSTEM_INSTRUCTION,
        schema_cls=ProcessSpecModel,
    )

    spec = ProcessSpec(
        name=model_spec.name,
        trigger_type=model_spec.trigger_type,
        processing_steps=model_spec.processing_steps,
        delivery_channel=model_spec.delivery_channel,
        required_secrets=model_spec.required_secrets,
        schedule=model_spec.schedule,
        is_complete=model_spec.is_complete,
        missing_questions=model_spec.missing_questions,
    )

    state.spec = spec
    return spec
