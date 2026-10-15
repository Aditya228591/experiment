# 🎓 Teacher AI - Backend & SLM Distillation Factory

Dual-Engine SLM Distillation Factory and Autonomous Bot Compiler built in Python.

## Directory Structure

```
backend/
├── api/                    # REST API & Web Server
│   ├── server.py           # FastAPI application & endpoints
│   ├── run_studio.py       # Studio server runner
│   └── __init__.py
├── cli/                    # Command-Line Automation Compiler
│   ├── cli.py              # Interactive terminal workflow
│   └── __init__.py
├── core/                   # Core Orchestration & State
│   ├── brain.py            # LLM reasoning & Gemini API client
│   ├── memory.py           # Vector memory & snippet retrieval
│   ├── state.py            # ProcessSpec & session state models
│   └── __init__.py
├── bot_compiler/           # Autonomous Automation Bot Synthesis
│   ├── coder.py            # Standalone Python bot synthesizer
│   ├── interviewer.py      # Interactive requirement clarifier
│   ├── sandbox.py          # Subprocess test execution sandbox
│   ├── packager.py         # Production bot packager
│   └── __init__.py
├── slm_distillation/       # Dual-Engine Small Language Model Factory
│   ├── slm_architect.py    # Student SLM architecture designer
│   ├── dataset_generator.py # Synthetic dataset generation engine
│   ├── trainer.py          # Knowledge distillation PyTorch trainer
│   ├── micro_slm.py        # Micro-SLM neural network definition
│   ├── evaluator.py        # Accuracy & latency benchmarking
│   ├── inference.py        # ONNX Runtime & PyTorch local inference
│   ├── slm_packager.py     # ONNX export & INT8 quantization packager
│   └── __init__.py
├── pipelines/              # Pipeline Scripts & Verification Tests
│   ├── distill_support_triage_slm.py # End-to-end distillation script
│   ├── test_slm_pipeline.py # Pipeline verification tests
│   └── __init__.py
├── models/                 # Trained Weights & Exported Artifacts
│   ├── trained_models/     # PyTorch checkpoints
│   └── exported_slm/       # ONNX & tokenizer packages
├── legacy_studio/          # Original Web Studio (HTML/CSS/JS)
│   ├── index.html
│   ├── app.js
│   └── style.css
├── teacher_ai/             # Backwards-compatible import facade
│   ├── __init__.py         # Re-exports core, bot_compiler, and slm_distillation
│   └── [shims].py          # Seamless forwarding shims
├── requirements.txt        # Python dependencies
├── server.py               # Direct entrypoint for FastAPI server
└── cli.py                  # Direct entrypoint for CLI compiler
```

## Running the Backend

### Start the REST API Server
```bash
python server.py
# Server runs on http://localhost:8500
# OpenAPI Docs: http://localhost:8500/docs
```

### Run the Interactive Bot Compiler CLI
```bash
python cli.py
```

### Run Pipeline Verification Tests
```bash
python pipelines/test_slm_pipeline.py
```
