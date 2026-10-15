"""Inference engine for running predictions with trained MicroSLM models."""

import json
import time
from pathlib import Path
from typing import Dict, Optional

import torch

from slm_distillation.micro_slm import CharacterSubwordTokenizer, MicroSLM

# Cache loaded models in memory for instant responses
_LOADED_MODELS: Dict[str, Dict] = {}


def load_trained_slm(model_dir: str) -> Dict:
    """Load model, tokenizer, and config from directory."""
    path = Path(model_dir)
    if str(path.resolve()) in _LOADED_MODELS:
        return _LOADED_MODELS[str(path.resolve())]

    model_path = path / "model.pt"
    vocab_path = path / "vocab.json"
    config_path = path / "config.json"

    if not model_path.exists() or not vocab_path.exists():
        raise FileNotFoundError(f"Model artifacts not found in {model_dir}")

    with open(vocab_path, "r", encoding="utf-8") as f:
        vocab = json.load(f)
    tokenizer = CharacterSubwordTokenizer.from_dict(vocab)

    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    hp = config.get("hyperparameters", {})
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = MicroSLM(
        vocab_size=len(vocab),
        d_model=hp.get("d_model", 128),
        n_heads=hp.get("n_heads", 4),
        n_layers=hp.get("n_layers", 3),
        dim_feedforward=hp.get("dim_feedforward", 512),
        max_seq_len=hp.get("max_seq_len", 128),
        dropout=0.0,
    ).to(device)

    state_dict = torch.load(model_path, map_location=device, weights_only=True)
    model.load_state_dict(state_dict)
    model.eval()

    bundle = {
        "model": model,
        "tokenizer": tokenizer,
        "config": config,
        "device": device,
    }
    _LOADED_MODELS[str(path.resolve())] = bundle
    return bundle


def run_slm_inference(
    model_dir: str,
    user_input: str,
    max_new_tokens: int = 64,
    temperature: float = 0.7,
) -> Dict:
    """Execute inference with the trained MicroSLM on user input.

    Args:
        model_dir: Path to directory containing model.pt and config.
        user_input: The raw query or prompt.
        max_new_tokens: Number of tokens to generate.
        temperature: Sampling temperature.

    Returns:
        Dictionary containing response_text, latency_ms, token_count, and model info.
    """
    bundle = load_trained_slm(model_dir)
    model: MicroSLM = bundle["model"]
    tokenizer: CharacterSubwordTokenizer = bundle["tokenizer"]
    device = bundle["device"]

    formatted_prompt = f"Input: {user_input}\nResponse: "
    input_ids = tokenizer.encode(formatted_prompt, add_special_tokens=True)
    # Remove the trailing EOS token from prompt so the model continues generating
    if input_ids and input_ids[-1] == tokenizer.token_to_id[CharacterSubwordTokenizer.EOS_TOKEN]:
        input_ids = input_ids[:-1]

    input_tensor = torch.tensor([input_ids], dtype=torch.long, device=device)

    start_time = time.perf_counter()
    with torch.no_grad():
        output_ids = model.generate(
            input_tensor,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            eos_token_id=tokenizer.token_to_id[CharacterSubwordTokenizer.EOS_TOKEN],
        )
    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

    # Slice off the prompt tokens to get only the generated continuation
    new_token_ids = output_ids[0][len(input_ids) :].tolist()
    raw_response = tokenizer.decode(new_token_ids, skip_special_tokens=True).strip()

    # Clean response string if EOS or next input is predicted
    if "Input:" in raw_response:
        raw_response = raw_response.split("Input:")[0].strip()

    return {
        "response": raw_response if raw_response else "(Empty response)",
        "latency_ms": latency_ms,
        "tokens_generated": len(new_token_ids),
        "tokens_per_second": round(len(new_token_ids) / max(latency_ms / 1000, 0.001), 1),
        "model_name": bundle["config"].get("task_name", "MicroSLM"),
        "total_parameters": bundle["config"].get("total_parameters", 0),
    }
