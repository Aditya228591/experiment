"""Forwarding shim for slm_distillation.trainer.

Enables seamless backwards-compatible imports from teacher_ai.trainer.
"""

import sys
import os

_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from slm_distillation.trainer import *
