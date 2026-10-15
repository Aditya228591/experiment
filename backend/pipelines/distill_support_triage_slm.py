"""Distill and Package Custom Customer Support Triage & Auto-Reply Small Language Model."""

import os
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure backend package root is on sys.path
_backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

from slm_distillation.slm_architect import SLMBlueprint, ModelHyperparameters, SampleSpaceConfig
from slm_distillation.dataset_generator import generate_sample_space
from slm_distillation.trainer import train_micro_slm
from slm_distillation.inference import run_slm_inference
from slm_distillation.slm_packager import package_slm


def main():
    print("=" * 68)
    print(" 🎓 TEACHER AI: Custom Model Distillation Pipeline")
    print(" Task: Customer Support Triage & Auto-Reply (Bulleted Summary Format)")
    print("=" * 68)

    # 1. Blueprint Configuration
    blueprint = SLMBlueprint(
        task_name="support_triage_slm",
        display_title="Customer Support Triage & Auto-Reply SLM",
        purpose_summary="Analyzes support inquiries, determines urgency and intent, outputs a 1-sentence situation summary, and drafts a polite resolution auto-reply.",
        system_instruction="You are a compact Customer Support Triage Assistant. Analyze the customer ticket and output Priority, Intent, Summary, and a professional Suggested Reply.",
        hyperparameters=ModelHyperparameters(
            architecture_type="nano_transformer",
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
            task_domain="Customer Support",
            sample_size=40,
            input_format="Ticket: <Customer Message>",
            output_format="Priority: <Urgent/High/Medium/Low> | Intent: <Category>\nSummary: <Situation Summary>\nSuggested Reply: <Resolution reply>",
            example_input="Ticket: My account is locked after 3 failed password attempts.",
            example_output="Priority: High | Intent: Account Access\nSummary: Customer locked out due to failed password attempts.\nSuggested Reply: Please verify your registered email to receive an instant unlock PIN.",
            categories_or_tags=["Account Access", "Billing Error", "Technical Issue", "Feature Request", "Cancellation"],
            edge_cases=["Missing account ID", "Multiple questions in one ticket", "Angry customer escalation"],
        ),
    )

    print("\n[Step 1/4] Synthesizing domain sample space...")
    sample_space = generate_sample_space(blueprint, target_count=40)
    print(f"  [OK] Generated {len(sample_space.samples)} curated customer support training pairs.")

    print("\n[Step 2/4] Distilling Micro-SLM (25 epochs with causal self-attention)...")
    def on_epoch(stats):
        if stats["epoch"] % 5 == 0 or stats["epoch"] == stats["total_epochs"]:
            print(f"  Epoch {stats['epoch']:2d}/{stats['total_epochs']} | Train Loss: {stats['train_loss']:.4f} | Val Loss: {stats['val_loss']:.4f} | Perplexity: {stats['perplexity']:.2f}")

    train_res = train_micro_slm(
        blueprint=blueprint,
        sample_space=sample_space,
        save_dir="trained_models",
        progress_callback=on_epoch,
    )
    print(f"\n  [OK] Distillation complete in {train_res['training_time_seconds']}s!")
    print(f"  [OK] Total Parameters: {train_res['total_parameters']:,}")
    print(f"  [OK] Final Validation Loss: {train_res['final_val_loss']}")

    print("\n[Step 3/4] Live Local Inference Benchmark...")
    test_tickets = [
        "My account is locked and I cannot reset my password via email.",
        "I was charged twice on my invoice #INV-9821 this morning.",
        "The dashboard is throwing a 500 error when exporting CSV files.",
    ]

    for ticket in test_tickets:
        print(f"\n  Input Ticket: \"{ticket}\"")
        out = run_slm_inference(
            model_dir=train_res["save_dir"],
            user_input=f"Ticket: {ticket}",
            max_new_tokens=48,
        )
        print(f"  Generated Output:\n    {out['response']}")
        print(f"  Latency: {out['latency_ms']} ms | Throughput: {out['tokens_per_second']} tokens/sec")

    print("\n[Step 4/4] Packaging Standalone Shipped Bundle...")
    export_path = package_slm(train_res["save_dir"], export_base_dir="exported_slm")
    print(f"  [OK] Standalone model package exported to:")
    print(f"       {export_path}")
    print("\n  Package Contents:")
    for f in export_path.iterdir():
        print(f"    - {f.name}")

    print("\n" + "=" * 68)
    print("  CUSTOMER SUPPORT TRIAGE SLM READY TO DEPLOY!")
    print("=" * 68)
    print(f"  To run this model on any machine:")
    print(f"    cd \"{export_path}\"")
    print(f"    python serve.py --prompt \"My payment failed for order #102\"")
    print(f"    python serve.py --server  # Starts local REST API on port 8000")
    print("=" * 68 + "\n")


if __name__ == "__main__":
    main()
