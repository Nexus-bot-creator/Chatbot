import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Ensure 'src' directory is on sys.path so imports like `from nlu...` work
ROOT = os.path.dirname(os.path.dirname(__file__))
SRC_PATH = os.path.join(ROOT, "src")
if SRC_PATH not in sys.path:
    sys.path.insert(0, SRC_PATH)

from nlu.intent import predict_intent
from nlu.sentiment import analyze_sentiment
from generator.generator import generate_response
from memory.session_store import SessionStore

app = FastAPI(title="Chatbot Orchestrator")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

session_store = SessionStore()

class MessageIn(BaseModel):
    session_id: str
    text: str

class MessageOut(BaseModel):
    session_id: str
    intent: Optional[str]
    intent_confidence: Optional[float]
    sentiment: Optional[dict]
    response: str
    retrieved_docs: Optional[list] = None


@app.on_event("startup")
def startup_event():
    # Auto-index sample documents if collection is empty
    try:
        from rag.indexer import get_indexer
        indexer = get_indexer()
        collection = indexer.get_collection()
        count = collection.count()
        if count == 0:
            print("Chroma collection is empty. Auto-indexing sample documents...")
            SAMPLE_DOCS = [
                {"id": "doc1", "text": "Our refund policy allows returns within 30 days of purchase.", "metadata": {"source": "policy"}},
                {"id": "doc2", "text": "To reset your password, go to Settings > Password and follow the reset link.", "metadata": {"source": "help"}},
                {"id": "doc3", "text": "We support iPhone and Android devices running the latest OS versions.", "metadata": {"source": "faq"}},
            ]
            indexer.index_documents(SAMPLE_DOCS)
            print("Auto-indexing complete.")
        else:
            print(f"Chroma collection already contains {count} documents.")
    except Exception as e:
        print(f"Error during auto-indexing startup: {e}")


@app.post("/message", response_model=MessageOut)
async def handle_message(msg: MessageIn):
    text = msg.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")

    # 1) Intent prediction
    intent_label, intent_conf = predict_intent(text)

    # 2) Sentiment / tone
    sentiment = analyze_sentiment(text)

    # 3) Retrieve session context
    context = session_store.get_context(msg.session_id)

    # 4) Generate response (stubbed generator)
    response_text = generate_response(
        user_text=text,
        intent=intent_label,
        intent_confidence=intent_conf,
        sentiment=sentiment,
        context=context,
    )

    # Retrieve docs to return to frontend
    from rag.retriever import retrieve
    retrieved = retrieve(text, top_k=3)
    retrieved_docs_formatted = []
    if retrieved:
        for d in retrieved:
            # We want: title, snippet, source
            retrieved_docs_formatted.append({
                "title": d["metadata"].get("source", d["id"]).title() if d.get("metadata") else d["id"],
                "snippet": d["document"],
                "source": d["metadata"].get("source", "unknown") if d.get("metadata") else "unknown"
            })

    # 5) Append to session
    session_store.append_turn(msg.session_id, text, response_text)

    return MessageOut(
        session_id=msg.session_id,
        intent=intent_label,
        intent_confidence=round(intent_conf, 3),
        sentiment=sentiment,
        response=response_text,
        retrieved_docs=retrieved_docs_formatted,
    )
@app.get("/")
async def root():
    return {"status": "ok", "message": "Chatbot API running"}