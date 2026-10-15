"""Forwarding shim for bot_compiler.packager.

Enables seamless backwards-compatible imports from teacher_ai.packager.
"""

import sys
import os

_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from bot_compiler.packager import *
