@echo off
setlocal enabledelayedexpansion

echo =============================================
echo 🤖 Starting Chatbot Integration Environment (Windows) 🤖
echo =============================================

:: Get the directory of this script
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%Chatbot"
set "FRONTEND_DIR=%ROOT_DIR%Chatbot-frontend"

:: Set HF endpoint mirror for regional access
set "HF_ENDPOINT=https://hf-mirror.com"

:: 1. Setup Backend
echo --^> Setting up Python Backend...
cd /d "%BACKEND_DIR%"
if not exist ".venv" (
    echo     Creating virtual environment in .venv...
    python -m venv .venv
)
call .venv\Scripts\activate.bat
echo     Installing/updating backend requirements...
pip install -r requirements.txt

:: 2. Run Indexing Script
echo --^> Initializing Chroma DB collection...
python scripts\index_docs.py

:: 3. Setup Frontend
echo --^> Setting up React Frontend...
cd /d "%FRONTEND_DIR%"
echo     Installing frontend node modules...
call npm install

:: 4. Start Servers Concurrently
echo --^> Starting both servers concurrently...

:: Start Backend in a new window
echo     Starting FastAPI backend...
start "Chatbot Backend" cmd /c "cd /d "%BACKEND_DIR%" && call .venv\Scripts\activate.bat && uvicorn src.orchestrator:app --reload --port 8000"

:: Start Frontend in a new window
echo     Starting Vite React frontend...
set "VITE_API_BASE_URL=http://localhost:8000"
start "Chatbot Frontend" cmd /c "cd /d "%FRONTEND_DIR%" && npm run dev"

echo ---------------------------------------------
echo ✅ Both servers have been launched in separate windows.
echo    - Backend: http://localhost:8000
echo    - Frontend: http://localhost:5173
echo.
echo Press any key to exit this starter script.
echo ---------------------------------------------
pause
