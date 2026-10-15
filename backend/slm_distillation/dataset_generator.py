"""Synthetic Sample Space Generator: Uses Teacher AI to generate domain-specific training data."""

import json
import random
from typing import List, Optional
from pydantic import BaseModel, Field

from core.brain import generate_structured, is_configured
from slm_distillation.slm_architect import SLMBlueprint


class DataSample(BaseModel):
    """A single synthetic input-output training example."""

    id: int
    input_text: str = Field(description="The input prompt or query presented to the Small Language Model")
    target_output: str = Field(description="The gold-standard output or response expected from the model")
    category: str = Field(default="standard", description="Subcategory, tag, or intent label")
    is_edge_case: bool = Field(default=False, description="Whether this represents a boundary or tricky edge case")


class GeneratedSampleSpace(BaseModel):
    """Container for the full synthesized dataset."""

    task_name: str
    samples: List[DataSample] = Field(default_factory=list)


DATASET_GENERATOR_SYSTEM_PROMPT = """You are an expert Data Synthesizer and Teacher AI.
Your job is to generate a rich, diverse, realistic synthetic dataset (sample space) to train/distill a Small Language Model (SLM) for a specific user automation task.

Guidelines:
1. Diversity: Vary vocabulary, query lengths, formal vs informal phrasing, typos, and syntax.
2. Consistency: Strictly adhere to the requested output format (JSON, key-value, or structured text).
3. Realism: Do NOT use repetitive filler like 'Sample 1', 'Sample 2'. Write genuine, domain-relevant examples.
4. Edge Cases: Include 15-20% tricky or boundary cases (e.g. incomplete queries, negation, unusual requests).
"""


def generate_sample_space(
    blueprint: SLMBlueprint,
    target_count: Optional[int] = None,
) -> GeneratedSampleSpace:
    """Generate the synthetic sample space using Teacher AI (Gemini).

    Args:
        blueprint: The architecture and sample space blueprint.
        target_count: Number of examples to generate (defaults to blueprint.sample_space.sample_size).

    Returns:
        GeneratedSampleSpace with training pairs.
    """
    count = target_count or blueprint.sample_space.sample_size
    # Clamp between 10 and 60 for fast generation in interactive workflows
    count = max(10, min(count, 60))

    if not is_configured():
        return _generate_heuristic_samples(blueprint, count)

    prompt = f"""Task: {blueprint.display_title}
Task Name: {blueprint.task_name}
Domain: {blueprint.sample_space.task_domain}
System Instruction: {blueprint.system_instruction}

Input Format Description: {blueprint.sample_space.input_format}
Output Format Description: {blueprint.sample_space.output_format}

Representative Example:
Input: {blueprint.sample_space.example_input}
Output: {blueprint.sample_space.example_output}

Target Categories/Tags: {', '.join(blueprint.sample_space.categories_or_tags)}
Edge Cases to Cover: {', '.join(blueprint.sample_space.edge_cases)}

Generate exactly {count} distinct, realistic, high-quality training pairs (id: 1 to {count}).
Adhere strictly to GeneratedSampleSpace schema.
"""
    try:
        sample_space = generate_structured(
            prompt=prompt,
            system_instruction=DATASET_GENERATOR_SYSTEM_PROMPT,
            schema_cls=GeneratedSampleSpace,
        )
        if not sample_space.samples:
            return _generate_heuristic_samples(blueprint, count)
        return sample_space
    except Exception:
        return _generate_heuristic_samples(blueprint, count)


def _generate_heuristic_samples(blueprint: SLMBlueprint, count: int) -> GeneratedSampleSpace:
    """Generate structured synthetic samples when operating offline."""
    domain = blueprint.sample_space.task_domain.lower()
    categories = blueprint.sample_space.categories_or_tags or ["general", "urgent", "inquiry", "action_required"]
    samples: List[DataSample] = []

    # Domain-specific templates
    if "support" in domain or "ticket" in domain or "customer" in domain:
        templates = [
            ("My account is locked and I cannot reset my password via email.", "Account Access", "High", "Please verify your security question to unlock."),
            ("How do I upgrade to the enterprise plan for my team of 15?", "Sales / Billing", "Medium", "Enterprise tiers start at 10+ users with dedicated support."),
            ("I was charged twice on my invoice #INV-9821 this morning.", "Billing Error", "High", "We have initiated a refund for the duplicate transaction."),
            ("Where can I find the API documentation for webhook webhooks?", "Technical", "Low", "Full documentation is available at docs.example.com/webhooks."),
            ("The dashboard is throwing a 500 error when exporting CSV files.", "Bug Report", "High", "Our engineering team has identified the CSV export issue."),
            ("Can you add a dark mode toggle to the mobile application?", "Feature Request", "Low", "Dark mode is slated for the upcoming Q3 release."),
            ("Cancel my subscription immediately and delete all stored data.", "Churn / Cancellation", "Urgent", "Your subscription is cancelled. Data deletion scheduled in 30 days."),
            ("Is multi-factor authentication (MFA) supported with YubiKey?", "Security", "Medium", "Hardware security keys via FIDO2/WebAuthn are fully supported."),
        ]
        for i in range(1, count + 1):
            base = templates[(i - 1) % len(templates)]
            is_edge = i % 5 == 0
            cat = categories[(i - 1) % len(categories)]
            
            # Format output based on blueprint specification (Natural Language bulleted summary vs JSON)
            if "json" in (blueprint.sample_space.output_format or "").lower():
                target_out = json.dumps({"category": base[1], "priority": base[2], "suggested_reply": base[3]})
            else:
                target_out = (
                    f"Priority: {base[2]} | Intent: {base[1]}\n"
                    f"Summary: Customer inquiry regarding {base[1].lower()}.\n"
                    f"Suggested Reply: {base[3]}"
                )

            samples.append(
                DataSample(
                    id=i,
                    input_text=f"Ticket: {base[0]} (Ref #{1000 + i})",
                    target_output=target_out,
                    category=cat,
                    is_edge_case=is_edge,
                )
            )
    elif "code" in domain or "sql" in domain or "extract" in domain:
        templates = [
            ("Find all users who signed up in the last 30 days and spent over $100.", "SELECT * FROM users JOIN orders ON users.id = orders.user_id WHERE users.created_at >= NOW() - INTERVAL '30 days' GROUP BY users.id HAVING SUM(orders.amount) > 100;"),
            ("Get total revenue per product category sorted descending.", "SELECT category, SUM(price * quantity) AS total_revenue FROM order_items GROUP BY category ORDER BY total_revenue DESC;"),
            ("Count number of active subscriptions grouped by billing cycle.", "SELECT plan_cycle, COUNT(*) AS active_count FROM subscriptions WHERE status = 'active' GROUP BY plan_cycle;"),
            ("List employees whose salary is above the company average.", "SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);"),
        ]
        for i in range(1, count + 1):
            base = templates[(i - 1) % len(templates)]
            samples.append(
                DataSample(
                    id=i,
                    input_text=f"Query: {base[0]}",
                    target_output=f"SQL: {base[1]}",
                    category="sql_generation",
                    is_edge_case=(i % 6 == 0),
                )
            )
    else:
        # General purpose task templates
        for i in range(1, count + 1):
            samples.append(
                DataSample(
                    id=i,
                    input_text=f"Input prompt {i} for {blueprint.display_title}: Process request variant {i}.",
                    target_output=f"Output {i}: Completed task with status=success, intent={categories[(i - 1) % len(categories)]}.",
                    category=categories[(i - 1) % len(categories)],
                    is_edge_case=(i % 5 == 0),
                )
            )

    return GeneratedSampleSpace(task_name=blueprint.task_name, samples=samples)


def split_sample_space(sample_space: GeneratedSampleSpace, train_ratio: float = 0.8):
    """Split sample space into deterministic train and validation sets."""
    samples = list(sample_space.samples)
    random.seed(42)
    random.shuffle(samples)

    split_idx = int(len(samples) * train_ratio)
    train_samples = samples[:split_idx]
    val_samples = samples[split_idx:]
    return train_samples, val_samples
