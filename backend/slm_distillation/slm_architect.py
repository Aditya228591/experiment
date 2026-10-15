"""SLM Architect: Analyzes user requirements and recommends optimal Small Language Model parameters."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field

from core.brain import generate_structured, is_configured


class ModelHyperparameters(BaseModel):
    """Configurable hyperparameters for the target Small Language Model."""

    architecture_type: str = Field(
        default="nano_transformer",
        description="Architecture: 'nano_transformer' (local fast CPU/GPU PyTorch) or 'hf_lora' (HuggingFace SmollLM/TinyLlama)",
    )
    vocab_size: int = Field(default=512, description="Target tokenizer vocabulary size")
    d_model: int = Field(default=128, description="Hidden embedding dimension (64, 128, 256)")
    n_heads: int = Field(default=4, description="Multi-head attention count (2, 4, 8)")
    n_layers: int = Field(default=3, description="Transformer encoder/decoder block count (2, 3, 4, 6)")
    dim_feedforward: int = Field(default=512, description="Dimension of inner FFN layer")
    max_seq_len: int = Field(default=128, description="Maximum token sequence length")
    learning_rate: float = Field(default=0.001, description="AdamW optimizer learning rate")
    epochs: int = Field(default=25, description="Training epochs (10-50)")
    batch_size: int = Field(default=8, description="Batch size (4, 8, 16)")
    dropout: float = Field(default=0.1, description="Dropout rate for regularization")


class SampleSpaceConfig(BaseModel):
    """Specification of the training dataset sample space."""

    task_domain: str = Field(description="Domain of the task, e.g. 'Customer Service', 'Code', 'Finance'")
    sample_size: int = Field(default=40, description="Recommended synthetic dataset size (20-100)")
    input_format: str = Field(description="Description of input prompt style, e.g. 'Ticket: <text>'")
    output_format: str = Field(description="Expected output structure, e.g. 'JSON: {\"category\": \"...\", \"reply\": \"...\"}'")
    example_input: str = Field(description="Concrete representative input example")
    example_output: str = Field(description="Concrete representative output example")
    categories_or_tags: List[str] = Field(
        default_factory=list,
        description="Target categories, entities, or labels involved in the task",
    )
    edge_cases: List[str] = Field(
        default_factory=list,
        description="Edge cases or noisy inputs to deliberately include in sample space",
    )


class SLMBlueprint(BaseModel):
    """Complete blueprint for synthesizing, distilling, and training the Small Language Model."""

    task_name: str = Field(description="Concise snake_case identifier for this model, e.g. 'support_intent_slm'")
    display_title: str = Field(description="Human readable title, e.g. 'Customer Support Intent & Triage Micro-Model'")
    purpose_summary: str = Field(description="1-2 sentence summary of what this Small Language Model does")
    system_instruction: str = Field(description="System prompt embedded into the model behavior")
    hyperparameters: ModelHyperparameters = Field(default_factory=ModelHyperparameters)
    sample_space: SampleSpaceConfig


ARCHITECT_SYSTEM_PROMPT = """You are an expert AI Systems Architect specializing in Knowledge Distillation and Small Language Models (SLMs).
Your job is to take a user's plain-English automation or task requirement and design the optimal Small Language Model (SLM) architecture, hyperparameters, and synthetic sample space.

Design Principles:
1. Target Model Efficiency: The SLM should be compact, fast, and purpose-built for the user's specific domain (classification, extraction, summarization, or structured completion).
2. Sample Space: Define clear input/output formats, representative examples, and edge cases for the Teacher AI to generate.
3. Realistic Hyperparameters:
   - For fast local CPU execution: d_model=128, n_heads=4, n_layers=3, vocab_size=512, max_seq_len=128, epochs=25.
   - For slightly more complex tasks: d_model=256, n_heads=8, n_layers=4, max_seq_len=256.
4. Output Format: Strongly prefer structured outputs (e.g. Clean Key-Value or compact JSON) for high fidelity and predictability.
"""


def design_slm_blueprint(user_prompt: str, base_architecture: str = "nano_transformer") -> SLMBlueprint:
    """Generate an optimal SLM blueprint based on the user's task description.

    If Gemini is not configured, provides a high-quality heuristic fallback blueprint.
    """
    if not is_configured():
        return _fallback_blueprint(user_prompt, base_architecture)

    prompt = f"""User Automation / Model Requirement:
"{user_prompt}"

Preferred Base Architecture: {base_architecture}

Please design the complete SLMBlueprint including task identity, system instruction, model hyperparameters, and synthetic sample space specifications.
"""
    try:
        blueprint = generate_structured(
            prompt=prompt,
            system_instruction=ARCHITECT_SYSTEM_PROMPT,
            schema_cls=SLMBlueprint,
        )
        if base_architecture:
            blueprint.hyperparameters.architecture_type = base_architecture
        return blueprint
    except Exception:
        return _fallback_blueprint(user_prompt, base_architecture)


def _fallback_blueprint(user_prompt: str, base_architecture: str = "nano_transformer") -> SLMBlueprint:
    """Generate a high-quality fallback blueprint when offline or API key is absent."""
    clean_name = "".join(c if c.isalnum() else "_" for c in user_prompt.lower()[:30]).strip("_")
    if not clean_name:
        clean_name = "custom_task_slm"

    return SLMBlueprint(
        task_name=clean_name,
        display_title=user_prompt.title()[:45] if user_prompt else "Custom Task Assistant",
        purpose_summary=f"Specialized Small Language Model engineered to automate: {user_prompt}",
        system_instruction="You are a compact, specialized AI assistant. Respond directly and accurately according to your trained domain.",
        hyperparameters=ModelHyperparameters(
            architecture_type=base_architecture,
            vocab_size=512,
            d_model=128,
            n_heads=4,
            n_layers=3,
            dim_feedforward=512,
            max_seq_len=128,
            learning_rate=0.001,
            epochs=25,
            batch_size=8,
            dropout=0.1,
        ),
        sample_space=SampleSpaceConfig(
            task_domain="General Automation",
            sample_size=35,
            input_format="Task Input: <text>",
            output_format="Result: <output>",
            example_input="Sample task query for this domain",
            example_output="Concise, structured result matching the user purpose",
            categories_or_tags=["primary_task", "edge_case", "standard_query"],
            edge_cases=["Missing information in input", "Ambiguous phrasing", "Multi-intent input"],
        ),
    )
