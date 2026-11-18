"""
config.py

Central settings and path configuration for FinSight AI.
Every module and agent imports settings from here so there is a single source of truth.
All directory paths are dynamically configurable via environment variables (e.g. DATA_DIR)
for smooth deployment on Hugging Face Spaces, Render, Docker, or local environments.
"""

import os
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Project roots
# ---------------------------------------------------------------------------
# Core dir is backend/app/core. Backend root is 3 levels up: backend/
BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
# Ensure backend directory is in sys.path so modules resolve cleanly
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

# App root is backend/app
APP_ROOT = BACKEND_ROOT / "app"
if str(APP_ROOT) not in sys.path:
    sys.path.insert(0, str(APP_ROOT))

# ---------------------------------------------------------------------------
# Dynamic Data Folders
# ---------------------------------------------------------------------------
# DATA_DIR can be overridden by environment variable (e.g., in Docker, HF Spaces /data, or Render disk)
# Default points to backend/data
DATA_DIR = Path(os.getenv("DATA_DIR", BACKEND_ROOT / "data")).resolve()

DOCUMENTS_DIR = Path(os.getenv("DOCUMENTS_DIR", DATA_DIR / "documents")).resolve()
CHUNKS_DIR = Path(os.getenv("CHUNKS_DIR", DATA_DIR / "chunks")).resolve()
EMBEDDINGS_DIR = Path(os.getenv("EMBEDDINGS_DIR", DATA_DIR / "embeddings")).resolve()
VECTORDB_DIR = Path(os.getenv("VECTORDB_DIR", DATA_DIR / "vectordb")).resolve()
REPORTS_DIR = Path(os.getenv("REPORTS_DIR", DATA_DIR / "annual_reports")).resolve()

# ---------------------------------------------------------------------------
# Hugging Face Dataset Sync Settings
# ---------------------------------------------------------------------------
# Dataset repo containing vectordb/, chunks/, documents/, embeddings/
HF_DATASET_REPO = os.getenv("HF_DATASET_REPO", "Akshaya-V/finsight_ai_dataset")

# Optional Hugging Face Token for private repositories
# Set HF_TOKEN in environment variables if the dataset repository is private
HF_TOKEN = os.getenv("HF_TOKEN", None)

# ---------------------------------------------------------------------------
# ChromaDB & Embedding Model Settings
# ---------------------------------------------------------------------------
MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "financial_documents")
DEFAULT_TOP_K = int(os.getenv("DEFAULT_TOP_K", "3"))

# ---------------------------------------------------------------------------
# Chunking settings
# ---------------------------------------------------------------------------
CHUNK_WORDS = 600
CHUNK_OVERLAP_WORDS = 100
MIN_CHUNK_WORDS = 20
DEFAULT_DOCUMENT_TYPE = "annual_report"

# ---------------------------------------------------------------------------
# Server & CORS Settings
# ---------------------------------------------------------------------------
# In production on Vercel, set CORS_ORIGINS to "https://your-app.vercel.app"
CORS_ORIGINS_RAW = os.getenv("CORS_ORIGINS", "*")
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_RAW.split(",") if origin.strip()]


def ensure_directories():
    """Create essential data directories if they do not exist yet."""
    for folder in (DATA_DIR, DOCUMENTS_DIR, CHUNKS_DIR, EMBEDDINGS_DIR, VECTORDB_DIR, REPORTS_DIR):
        folder.mkdir(parents=True, exist_ok=True)


if __name__ == "__main__":
    print(f"BACKEND_ROOT  : {BACKEND_ROOT}")
    print(f"DATA_DIR      : {DATA_DIR}  (exists: {DATA_DIR.exists()})")
    print(f"VECTORDB_DIR  : {VECTORDB_DIR}  (exists: {VECTORDB_DIR.exists()})")
    print(f"CHUNKS_DIR    : {CHUNKS_DIR}  (exists: {CHUNKS_DIR.exists()})")
    print(f"DOCUMENTS_DIR : {DOCUMENTS_DIR}  (exists: {DOCUMENTS_DIR.exists()})")
    print(f"EMBEDDINGS_DIR: {EMBEDDINGS_DIR}  (exists: {EMBEDDINGS_DIR.exists()})")
