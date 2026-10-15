"""Web API server for Teacher AI SLM Studio."""

import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Ensure backend package root is on sys.path
_backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

from core.brain import is_configured, set_api_key
from slm_distillation.dataset_generator import DataSample, GeneratedSampleSpace, generate_sample_space
from slm_distillation.evaluator import benchmark_teacher_vs_student
from slm_distillation.inference import run_slm_inference
from slm_distillation.slm_architect import ModelHyperparameters, SampleSpaceConfig, SLMBlueprint, design_slm_blueprint
from slm_distillation.slm_packager import package_slm
from slm_distillation.trainer import train_micro_slm

app = FastAPI(title="Teacher AI SLM Studio Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active session state
SESSION_STORE: Dict[str, Any] = {
    "current_blueprint": None,
    "current_dataset": None,
    "last_trained_model": None,
}

TRAINED_MODELS_DIR = Path(_backend_root) / "models" / "trained_models"
TRAINED_MODELS_DIR.mkdir(parents=True, exist_ok=True)


# --- Request/Response Models ---
class KeyUpdateRequest(BaseModel):
    api_key: str


class AnalyzeTaskRequest(BaseModel):
    user_prompt: str
    architecture: str = "nano_transformer"


class GenerateDatasetRequest(BaseModel):
    blueprint: Optional[Dict] = None
    sample_size: int = 35


class TrainRequest(BaseModel):
    blueprint: Optional[Dict] = None
    samples: Optional[List[Dict]] = None


class InferRequest(BaseModel):
    model_name: Optional[str] = None
    prompt: str
    temperature: float = 0.7
    max_tokens: int = 64


class BenchmarkRequest(BaseModel):
    model_name: Optional[str] = None
    queries: List[str]


class ExportRequest(BaseModel):
    model_name: str


# --- API Routes ---
@app.get("/api/status")
def get_system_status():
    """Retrieve system configuration and hardware readiness."""
    import torch
    models = []
    if TRAINED_MODELS_DIR.exists():
        for item in TRAINED_MODELS_DIR.iterdir():
            if item.is_dir() and (item / "config.json").exists():
                try:
                    with open(item / "config.json", "r", encoding="utf-8") as f:
                        cfg = json.load(f)
                    models.append({
                        "name": item.name,
                        "title": cfg.get("display_title", item.name),
                        "parameters": cfg.get("total_parameters", 0),
                        "val_loss": cfg.get("final_val_loss", 0),
                    })
                except Exception:
                    pass

    return {
        "status": "ready",
        "has_api_key": is_configured(),
        "device": "CUDA (GPU)" if torch.cuda.is_available() else "CPU",
        "torch_version": torch.__version__,
        "trained_models": models,
        "active_session": {
            "has_blueprint": SESSION_STORE["current_blueprint"] is not None,
            "has_dataset": SESSION_STORE["current_dataset"] is not None,
            "last_trained_model": SESSION_STORE["last_trained_model"],
        },
    }


@app.post("/api/set-key")
def update_api_key(req: KeyUpdateRequest):
    """Save or update the Gemini API key in memory and .env file."""
    key = req.api_key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="API key cannot be empty.")

    set_api_key(key)

    # Persist to local .env
    try:
        env_lines = []
        if os.path.exists(".env"):
            with open(".env", "r", encoding="utf-8") as f:
                for line in f:
                    if not line.startswith("GEMINI_API_KEY="):
                        env_lines.append(line.strip())
        env_lines.append(f"GEMINI_API_KEY={key}")
        with open(".env", "w", encoding="utf-8") as f:
            f.write("\n".join(env_lines) + "\n")
    except Exception as exc:
        pass

    return {"status": "success", "message": "Gemini API key updated and persisted successfully."}


@app.get("/api/presets")
def get_task_presets():
    """Return popular, tested automation task blueprints."""
    return [
        {
            "id": "support_triage_bulleted",
            "title": "Customer Support Triage & Auto-Reply (Summary & Bullets)",
            "prompt": "Analyze incoming customer support tickets, classify urgency and intent, provide a concise situation summary, and draft a polite, helpful resolution reply.",
            "category": "Customer Support",
            "recommended_arch": "nano_transformer",
            "output_format": "Priority: <Urgent/High/Medium/Low> | Intent: <Category>\\nSummary: <1-sentence issue summary>\\nSuggested Reply: <Response>",
        },
        {
            "id": "support_triage_json",
            "title": "Customer Support Triage (Structured JSON)",
            "prompt": "Classify incoming customer support tickets by category, priority, and generate a polite auto-reply in strict JSON format.",
            "category": "Customer Ops",
            "recommended_arch": "nano_transformer",
            "output_format": "JSON: {category, priority, suggested_reply}",
        },
        {
            "id": "invoice_extractor",
            "title": "Invoice Key-Value JSON Extractor",
            "prompt": "Extract invoice number, total amount, vendor name, and payment due date from noisy email invoice notifications.",
            "category": "Finance & Ops",
            "recommended_arch": "nano_transformer",
        },
        {
            "id": "nl_to_sql",
            "title": "Natural Language to SQL Query Synthesizer",
            "prompt": "Convert user analytical questions into clean, parameterized SQL queries for an ecommerce database.",
            "category": "Data Engineering",
            "recommended_arch": "nano_transformer",
        },
        {
            "id": "git_commit_summarizer",
            "title": "Git Commit & PR Auto-Summarizer",
            "prompt": "Read code diffs or commit messages and generate conventional semantic commit titles and release changelog summaries.",
            "category": "Developer Tools",
            "recommended_arch": "nano_transformer",
        },
    ]


@app.post("/api/analyze")
def analyze_task(req: AnalyzeTaskRequest):
    """Analyze user prompt and generate an optimal SLM blueprint."""
    if not req.user_prompt.strip():
        raise HTTPException(status_code=400, detail="Task prompt cannot be empty.")

    blueprint = design_slm_blueprint(req.user_prompt, req.architecture)
    SESSION_STORE["current_blueprint"] = blueprint
    return blueprint.model_dump()


@app.post("/api/generate-dataset")
def generate_dataset_endpoint(req: GenerateDatasetRequest):
    """Generate synthetic sample space using Teacher AI."""
    if req.blueprint:
        blueprint = SLMBlueprint.model_validate(req.blueprint)
    elif SESSION_STORE["current_blueprint"]:
        blueprint = SESSION_STORE["current_blueprint"]
    else:
        raise HTTPException(status_code=400, detail="No blueprint provided or in active session.")

    sample_space = generate_sample_space(blueprint, req.sample_size)
    SESSION_STORE["current_dataset"] = sample_space
    return sample_space.model_dump()


@app.post("/api/train")
def train_endpoint(req: TrainRequest):
    """Train and distill the MicroSLM on the sample space."""
    if req.blueprint:
        blueprint = SLMBlueprint.model_validate(req.blueprint)
    elif SESSION_STORE["current_blueprint"]:
        blueprint = SESSION_STORE["current_blueprint"]
    else:
        raise HTTPException(status_code=400, detail="Missing blueprint for training.")

    if req.samples:
        samples = [DataSample.model_validate(s) for s in req.samples]
        sample_space = GeneratedSampleSpace(task_name=blueprint.task_name, samples=samples)
    elif SESSION_STORE["current_dataset"]:
        sample_space = SESSION_STORE["current_dataset"]
    else:
        raise HTTPException(status_code=400, detail="Missing sample space dataset for training.")

    result = train_micro_slm(blueprint, sample_space, save_dir=str(TRAINED_MODELS_DIR))
    SESSION_STORE["last_trained_model"] = blueprint.task_name
    return result


@app.post("/api/infer")
def infer_endpoint(req: InferRequest):
    """Run real-time inference on a trained Student SLM."""
    model_name = req.model_name or SESSION_STORE["last_trained_model"]
    if not model_name:
        raise HTTPException(status_code=400, detail="No model name provided or trained yet.")

    model_dir = TRAINED_MODELS_DIR / model_name
    if not model_dir.exists():
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found.")

    try:
        output = run_slm_inference(
            model_dir=str(model_dir),
            user_input=req.prompt,
            max_new_tokens=req.max_tokens,
            temperature=req.temperature,
        )
        return output
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference error: {exc}")


@app.post("/api/benchmark")
def benchmark_endpoint(req: BenchmarkRequest):
    """Compare Teacher AI vs Student SLM side-by-side."""
    model_name = req.model_name or SESSION_STORE["last_trained_model"]
    if not model_name:
        raise HTTPException(status_code=400, detail="No model specified for benchmarking.")

    model_dir = TRAINED_MODELS_DIR / model_name
    if not model_dir.exists():
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found.")

    output = benchmark_teacher_vs_student(
        model_dir=str(model_dir),
        test_queries=req.queries,
    )
    return output


@app.post("/api/export")
def export_endpoint(req: ExportRequest):
    """Package the trained SLM into a standalone folder."""
    model_dir = TRAINED_MODELS_DIR / req.model_name
    if not model_dir.exists():
        raise HTTPException(status_code=404, detail=f"Model '{req.model_name}' not found.")

    export_path = package_slm(str(model_dir))
    return {
        "status": "success",
        "export_path": str(export_path),
        "files": [f.name for f in export_path.iterdir() if f.is_file()],
    }


# Mount legacy web studio files
web_dir = Path(__file__).parent.parent / "legacy_studio"
if not web_dir.exists():
    web_dir = Path(__file__).parent / "web"
    web_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(web_dir)), name="static")


@app.get("/")
def serve_index():
    index_file = web_dir / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"message": "Teacher AI SLM Studio API is running. Web UI directory is initializing."}


if __name__ == "__main__":
    import uvicorn
    print("\n" + "=" * 65)
    print(" 🎓 TEACHER AI: Small Language Model Distillation Studio")
    print("=" * 65)
    print(" Web Dashboard:  http://localhost:8500")
    print(" API Docs:       http://localhost:8500/docs")
    print("=" * 65 + "\n")
    uvicorn.run("server:app", host="0.0.0.0", port=8500, reload=False)
