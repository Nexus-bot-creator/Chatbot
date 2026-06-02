"""Simple script to index sample documents into Chroma via the indexer.

Run:

python scripts/index_docs.py
"""
import os
import sys

# Ensure src is importable when running the script directly.
SCRIPT_ROOT = os.path.dirname(os.path.dirname(__file__))
SRC_PATH = os.path.join(SCRIPT_ROOT, "src")
if SRC_PATH not in sys.path:
    sys.path.insert(0, SRC_PATH)

from rag.indexer import get_indexer

SAMPLE_DOCS = [
    {"id": "doc1", "text": "Our refund policy allows returns within 30 days of purchase.", "metadata": {"source": "policy"}},
    {"id": "doc2", "text": "To reset your password, go to Settings > Password and follow the reset link.", "metadata": {"source": "help"}},
    {"id": "doc3", "text": "We support iPhone and Android devices running the latest OS versions.", "metadata": {"source": "faq"}},
]


def main():
    idx = get_indexer()
    print("Indexing sample docs...")
    idx.index_documents(SAMPLE_DOCS)
    print("Done.")


if __name__ == "__main__":
    main()
