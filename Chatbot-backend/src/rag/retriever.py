from typing import List, Dict
from .indexer import get_indexer


def retrieve(query: str, top_k: int = 3) -> List[Dict]:
    """Return top_k documents with fields: id, document, metadata, distance
    distance is the chroma returned distance (smaller = more similar)
    """
    indexer = get_indexer()
    collection = indexer.get_collection()
    q_embs = indexer.embed_texts([query])
    # query returns lists aligned to inputs
    results = collection.query(query_embeddings=q_embs, n_results=top_k, include=["documents", "metadatas", "distances"])
    out = []
    if not results or "documents" not in results:
        return out

    docs = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]
    ids = results.get("ids", [[]])[0]

    for i in range(len(docs)):
        out.append({
            "id": ids[i],
            "document": docs[i],
            "metadata": metadatas[i],
            "distance": distances[i],
        })
    return out
