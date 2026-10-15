"""Teacher AI Small Language Model (SLM) Distillation Factory Feature Module.

Contains model architecture design, synthetic dataset generation, micro-SLM neural network,
knowledge distillation training, ONNX/INT8 packaging, and latency/accuracy benchmarking.
"""

from .slm_architect import SLMBlueprint, ModelHyperparameters, SampleSpaceConfig, design_slm_blueprint
from .dataset_generator import DataSample, GeneratedSampleSpace, generate_sample_space, split_sample_space
from .micro_slm import MicroSLM, CharacterSubwordTokenizer
from .trainer import train_micro_slm
from .inference import run_slm_inference
from .evaluator import benchmark_teacher_vs_student
from .slm_packager import package_slm

__all__ = [
    "SLMBlueprint",
    "ModelHyperparameters",
    "SampleSpaceConfig",
    "design_slm_blueprint",
    "DataSample",
    "GeneratedSampleSpace",
    "generate_sample_space",
    "split_sample_space",
    "MicroSLM",
    "CharacterSubwordTokenizer",
    "train_micro_slm",
    "run_slm_inference",
    "benchmark_teacher_vs_student",
    "package_slm",
]
