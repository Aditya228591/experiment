"""Teacher AI Package (Backwards-Compatible Unified Facade).

Re-exports modules and components from the feature-focused subpackages:
- backend.core
- backend.bot_compiler
- backend.slm_distillation
"""

import sys
import os

_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from core.state import ProcessSpec, TeacherState
from slm_distillation.slm_architect import SLMBlueprint, ModelHyperparameters, design_slm_blueprint
from slm_distillation.dataset_generator import DataSample, GeneratedSampleSpace, generate_sample_space
from slm_distillation.micro_slm import MicroSLM, CharacterSubwordTokenizer
from slm_distillation.trainer import train_micro_slm
from slm_distillation.inference import run_slm_inference
from slm_distillation.evaluator import benchmark_teacher_vs_student
from slm_distillation.slm_packager import package_slm

__all__ = [
    "ProcessSpec",
    "TeacherState",
    "SLMBlueprint",
    "ModelHyperparameters",
    "design_slm_blueprint",
    "DataSample",
    "GeneratedSampleSpace",
    "generate_sample_space",
    "MicroSLM",
    "CharacterSubwordTokenizer",
    "train_micro_slm",
    "run_slm_inference",
    "benchmark_teacher_vs_student",
    "package_slm",
]
