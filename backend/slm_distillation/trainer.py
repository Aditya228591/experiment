"""Trainer: Distills and trains the MicroSLM on the synthetic sample space."""

import json
import math
import os
import time
from pathlib import Path
from typing import Callable, Dict, List, Optional, Tuple

import torch
from torch.optim import AdamW

from slm_distillation.dataset_generator import DataSample, GeneratedSampleSpace, split_sample_space
from slm_distillation.micro_slm import CharacterSubwordTokenizer, MicroSLM
from slm_distillation.slm_architect import SLMBlueprint


class TrainingProgress(dict):
    """Container for epoch training metrics."""
    pass


def prepare_training_tensors(
    samples: List[DataSample],
    tokenizer: CharacterSubwordTokenizer,
    max_seq_len: int = 128,
) -> Tuple[torch.Tensor, torch.Tensor]:
    """Tokenize and pad training samples into input and target tensors for next-token prediction."""
    input_tensors = []
    target_tensors = []

    pad_id = tokenizer.token_to_id[CharacterSubwordTokenizer.PAD_TOKEN]

    for sample in samples:
        # Instruction-response formatting
        full_text = f"Input: {sample.input_text}\nResponse: {sample.target_output}"
        tokens = tokenizer.encode(full_text, add_special_tokens=True)

        if len(tokens) > max_seq_len + 1:
            tokens = tokens[: max_seq_len + 1]

        # Shifted input and target sequence
        in_seq = tokens[:-1]
        tgt_seq = tokens[1:]

        # Pad sequences
        pad_len = max_seq_len - len(in_seq)
        if pad_len > 0:
            in_seq = in_seq + [pad_id] * pad_len
            tgt_seq = tgt_seq + [pad_id] * pad_len

        input_tensors.append(in_seq)
        target_tensors.append(tgt_seq)

    return (
        torch.tensor(input_tensors, dtype=torch.long),
        torch.tensor(target_tensors, dtype=torch.long),
    )


def train_micro_slm(
    blueprint: SLMBlueprint,
    sample_space: GeneratedSampleSpace,
    save_dir: str = "trained_models",
    progress_callback: Optional[Callable[[Dict], None]] = None,
) -> Dict:
    """Distill and train the MicroSLM on the generated sample space.

    Args:
        blueprint: Architecture and hyperparameters.
        sample_space: Synthetic training examples.
        save_dir: Directory where model weights and vocab will be saved.
        progress_callback: Optional callback receiving live metrics dict each epoch.

    Returns:
        Summary dictionary with training results, metrics, and artifact paths.
    """
    hp = blueprint.hyperparameters
    model_name = blueprint.task_name

    # 1. Prepare Tokenizer
    all_texts = [f"Input: {s.input_text}\nResponse: {s.target_output}" for s in sample_space.samples]
    tokenizer = CharacterSubwordTokenizer()
    tokenizer.fit_on_texts(all_texts, max_vocab_size=hp.vocab_size)

    # 2. Split Data & Build Tensors
    train_samples, val_samples = split_sample_space(sample_space)
    if not val_samples:
        val_samples = train_samples[: max(1, len(train_samples) // 5)]

    X_train, Y_train = prepare_training_tensors(train_samples, tokenizer, hp.max_seq_len)
    X_val, Y_val = prepare_training_tensors(val_samples, tokenizer, hp.max_seq_len)

    # 3. Initialize Model
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = MicroSLM(
        vocab_size=tokenizer.vocab_size,
        d_model=hp.d_model,
        n_heads=hp.n_heads,
        n_layers=hp.n_layers,
        dim_feedforward=hp.dim_feedforward,
        max_seq_len=hp.max_seq_len,
        dropout=hp.dropout,
    ).to(device)

    total_params = model.count_parameters()

    # 4. Optimizer & Training Loop
    optimizer = AdamW(model.parameters(), lr=hp.learning_rate, weight_decay=0.01)

    batch_size = min(hp.batch_size, len(X_train))
    num_samples = len(X_train)
    num_batches = max(1, math.ceil(num_samples / batch_size))

    start_time = time.time()
    history = []

    for epoch in range(1, hp.epochs + 1):
        model.train()
        total_loss = 0.0

        # Shuffle indices
        perm = torch.randperm(num_samples)
        X_train_shuffled = X_train[perm]
        Y_train_shuffled = Y_train[perm]

        for b in range(num_batches):
            start_idx = b * batch_size
            end_idx = min(start_idx + batch_size, num_samples)

            xb = X_train_shuffled[start_idx:end_idx].to(device)
            yb = Y_train_shuffled[start_idx:end_idx].to(device)

            optimizer.zero_grad()
            _, loss = model(xb, yb)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()

            total_loss += loss.item()

        avg_train_loss = total_loss / num_batches

        # Validation pass
        model.eval()
        with torch.no_grad():
            xv = X_val.to(device)
            yv = Y_val.to(device)
            _, val_loss_tensor = model(xv, yv)
            val_loss = val_loss_tensor.item() if val_loss_tensor is not None else avg_train_loss

        perplexity = math.exp(min(val_loss, 20.0))

        epoch_stats = {
            "epoch": epoch,
            "total_epochs": hp.epochs,
            "train_loss": round(avg_train_loss, 4),
            "val_loss": round(val_loss, 4),
            "perplexity": round(perplexity, 2),
            "elapsed_seconds": round(time.time() - start_time, 2),
        }
        history.append(epoch_stats)

        if progress_callback:
            progress_callback(epoch_stats)

    total_time = round(time.time() - start_time, 2)

    # 5. Save Artifacts
    target_dir = Path(save_dir) / model_name
    target_dir.mkdir(parents=True, exist_ok=True)

    model_path = target_dir / "model.pt"
    vocab_path = target_dir / "vocab.json"
    config_path = target_dir / "config.json"
    dataset_path = target_dir / "training_data.jsonl"

    # Save model state dict
    torch.save(model.state_dict(), model_path)

    # Save tokenizer vocabulary
    with open(vocab_path, "w", encoding="utf-8") as f:
        json.dump(tokenizer.to_dict(), f, indent=2)

    # Save config
    full_config = {
        "task_name": model_name,
        "display_title": blueprint.display_title,
        "purpose_summary": blueprint.purpose_summary,
        "system_instruction": blueprint.system_instruction,
        "hyperparameters": hp.model_dump(),
        "total_parameters": total_params,
        "final_train_loss": history[-1]["train_loss"],
        "final_val_loss": history[-1]["val_loss"],
        "final_perplexity": history[-1]["perplexity"],
        "training_time_seconds": total_time,
        "vocab_size": tokenizer.vocab_size,
    }
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(full_config, f, indent=2)

    # Save dataset JSONL
    with open(dataset_path, "w", encoding="utf-8") as f:
        for sample in sample_space.samples:
            f.write(json.dumps(sample.model_dump()) + "\n")

    return {
        "model_name": model_name,
        "status": "completed",
        "save_dir": str(target_dir.resolve()),
        "total_parameters": total_params,
        "training_time_seconds": total_time,
        "final_train_loss": history[-1]["train_loss"],
        "final_val_loss": history[-1]["val_loss"],
        "final_perplexity": history[-1]["perplexity"],
        "history": history,
    }
