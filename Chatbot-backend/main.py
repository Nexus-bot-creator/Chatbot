import os
import sys

# Ensure the root directory and 'src' directory are in sys.path
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_PATH = os.path.join(ROOT, "src")
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
if SRC_PATH not in sys.path:
    sys.path.insert(0, SRC_PATH)

# Export app so that Railpack / Uvicorn can find the ASGI application when run as 'main:app'
from src.orchestrator import app

import uvicorn

if __name__ == "__main__":
    # Railway injects the PORT environment variable automatically
    port = int(os.environ.get("PORT", 8000))
    # Run the FastAPI app
    uvicorn.run("main:app", host="0.0.0.0", port=port)

