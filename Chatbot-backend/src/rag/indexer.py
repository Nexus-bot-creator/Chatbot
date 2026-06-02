import os
from dotenv import load_dotenv
from typing import List, Dict, Optional
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions

# Load environment variables from .env file
load_dotenv()

# Simple Chroma indexer using a Hugging Face embedding function.
# This avoids the sentence-transformers dependency and should work on Python 3.13.

MODEL_NAME = "all-MiniLM-L6-v2"
_COLLECTION_NAME = "chatbot_docs"

class ChromaIndexer:
    def __init__(self, collection_name: str = _COLLECTION_NAME, model_name: str = MODEL_NAME):
        self.model_name = model_name
        self.embedding_function = embedding_functions.DefaultEmbeddingFunction()
        # Resolve path relative to the project directory (Chatbot/.chroma_db)
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        db_path = os.path.join(base_dir, ".chroma_db")
        self.client = chromadb.PersistentClient(path=db_path)
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=self.embedding_function,
        )

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        return self.embedding_function(texts)

    def index_documents(self, docs: List[Dict[str, object]]):
        """
        docs: list of {"id": str, "text": str, "metadata": dict}
        """
        ids = [d["id"] for d in docs]
        texts = [d["text"] for d in docs]
        metadatas = [d.get("metadata", {}) for d in docs]
        embeddings = self.embed_texts(texts)
        # Add to collection (will upsert duplicates)
        self.collection.add(ids=ids, documents=texts, metadatas=metadatas, embeddings=embeddings)

    def delete_collection(self):
        try:
            self.client.delete_collection(self.collection.name)
        except Exception:
            pass

    def get_collection(self):
        return self.collection


# Module-level indexer for convenience
_indexer: Optional[ChromaIndexer] = None

def get_indexer() -> ChromaIndexer:
    global _indexer
    if _indexer is None:
        _indexer = ChromaIndexer()
    return _indexer
