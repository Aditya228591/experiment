"""Hugging Face Fine-Tuning & Distillation Script (SmollLM / TinyLlama / Qwen)."""

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
                "text": f"<|im_start|>user\n{item['input_text']}<|im_end|>\n<|im_start|>assistant\n{item['target_output']}<|im_end|>"
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
