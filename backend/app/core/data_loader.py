"""
data_loader.py

Automated dataset and ChromaDB synchronization from Hugging Face for FinSight AI.
Ensures that the essential directories (vectordb, documents, chunks, embeddings)
are verified and downloaded from the Hugging Face dataset (Akshaya-V/finsight_ai_dataset)
at server startup into DATA_DIR.
"""

import logging
import os
import sys
import time
from pathlib import Path

# Add backend and app to path
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_ROOT = CURRENT_DIR.parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import (
    CHUNKS_DIR,
    DATA_DIR,
    DOCUMENTS_DIR,
    EMBEDDINGS_DIR,
    HF_DATASET_REPO,
    HF_TOKEN,
    VECTORDB_DIR,
    ensure_directories,
)

LOGGER = logging.getLogger("data_loader")


def is_vectordb_ready() -> bool:
    """Check if persistent ChromaDB SQLite database and collection directory exist and are valid."""
    if not VECTORDB_DIR.exists():
        return False

    sqlite_file = VECTORDB_DIR / "chroma.sqlite3"
    if not sqlite_file.exists():
        return False

    try:
        # chroma.sqlite3 should be valid (> 5MB)
        if sqlite_file.stat().st_size < 5_000_000:
            LOGGER.warning("chroma.sqlite3 exists at %s but size is suspiciously small (%d bytes)",
                           sqlite_file, sqlite_file.stat().st_size)
            return False
    except OSError as err:
        LOGGER.warning("Could not stat sqlite file %s: %s", sqlite_file, err)
        return False

    # Check for collection UUID folder
    subdirs = [p for p in VECTORDB_DIR.iterdir() if p.is_dir() and p.name != "__pycache__"]
    return len(subdirs) >= 1


def is_dataset_ready() -> bool:
    """Check if all data directories exist and contain indexed records."""
    if not is_vectordb_ready():
        return False

    for folder in (CHUNKS_DIR, DOCUMENTS_DIR, EMBEDDINGS_DIR):
        if not folder.exists():
            return False
        json_files = list(folder.glob("*.json"))
        if not json_files:
            return False

    return True


def ensure_data_loaded(force: bool = False, progress_callback = None) -> bool:
    """
    Download missing directories from the Hugging Face dataset.
    If files are already present and verified in DATA_DIR, returns immediately with 0s overhead.

    If HF_TOKEN is configured in environment variables, it will be passed to authenticate
    against private or restricted Hugging Face dataset repositories.
    """
    ensure_directories()

    if not force and is_dataset_ready():
        LOGGER.info("All datasets and ChromaDB vector store are verified at %s.", DATA_DIR)
        return True

    LOGGER.info("Synchronizing ChromaDB and dataset from Hugging Face (%s) into %s...", HF_DATASET_REPO, DATA_DIR)
    if progress_callback:
        progress_callback("Connecting to Hugging Face dataset repository...")

    try:
        from huggingface_hub import snapshot_download
    except ImportError:
        msg = "huggingface_hub is not installed. Run: pip install huggingface_hub"
        LOGGER.error(msg)
        raise RuntimeError(msg)

    start_time = time.time()
    try:
        if progress_callback:
            progress_callback(f"Downloading dataset from {HF_DATASET_REPO}...")

        # snapshot_download downloads LFS files (e.g. chroma.sqlite3 ~102MB) and JSON files
        token_to_use = HF_TOKEN if (HF_TOKEN and HF_TOKEN.strip()) else None

        download_path = snapshot_download(
            repo_id=HF_DATASET_REPO,
            repo_type="dataset",
            token=token_to_use,
            allow_patterns=["vectordb/**", "chunks/**", "documents/**", "embeddings/**"],
            local_dir=str(DATA_DIR),
            max_workers=4,
        )

        elapsed = time.time() - start_time
        LOGGER.info("Successfully synchronized dataset from HF in %.2f seconds to %s", elapsed, download_path)
        if progress_callback:
            progress_callback(f"Download complete in {elapsed:.1f}s.")

        # Final health verification
        if not is_vectordb_ready():
            raise FileNotFoundError(
                f"Download completed but ChromaDB is missing or incomplete at {VECTORDB_DIR / 'chroma.sqlite3'}."
            )

        return True

    except Exception as exc:
        LOGGER.error("Failed to download dataset from Hugging Face: %s", exc, exc_info=True)
        token_msg = " (HF_TOKEN was provided)" if HF_TOKEN else " (No HF_TOKEN was provided. If the dataset is private, set HF_TOKEN=<token>)"
        raise RuntimeError(
            f"Failed to synchronize FinSight AI dataset from Hugging Face ({HF_DATASET_REPO}){token_msg}: {exc}"
        ) from exc


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    print(f"Data Dir: {DATA_DIR}")
    print(f"VectorDB Ready: {is_vectordb_ready()}")
    print(f"Dataset Ready: {is_dataset_ready()}")
    if not is_vectordb_ready():
        print("Dataset not ready. Starting download...")
        ensure_data_loaded()
        print("Finished.")
    else:
        print("Data is already present and verified.")
