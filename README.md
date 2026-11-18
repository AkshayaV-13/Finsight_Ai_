# 📈 FinSight AI — Institutional Financial Research Copilot

<!-- ================================================================= -->
<!-- DEPLOYED PROJECT LINKS (Replace placeholders with your live URLs) -->
<!-- ================================================================= -->

[![Live Frontend](https://img.shields.io/badge/Live%20Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://your-finsight-ai.vercel.app)
[![Live Backend API](https://img.shields.io/badge/Live%20Backend-Render%20%2F%20HF-009688?style=for-the-badge&logo=fastapi)](https://your-backend-api.onrender.com)
[![Hugging Face Dataset](https://img.shields.io/badge/Dataset-Hugging%20Face-orange?style=for-the-badge&logo=huggingface)](https://huggingface.co/datasets/Akshaya-V/finsight_ai_dataset)

> 🔗 **Live Deployed Web Application (Vercel)**: `https://your-finsight-ai.vercel.app` *(Paste your live Vercel link here)*  
> ⚡ **Live Deployed REST API (Backend)**: `https://your-backend-api.onrender.com` *(Paste your live backend link here)*  
> 📚 **API Documentation (Swagger UI)**: `https://your-backend-api.onrender.com/docs`  
> 📦 **Dataset Repository**: [Akshaya-V/finsight_ai_dataset](https://huggingface.co/datasets/Akshaya-V/finsight_ai_dataset)  

---

## 🏛️ Project Overview

**FinSight AI** is a production-grade multi-agent financial intelligence and research platform built for institutional-grade financial report analysis. Unlike generic LLM wrappers that hallucinate financial figures, FinSight AI enforces **100% mathematical and citation provenance**:

* **Zero Hallucinated Numbers**: Every single metric extracted links to an audited page and table in the source filing.
* **Deterministic Arithmetic**: Year-over-Year (YoY) variances, margins, and ratios are calculated via strict arithmetic models.
* **Accounting & Currency Safety**: Currencies are never falsely converted or compared (e.g., USD vs INR). Incompatible reporting currencies trigger automated safety advisories.
* **Rule-Based Governance**: Flags margin compression, negative cash flow anomalies, and leverage spikes using configurable audit thresholds.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│             VERCEL (Frontend / Edge)                   │
│  - Framework: Next.js 14 + Tailwind CSS (TypeScript)   │
│  - Palette: Deep Emerald (#0F382C) & Ivory (#F9F8F5)   │
│  - 7 Views: Executive Dashboard, Research Copilot,      │
│             Company Analysis, Peer Benchmarking,       │
│             Visual Trends, Briefing Generator, Ingest  │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS REST API
                            ▼
┌────────────────────────────────────────────────────────┐
│       RENDER / HUGGING FACE SPACES (Backend API)       │
│  - Framework: FastAPI + Uvicorn                        │
│  - Vector Database: ChromaDB (Cosine similarity)       │
│  - Embeddings: sentence-transformers/all-MiniLM-L6-v2  │
│  - Lifespan Boot Sync: Auto-downloads dataset into     │
│    DATA_DIR cache at startup (0s if cached)            │
└───────────────────────────┬────────────────────────────┘
                            │ Internal High-Speed Download
                            ▼
┌────────────────────────────────────────────────────────┐
│          HUGGING FACE DATASET (Public/Private)         │
│   Akshaya-V/finsight_ai_dataset (~211 MB)              │
│   Folders: vectordb/, chunks/, documents/, embeddings/ │
└────────────────────────────────────────────────────────┘
```

---

## 🤖 Multi-Agent System

| Agent | Responsibility | Guarantee |
| :--- | :--- | :--- |
| **Agent 1: Extraction** | Connects to ChromaDB, extracts reported and derived financial metrics from audited tables & notes. | Page-exact citations and canonical `million <CCY>` scale normalization. |
| **Agent 2: Analysis** | Computes absolute changes, YoY percentage growth, and margin shift in percentage points. | Strict currency and unit matching. |
| **Agent 3: Red Flag Audit** | Screens for operational anomalies: margin compression, cash flow deficits, leverage spikes, and verbatim risk disclosures. | Transparent audit scoring with verbatim excerpt quotes. |
| **Agent 4: Synthesis & Research** | Powers the conversational Research Copilot and compiles publication-ready executive briefing reports. | Multi-turn session memory with zero generative hallucination. |

---

## 📁 Repository Structure

```text
FinSight_Ai_/
├── backend/                            # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py                     # FastAPI entrypoint, CORS & lifespan sync
│   │   ├── core/                       # Dynamic config, dataset loader, models
│   │   ├── agents/                     # Multi-Agent intelligence system (Agents 1-4)
│   │   └── api/                        # REST routes (/health, /analyze, /chat, etc.)
│   ├── scripts/                        # Ingestion & batch scripts
│   ├── tests/                          # Backend verification & unit tests
│   ├── legacy_streamlit/               # Original Streamlit application for reference
│   ├── Dockerfile                      # Container deployment file
│   └── requirements.txt                # Python backend dependencies
│
├── frontend/                           # Next.js 14 Frontend for Vercel
│   ├── src/app/                        # Next.js App Router (7 interactive views)
│   ├── src/components/                 # Emerald UI components, Sidebar, Header
│   ├── src/lib/                        # Typed API client & data interfaces
│   ├── package.json                    # Frontend dependencies
│   ├── tailwind.config.js              # Theme styling configuration
│   └── vercel.json                     # Vercel deployment configuration
│
├── docs/                               # Agile templates and test plans
├── .env.example                        # Environment variables template
├── .gitignore                          # Excludes secrets, node_modules, and data/
└── README.md
```

---

## 🚀 Deployment Guide (100% Free Tier)

### Step 1: Deploy Backend on Render (100% Free Python Web Service)

1. Sign up / Log into [Render.com](https://render.com) using your GitHub account.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select your repository: `AkshayaV-13/Finsight_Ai_`.
4. Configure the Web Service settings:
   * **Name**: `finsight-ai-backend`
   * **Region**: Choose closest to you (e.g., Singapore, Frankfurt, Oregon)
   * **Branch**: `restructure-vercel-migration` (or `main` after merging)
   * **Root Directory**: `backend`
   * **Runtime**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * **Instance Type**: **Free**
5. Under **Environment Variables**, add:
   * `DATA_DIR`: `./data`
   * `HF_DATASET_REPO`: `Akshaya-V/finsight_ai_dataset`
   * `CORS_ORIGINS`: `*`
6. Click **Deploy Web Service**.
7. Once deployed, copy your Render URL (e.g. `https://finsight-ai-backend.onrender.com`).

---

### Step 2: Deploy Frontend on Vercel (100% Free Global Edge)

1. Log into [Vercel](https://vercel.com) with GitHub.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Select `Finsight_Ai_`.
4. In project configuration:
   * **Framework Preset**: **Next.js**
   * **Root Directory**: Click edit and select `frontend`
   * **Environment Variables**:
     * Key: `NEXT_PUBLIC_API_URL`
     * Value: Your Render backend URL (e.g., `https://finsight-ai-backend.onrender.com`)
5. Click **Deploy**. In under a minute, Vercel will provide your live URL (e.g., `https://finsight-ai.vercel.app`).
6. Paste your live URLs into the top of this `README.md`!

---

## 💻 Local Development

### 1. Backend (FastAPI on Port 8000)
```bash
cd backend
python -m venv .venv
# Activate virtual environment:
# Windows: .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* Interactive API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
* Health Check Endpoint: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 2. Frontend (Next.js on Port 3000)
```bash
cd frontend
npm install
npm run dev
```
* Web App: [http://localhost:3000](http://localhost:3000)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
