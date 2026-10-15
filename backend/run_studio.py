"""Teacher AI SLM Studio Launcher."""

import os
import sys
import webbrowser
from pathlib import Path

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import uvicorn

def main():
    port = 8500
    url = f"http://localhost:{port}"

    print("=" * 65)
    print(" 🎓 TEACHER AI: Small Language Model (SLM) Studio")
    print("=" * 65)
    print(f" Web UI Dashboard:   {url}")
    print(f" REST API Swagger:   {url}/docs")
    print("=" * 65)
    print(" Starting server on port 8500 (Press Ctrl+C to stop)...")

    # Try opening browser automatically
    try:
        webbrowser.open(url)
    except Exception:
        pass

    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)


if __name__ == "__main__":
    main()
