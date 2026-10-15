# 🎓 Classflow AI & Teacher AI Workspace

A clean, modular repository with separated **frontend** and **backend** codebases, organized into clear, feature-specific subfolders for intuitive code traversal.

> 💡 **Special Architectural Feature & Problem Statement:**  
> Read [PROBLEM_AND_SOLUTION.md](PROBLEM_AND_SOLUTION.md) for an in-depth manifesto explaining the K-12 educator workload crisis, why commercial cloud LLMs fail in schools (FERPA/COPPA violations, high latency, expensive token costs), and how our **Dual-Engine Architecture (Classflow AI + Teacher AI Edge SLM)** solves it. You can also interactively explore this in the running web app under the **"Problem & Solution"** tab!

---

## 📁 Repository Architecture & Folder Organization

```
experiment-main/
│
├── frontend/                                   # ALL FRONTEND CODEBASE (Classflow AI)
│   ├── public/                                 # Static web assets & icons
│   ├── src/                                    # Frontend source code
│   │   ├── features/                           # FEATURE DOMAINS (each feature in its own subfolder)
│   │   │   ├── problem-solution/               # Problem Statement & Solution Showcase
│   │   │   │   └── ProblemSolutionPage.tsx     # Interactive comparison & manifesto UI
│   │   │   ├── home/                           # Prompt builder & live workflow generator
│   │   │   │   ├── PromptBuilder.tsx           # Natural language prompt interface & shortcuts
│   │   │   │   ├── WorkflowPreview.tsx         # 3-step visual preview card
│   │   │   │   ├── WorkflowStepCard.tsx        # Trigger / AI Action / Action step indicators
│   │   │   │   ├── TrustCard.tsx               # Human-in-the-loop & FERPA trust guarantees
│   │   │   │   └── TestRunModal.tsx            # Live step-by-step simulation & email preview
│   │   │   ├── automations/                    # "My Automations" management & deep inspection
│   │   │   │   ├── AutomationCard.tsx          # Card with pause/resume, edit, & inspect triggers
│   │   │   │   ├── AutomationStats.tsx         # Metric counters (Total, Active, Processed)
│   │   │   │   └── AutomationDetailsModal.tsx  # Full pipeline inspector, permissions & live tests
│   │   │   ├── integrations/                   # Universal OAuth & Credential Vault
│   │   │   │   └── OAuthConnectModal.tsx       # Dynamic multi-app connection modal & storage vault
│   │   │   ├── library/                        # Classroom Automation Template Library
│   │   │   │   ├── TemplateCard.tsx            # Pre-built automation cards
│   │   │   │   └── TemplateFilter.tsx          # Category filter pills with count badges
│   │   │   └── activity/                       # Teacher Activity Log & Time-Saved Metrics
│   │   │       ├── ActivityStats.tsx           # Hours saved & draft counters
│   │   │       └── ActivityTimeline.tsx        # Chronological audit trail & review drawer
│   │   ├── components/                         # REUSABLE UI & LAYOUT COMPONENTS
│   │   │   ├── common/                         # UI Primitives
│   │   │   │   ├── Badge.tsx                   # Tag pill variants
│   │   │   │   ├── Button.tsx                  # Accessible button primitives
│   │   │   │   ├── Card.tsx                    # Clean surface card container
│   │   │   │   ├── Modal.tsx                   # Accessible modal dialog with focus lock
│   │   │   │   ├── PageHeading.tsx             # Standard title & subtitle header
│   │   │   │   └── Toast.tsx                   # Notification toast provider & hook
│   │   │   └── layout/                         # Application Chrome
│   │   │       ├── AppShell.tsx                # Master responsive container
│   │   │       ├── Sidebar.tsx                 # Desktop navigation & quick action
│   │   │       ├── Header.tsx                  # Top search bar, breadcrumb & notifications
│   │   │       ├── MobileNavigation.tsx        # Compact mobile tab bar
│   │   │       ├── HelpResourcesModal.tsx      # Help & documentation modal
│   │   │       ├── InviteTeammatesModal.tsx    # Teacher collaboration dialog
│   │   │       └── NotificationModal.tsx       # Notification center drawer
│   │   ├── services/                           # Business Logic & Persistence
│   │   │   ├── aiWorkflowService.ts            # Natural language parser & dynamic step compiler
│   │   │   └── storageService.ts               # LocalStorage & Credential Vault persistence
│   │   ├── types/                              # TypeScript Domain Interfaces
│   │   │   └── index.ts                        # Unified types (Workflow, Automation, Integration)
│   │   ├── data/                               # Seed & Mock Datasets
│   │   │   ├── mockAutomations.ts              # Default teacher automations
│   │   │   ├── mockTemplates.ts                # Classroom template library data
│   │   │   └── mockActivities.ts               # Sample activity timeline entries
│   │   ├── App.tsx                             # Top-level Root Application Component
│   │   ├── main.tsx                            # React 18 DOM Entrypoint
│   │   └── index.css                           # Tailwind CSS & Typography design tokens
│   ├── index.html                              # Single-page Application HTML host
│   ├── package.json                            # Frontend package configuration
│   ├── vite.config.ts                          # Vite build & dev server config
│   ├── tsconfig.json                           # TypeScript compiler options
│   ├── tailwind.config.js                      # Tailwind styling tokens & theme
│   └── postcss.config.js                       # PostCSS plugins
│
├── backend/                                    # ALL BACKEND CODEBASE (Teacher AI & SLM Factory)
│   ├── api/                                    # REST API & Web Server
│   │   ├── server.py                           # FastAPI application endpoints
│   │   ├── run_studio.py                       # Studio server runner
│   │   └── __init__.py
│   ├── cli/                                    # Command-Line Automation Compiler
│   │   ├── cli.py                              # Interactive CLI terminal workflow
│   │   └── __init__.py
│   ├── core/                                   # Core Orchestration & State
│   │   ├── brain.py                            # LLM reasoning & Gemini API client
│   │   ├── memory.py                           # Vector memory & snippet retrieval
│   │   ├── state.py                            # ProcessSpec & session state models
│   │   └── __init__.py
│   ├── bot_compiler/                           # Autonomous Automation Bot Synthesis
│   │   ├── coder.py                            # Standalone Python bot synthesizer
│   │   ├── interviewer.py                      # Interactive requirement clarifier
│   │   ├── sandbox.py                          # Subprocess test execution sandbox
│   │   ├── packager.py                         # Production bot packager
│   │   └── __init__.py
│   ├── slm_distillation/                       # Dual-Engine Small Language Model Factory
│   │   ├── slm_architect.py                    # Student SLM architecture designer
│   │   ├── dataset_generator.py                # Synthetic dataset generation engine
│   │   ├── trainer.py                          # Knowledge distillation PyTorch trainer
│   │   ├── micro_slm.py                        # Micro-SLM neural network definition
│   │   ├── evaluator.py                        # Accuracy & latency benchmarking
│   │   ├── inference.py                        # ONNX Runtime & PyTorch local inference
│   │   ├── slm_packager.py                     # ONNX export & INT8 quantization packager
│   │   └── __init__.py
│   ├── pipelines/                              # Pipeline Scripts & Verification Tests
│   │   ├── distill_support_triage_slm.py       # End-to-end distillation script
│   │   ├── test_slm_pipeline.py                # Pipeline verification tests
│   │   └── __init__.py
│   ├── models/                                 # Trained Weights & Exported Artifacts
│   │   ├── trained_models/                     # PyTorch checkpoints
│   │   └── exported_slm/                       # ONNX & tokenizer packages
│   ├── legacy_studio/                          # Original Web Studio (HTML/CSS/JS)
│   │   ├── index.html
│   │   ├── app.js
│   │   └── style.css
│   ├── teacher_ai/                             # Backwards-compatible import facade
│   │   ├── __init__.py                         # Re-exports core, bot_compiler, and slm_distillation
│   │   └── [shims].py                          # Seamless forwarding shims
│   ├── requirements.txt                        # Python dependencies
│   ├── server.py                               # Direct entrypoint for FastAPI server
│   └── cli.py                                  # Direct entrypoint for CLI compiler
│
├── package.json                                # Root workspace orchestration package.json
└── README.md                                   # This documentation file
```

---

## ⚡ Quickstart

### 1. Frontend (Classflow AI)

From the root directory:
```bash
# Start Vite development server (runs on http://localhost:3000)
npm run dev

# Or directly inside the frontend folder:
cd frontend
npm run dev
```

To build for production:
```bash
npm run build
```

### 2. Backend (Teacher AI & SLM Studio)

From the root directory:
```bash
# Start FastAPI backend server (runs on http://localhost:8500)
npm run backend:dev

# Or directly with Python:
python backend/server.py
```

To run the interactive CLI automation compiler:
```bash
python backend/cli.py
```

To run the distillation pipeline test:
```bash
python backend/pipelines/test_slm_pipeline.py
```

---

## 🌿 Clean Architecture Principles

1. **Separation of Concerns:** All frontend assets, components, and tools live strictly under `frontend/`. All Python scripts, ML distillation modules, API endpoints, and models live strictly under `backend/`.
2. **Feature-First Organization:** Inside `frontend/src/features/`, each domain (`home`, `automations`, `integrations`, `library`, `activity`) has its own dedicated folder. Inside `backend/`, each core capability (`core`, `bot_compiler`, `slm_distillation`, `api`, `cli`, `pipelines`, `models`) has its own dedicated folder.
3. **No Breakage / Full Backwards Compatibility:** `backend/teacher_ai/` provides facade shims so existing scripts importing `from teacher_ai.brain import ...` or `from teacher_ai.slm_architect import ...` continue to work without modification.
