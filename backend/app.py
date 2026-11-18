"""
app.py

Hugging Face Spaces Entrypoint for FinSight AI.
Allows running the FastAPI backend directly on Hugging Face Spaces using the Gradio SDK
without needing Docker.

Mounts the FastAPI endpoints under the same server so:
  - Vercel frontend calls: https://<your-space>.hf.space/api/...
  - Interactive Swagger Docs: https://<your-space>.hf.space/docs
  - Space Browser View: Shows an interactive status dashboard
"""

import os
import sys
from pathlib import Path

# Ensure backend root is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import gradio as gr
from app.main import app as fastapi_app

# Interactive Status Landing Page for the Hugging Face Space tab
with gr.Blocks(title="FinSight AI Backend", theme=gr.themes.Base()) as demo:
    gr.Markdown(
        """
        # 📈 FinSight AI — Institutional Financial Research Backend
        
        ### ✅ Backend API is Active & Healthy!
        
        This Hugging Face Space provides the high-performance Python backend (PyTorch, ChromaDB, Sentence-Transformers) 
        powering the FinSight AI Next.js frontend deployed on Vercel.
        
        #### 🔗 Available Endpoints:
        - **Interactive API Documentation (Swagger)**: [/docs](/docs)
        - **Health & Telemetry**: [/api/health](/api/health)
        - **Company Catalog**: [/api/catalog](/api/catalog)
        - **Multi-Agent Analysis**: `POST /api/analyze`
        - **Peer Benchmarking**: `POST /api/compare`
        - **Research Copilot**: `POST /api/research`
        - **Report Generator**: `POST /api/report`
        
        ---
        *Dataset automatically loaded from `Akshaya-V/finsight_ai_dataset`.*
        """
    )

# Mount Gradio dashboard at root / or /demo, keeping all /api routes untouched
app = gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
