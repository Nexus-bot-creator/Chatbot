# Conversational Chatbot (Scaffold)

This workspace contains a minimal scaffold for a modular conversational chatbot.

Quick start (local):

1. Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Start Redis and Postgres (via Docker):

```bash
docker-compose up -d
```

4. Run the FastAPI app:

```bash
uvicorn src.orchestrator:app --reload --port 8000
```

API:
- POST /message — send {"session_id": "...", "text": "..."} and receive a structured response.

Files to extend:
- `src/orchestrator.py` — main FastAPI app
- `src/nlu/` — NLU components (intent, sentiment, ner, coref)
- `src/generator/` — generation and RAG integration
- `src/memory/` — session and long-term memory

Next steps:
- Implement intent classifier and slot-filling
- Add embeddings + vector DB for RAG
- Integrate an LLM provider (OpenAI/Anthropic/local model)

Licensed for internal use.# Backend
# Chatbot-backend
# Chatbot-backend
