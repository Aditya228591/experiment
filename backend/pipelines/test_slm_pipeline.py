"""End-to-End Pipeline Verification Test for Teacher AI SLM Studio."""

import os
import sys
import shutil

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

from slm_distillation.slm_architect import design_slm_blueprint
from slm_distillation.dataset_generator import generate_sample_space
from slm_distillation.trainer import train_micro_slm
from slm_distillation.inference import run_slm_inference
from slm_distillation.slm_packager import package_slm


def run_pipeline_test():
    print("=" * 60)
    print("Testing Teacher AI SLM Studio Pipeline")
    print("=" * 60)

    # 1. Blueprint design
    print("\n[1/5] Designing blueprint...")
    prompt = "Classify customer support tickets and generate response"
    blueprint = design_slm_blueprint(prompt, base_architecture="nano_transformer")
    blueprint.hyperparameters.epochs = 5  # Quick 5 epochs for test
    blueprint.hyperparameters.batch_size = 4
    print(f"  [OK] Task Name: {blueprint.task_name}")
    print(f"  [OK] Display Title: {blueprint.display_title}")

    # 2. Sample space generation
    print("\n[2/5] Synthesizing sample space...")
    sample_space = generate_sample_space(blueprint, target_count=12)
    print(f"  [OK] Generated {len(sample_space.samples)} training samples")

    # 3. Train & Distill
    print("\n[3/5] Training Micro-SLM (5 test epochs)...")
    result = train_micro_slm(blueprint, sample_space, save_dir="test_trained_models")
    print(f"  [OK] Train Completed in {result['training_time_seconds']}s")
    print(f"  [OK] Total Parameters: {result['total_parameters']:,}")
    print(f"  [OK] Final Val Loss: {result['final_val_loss']}")

    # 4. Inference
    print("\n[4/5] Testing local inference...")
    model_dir = result["save_dir"]
    inf_res = run_slm_inference(
        model_dir=model_dir,
        user_input="My account is locked and I cannot reset password.",
        max_new_tokens=32,
    )
    print(f"  [OK] Prompt: 'My account is locked and I cannot reset password.'")
    print(f"  [OK] Response: {inf_res['response']}")
    print(f"  [OK] Latency: {inf_res['latency_ms']} ms ({inf_res['tokens_per_second']} tokens/sec)")

    # 5. Packaging
    print("\n[5/5] Packaging standalone bundle...")
    export_path = package_slm(model_dir, export_base_dir="test_exported_slm")
    print(f"  [OK] Exported cleanly to: {export_path}")
    files = [f.name for f in export_path.iterdir()]
    print(f"  [OK] Package files: {', '.join(files)}")

    # Cleanup test dirs
    shutil.rmtree("test_trained_models", ignore_errors=True)
    shutil.rmtree("test_exported_slm", ignore_errors=True)

    print("\n" + "=" * 60)
    print(" ALL TESTS PASSED SUCCESSFULLY! ")
    print("=" * 60)


if __name__ == "__main__":
    run_pipeline_test()
