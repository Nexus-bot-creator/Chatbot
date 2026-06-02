#!/bin/bash

# Exit on error
set -e

# Get absolute paths of directories
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$ROOT_DIR/Chatbot"
FRONTEND_DIR="$ROOT_DIR/Chatbot-frontend"

# Export HF endpoint mirror for regional access
export HF_ENDPOINT=https://hf-mirror.com

echo "============================================="
echo "🤖 Starting Chatbot Integration Environment 🤖"
echo "============================================="

# 1. Setup Backend
echo "--> Setting up Python Backend..."
cd "$BACKEND_DIR"
if [ ! -d ".venv" ]; then
    echo "    Creating virtual environment in .venv..."
    python3 -m venv .venv
fi
source .venv/bin/activate
echo "    Installing/updating backend requirements..."
pip install -r requirements.txt

# 2. Run Indexing Script
echo "--> Initializing Chroma DB collection..."
python scripts/index_docs.py

# 3. Setup Frontend
echo "--> Setting up React Frontend..."
cd "$FRONTEND_DIR"
echo "    Installing frontend node modules..."
npm install

# 4. Start Servers Concurrently
echo "--> Starting both servers concurrently..."

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "--> Shutting down servers..."
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit 0
}

# Setup trap to catch Ctrl+C (SIGINT), terminal termination (SIGTERM), and exits
trap cleanup SIGINT SIGTERM EXIT

# Start FastAPI backend
cd "$BACKEND_DIR"
source .venv/bin/activate
uvicorn src.orchestrator:app --reload --port 8000 &
BACKEND_PID=$!
echo "✅ Backend FastAPI server started on http://localhost:8000 (PID: $BACKEND_PID)"

# Start Vite React frontend
cd "$FRONTEND_DIR"
VITE_API_BASE_URL=http://localhost:8000 npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend React Vite server started on http://localhost:5173 (PID: $FRONTEND_PID)"

echo "---------------------------------------------"
echo "Press Ctrl+C to stop both servers."
echo "---------------------------------------------"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
