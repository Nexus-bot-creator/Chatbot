# Chatbot Frontend

Minimal React + Vite frontend for the Chatbot backend (integration-ready).

Quick start

1. Install dependencies:

```bash
npm install
```

2. Dev:

```bash
REACT_APP_API_BASE_URL=http://localhost:8000 npm run dev
```

3. Build:

```bash
npm run build
```

Notes

- The frontend expects the backend API at `${API_BASE}/message` and will persist `session_id` in `localStorage` under `chat_session_id`.
- CORS must be enabled on the backend for local testing.
# Chatbot
