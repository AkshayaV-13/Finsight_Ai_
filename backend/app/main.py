"""
main.py

FinSight AI Backend Application Entrypoint.
Production-grade FastAPI application with:
  - Dataset auto-synchronization on startup lifespan
  - Permissive CORS for Vercel frontend deployments
  - Comprehensive OpenAPI documentation (/docs, /redoc)
"""

import logging
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core import config, data_loader
from app.api.endpoints import router as api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
LOGGER = logging.getLogger("finsight.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan:
    Runs before server accepts requests. Ensures ChromaDB database and datasets
    are synchronized from Hugging Face into DATA_DIR.
    """
    LOGGER.info("=== Starting FinSight AI Backend ===")
    LOGGER.info("Data directory: %s", config.DATA_DIR)
    LOGGER.info("Dataset repository: %s", config.HF_DATASET_REPO)
    LOGGER.info("Allowed CORS origins: %s", config.CORS_ORIGINS)

    config.ensure_directories()

    try:
        if not data_loader.is_vectordb_ready():
            LOGGER.info("Vector database not detected locally. Initializing download from Hugging Face...")
            data_loader.ensure_data_loaded()
            LOGGER.info("Hugging Face dataset successfully synchronized.")
        else:
            LOGGER.info("Vector database verified at %s. 0s startup overhead.", config.VECTORDB_DIR)
    except Exception as exc:
        LOGGER.error("Startup dataset synchronization warning: %s", exc)
        LOGGER.error("The application will start, but endpoints querying ChromaDB may fail until data is synced.")

    yield
    LOGGER.info("FinSight AI Backend shutting down.")


# Create FastAPI App
app = FastAPI(
    title="FinSight AI — Institutional Financial Intelligence API",
    description=(
        "Production-grade multi-agent financial report research and analytics backend. "
        "Coordinates Extraction, Analysis, Red-Flag, and Comparison agents with ChromaDB provenance."
    ),
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for Vercel Frontend
# Allows localhost during local development and any vercel.app preview/production deployment
origins = config.CORS_ORIGINS if "*" not in config.CORS_ORIGINS else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app" if "*" not in config.CORS_ORIGINS else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router under /api
app.include_router(api_router, prefix="/api")


@app.get("/", tags=["Root"])
def root():
    """Root endpoint providing service information and health link."""
    return JSONResponse({
        "name": "FinSight AI API",
        "version": "2.0.0",
        "status": "online",
        "documentation": "/docs",
        "health": "/api/health",
        "dataset_repo": config.HF_DATASET_REPO,
    })


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
