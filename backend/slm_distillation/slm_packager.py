"""Packager: Exports the trained Small Language Model into a self-contained, deployable package."""

import json
import shutil
from pathlib import Path
from typing import Dict, Optional


SERVE_PY_TEMPLATE = '''"""Standalone Inference Server & CLI for Distilled Small Language Model."""

import argparse
import json
import os
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import torch
import torch.nn as nn
import torch.nn.functional as F

# Embed minimal MicroSLM and Tokenizer for 100% standalone execution
class StandaloneTokenizer:
    def __init__(self, vocab_dict):
        self.token_to_id = vocab_dict
        self.id_to_token = {v: k for k, v in vocab_dict.items()}

    def encode(self, text):
        unk_id = self.token_to_id.get("<unk>", 1)
        tokens = [self.token_to_id.get("<bos>", 2)]
        i, n = 0, len(text)
        while i < n:
            matched = False
            for length in range(min(6, n - i), 1, -1):
                chunk = text[i : i + length]
                if chunk in self.token_to_id:
                    tokens.append(self.token_to_id[chunk])
                    i += length
                    matched = True
                    break
            if not matched:
                tokens.append(self.token_to_id.get(text[i], unk_id))
                i += 1
        tokens.append(self.token_to_id.get("<eos>", 3))
        return tokens

    def decode(self, ids):
        specials = {"<pad>", "<unk>", "<bos>", "<eos>", "<sep>"}
        return "".join(self.id_to_token.get(i, "") for i in ids if self.id_to_token.get(i, "") not in specials)

class TransformerBlock(nn.Module):
    def __init__(self, d_model, n_heads, dim_feedforward, dropout=0.0):
        super().__init__()
        self.d_model = d_model
        self.n_heads = n_heads
        self.head_dim = d_model // n_heads
        self.q_proj = nn.Linear(d_model, d_model)
        self.k_proj = nn.Linear(d_model, d_model)
        self.v_proj = nn.Linear(d_model, d_model)
        self.out_proj = nn.Linear(d_model, d_model)
        self.ln1 = nn.LayerNorm(d_model)
        self.ln2 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, dim_feedforward),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(dim_feedforward, d_model),
            nn.Dropout(dropout),
        )

    def forward(self, x):
        b, seq_len, _ = x.shape
        norm_x = self.ln1(x)
        q = self.q_proj(norm_x).view(b, seq_len, self.n_heads, self.head_dim).transpose(1, 2)
        k = self.k_proj(norm_x).view(b, seq_len, self.n_heads, self.head_dim).transpose(1, 2)
        v = self.v_proj(norm_x).view(b, seq_len, self.n_heads, self.head_dim).transpose(1, 2)
        attn_out = F.scaled_dot_product_attention(q, k, v, is_causal=True)
        attn_out = attn_out.transpose(1, 2).contiguous().view(b, seq_len, self.d_model)
        x = x + self.out_proj(attn_out)
        x = x + self.ffn(self.ln2(x))
        return x

class StandaloneMicroSLM(nn.Module):
    def __init__(self, vocab_size, d_model=128, n_heads=4, n_layers=3, dim_feedforward=512, max_seq_len=128):
        super().__init__()
        self.max_seq_len = max_seq_len
        self.token_embedding = nn.Embedding(vocab_size, d_model)
        self.pos_embedding = nn.Embedding(max_seq_len, d_model)
        self.layers = nn.ModuleList([TransformerBlock(d_model, n_heads, dim_feedforward) for _ in range(n_layers)])
        self.ln_f = nn.LayerNorm(d_model)
        self.lm_head = nn.Linear(d_model, vocab_size, bias=False)
        self.lm_head.weight = self.token_embedding.weight

    def forward(self, input_ids):
        b, seq_len = input_ids.shape
        pos = torch.arange(0, seq_len, dtype=torch.long, device=input_ids.device).unsqueeze(0)
        x = self.token_embedding(input_ids) + self.pos_embedding(pos)
        for layer in self.layers:
            x = layer(x)
        return self.lm_head(self.ln_f(x))

    @torch.no_grad()
    def generate(self, input_ids, max_new_tokens=64, temperature=0.7, eos_id=3):
        self.eval()
        for _ in range(max_new_tokens):
            idx_cond = input_ids[:, -self.max_seq_len:]
            logits = self(idx_cond)[:, -1, :] / max(temperature, 1e-5)
            probs = F.softmax(logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)
            input_ids = torch.cat((input_ids, next_token), dim=1)
            if eos_id is not None and next_token.item() == eos_id:
                break
        return input_ids

def load_pipeline(base_dir=None):
    base = Path(base_dir or os.path.dirname(os.path.abspath(__file__)))
    with open(base / "vocab.json", "r", encoding="utf-8") as f:
        vocab = json.load(f)
    with open(base / "config.json", "r", encoding="utf-8") as f:
        config = json.load(f)

    hp = config.get("hyperparameters", {})
    tokenizer = StandaloneTokenizer(vocab)
    model = StandaloneMicroSLM(
        vocab_size=len(vocab),
        d_model=hp.get("d_model", 128),
        n_heads=hp.get("n_heads", 4),
        n_layers=hp.get("n_layers", 3),
        dim_feedforward=hp.get("dim_feedforward", 512),
        max_seq_len=hp.get("max_seq_len", 128),
    )
    model.load_state_dict(torch.load(base / "model.pt", map_location="cpu", weights_only=True))
    model.eval()
    return model, tokenizer, config

def predict(prompt: str, model=None, tokenizer=None, max_new_tokens=64, temperature=0.7):
    if model is None or tokenizer is None:
        model, tokenizer, _ = load_pipeline()
    full_prompt = f"Input: {prompt}\\nResponse: "
    ids = tokenizer.encode(full_prompt)
    if ids and ids[-1] == 3:  # strip eos
        ids = ids[:-1]
    in_tensor = torch.tensor([ids], dtype=torch.long)
    out_ids = model.generate(in_tensor, max_new_tokens=max_new_tokens, temperature=temperature, eos_id=3)
    gen_ids = out_ids[0][len(ids):].tolist()
    resp = tokenizer.decode(gen_ids).strip()
    return resp.split("Input:")[0].strip()

def main():
    parser = argparse.ArgumentParser(description="Standalone Micro-SLM CLI")
    parser.add_argument("--prompt", type=str, help="Single prompt to evaluate")
    parser.add_argument("--server", action="store_true", help="Launch FastAPI REST server on port 8000")
    parser.add_argument("--temp", type=float, default=0.7, help="Sampling temperature")
    args = parser.parse_args()

    if args.server:
        import uvicorn
        from fastapi import FastAPI
        from pydantic import BaseModel
        app = FastAPI(title="Micro-SLM Edge Server")
        model, tokenizer, config = load_pipeline()

        class Query(BaseModel):
            prompt: str
            temperature: float = 0.7
            max_tokens: int = 64

        @app.post("/predict")
        def api_predict(q: Query):
            ans = predict(q.prompt, model, tokenizer, q.max_tokens, q.temperature)
            return {"prompt": q.prompt, "response": ans, "model": config.get("task_name")}

        print("Starting Micro-SLM Edge API on http://localhost:8000...")
        uvicorn.run(app, host="0.0.0.0", port=8000)
    elif args.prompt:
        ans = predict(args.prompt, temperature=args.temp)
        print(f"\\nPrompt: {args.prompt}")
        print(f"Response: {ans}\\n")
    else:
        print("Interactive Micro-SLM Shell (type 'exit' to quit):")
        model, tokenizer, _ = load_pipeline()
        while True:
            try:
                inp = input("\\nPrompt > ").strip()
                if inp.lower() in ("exit", "quit"):
                    break
                if inp:
                    print("Output >", predict(inp, model, tokenizer, temperature=args.temp))
            except KeyboardInterrupt:
                break

if __name__ == "__main__":
    main()
'''

HF_TRAIN_TEMPLATE = '''"""Hugging Face Fine-Tuning & Distillation Script (SmollLM / TinyLlama / Qwen)."""

import json
from datasets import Dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from trl import SFTTrainer
from peft import LoraConfig, get_peft_model

BASE_MODEL = "HuggingFaceTB/SmollLM-135M"  # Or "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

def load_local_dataset(jsonl_path="training_data.jsonl"):
    data = []
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            item = json.loads(line)
            data.append({
                "text": f"<|im_start|>user\\n{item['input_text']}<|im_end|>\\n<|im_start|>assistant\\n{item['target_output']}<|im_end|>"
            })
    return Dataset.from_list(data)

def main():
    print(f"Loading Base Model: {BASE_MODEL}...")
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(BASE_MODEL, torch_dtype="auto")
    peft_config = LoraConfig(
        r=8,
        lora_alpha=16,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )
    model = get_peft_model(model, peft_config)

    dataset = load_local_dataset()
    training_args = TrainingArguments(
        output_dir="./hf_distilled_weights",
        per_device_train_batch_size=4,
        gradient_accumulation_steps=2,
        num_train_epochs=3,
        learning_rate=2e-4,
        logging_steps=5,
        save_strategy="epoch",
        fp16=True,
    )

    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=256,
        args=training_args,
    )
    print("Beginning LoRA fine-tuning...")
    trainer.train()
    trainer.save_model("./hf_distilled_weights")
    print("Model successfully fine-tuned and saved to ./hf_distilled_weights!")

if __name__ == "__main__":
    main()
'''


def package_slm(trained_model_dir: str, export_base_dir: str = "exported_slm") -> Path:
    """Package a trained model folder into a fully self-contained deployable bundle.

    Args:
        trained_model_dir: Source folder with model.pt, config.json, vocab.json.
        export_base_dir: Destination root folder.

    Returns:
        Path to the exported directory.
    """
    src = Path(trained_model_dir)
    if not src.exists():
        raise FileNotFoundError(f"Source model dir {trained_model_dir} does not exist.")

    with open(src / "config.json", "r", encoding="utf-8") as f:
        config = json.load(f)

    task_name = config.get("task_name", "custom_slm")
    dest = Path(export_base_dir) / task_name
    dest.mkdir(parents=True, exist_ok=True)

    # 1. Copy core weights, vocab, config, dataset
    for fname in ["model.pt", "vocab.json", "config.json", "training_data.jsonl"]:
        if (src / fname).exists():
            shutil.copy2(src / fname, dest / fname)

    # 2. Write standalone serve.py
    with open(dest / "serve.py", "w", encoding="utf-8") as f:
        f.write(SERVE_PY_TEMPLATE)

    # 3. Write Hugging Face upscale training script
    with open(dest / "train_hf.py", "w", encoding="utf-8") as f:
        f.write(HF_TRAIN_TEMPLATE)

    # 4. Write requirements.txt
    with open(dest / "requirements.txt", "w", encoding="utf-8") as f:
        f.write("torch>=2.0.0\nfastapi>=0.100.0\nuvicorn>=0.20.0\n")

    # 5. Write README.md
    hp = config.get("hyperparameters", {})
    readme_text = f"""# {config.get('display_title', task_name.title())}

**Distilled Small Language Model (SLM)** — Generated by **Teacher AI**.

## Model Card
- **Task Identity:** `{task_name}`
- **Purpose:** {config.get('purpose_summary', 'Automated task model')}
- **Parameter Count:** {config.get('total_parameters', 0):,} parameters
- **Architecture:** {hp.get('n_layers', 3)} Layers, {hp.get('n_heads', 4)} Attention Heads, {hp.get('d_model', 128)} Embedding Dim
- **Vocab Size:** {config.get('vocab_size', 512)} tokens
- **Training Time:** {config.get('training_time_seconds', 0)}s on CPU/GPU
- **Final Perplexity:** {config.get('final_perplexity', 0)}

---

## Quickstart Setup

### 1. Install Dependencies
Only PyTorch is needed:
```bash
pip install -r requirements.txt
```

### 2. Run CLI Prediction
```bash
python serve.py --prompt "Your task input here"
```

### 3. Interactive Shell
```bash
python serve.py
```

### 4. Run Edge REST API Server
```bash
python serve.py --server
```
Then send requests via curl:
```bash
curl -X POST http://localhost:8000/predict \\
  -H "Content-Type: application/json" \\
  -d '{{"prompt": "Your input query"}}'
```

---

## Scaling Up (Optional Hugging Face Distillation)
If you want to scale this task from the local Micro-SLM to a larger 135M or 1.1B parameter foundation model:
```bash
pip install transformers datasets trl peft
python train_hf.py
```

*Crafted by Teacher AI — The Autonomous Language Model Distiller.*
"""
    with open(dest / "README.md", "w", encoding="utf-8") as f:
        f.write(readme_text)

    return dest.resolve()
