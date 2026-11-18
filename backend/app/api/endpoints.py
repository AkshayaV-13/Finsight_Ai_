"""
endpoints.py

FastAPI router exposing all FinSight AI multi-agent capabilities as clean REST endpoints:
  - GET  /api/health       Telemetry & Vector Store health
  - GET  /api/catalog      Indexed enterprises and available fiscal years
  - POST /api/analyze      Sequential multi-agent analysis (Agent 1 + Agent 2 + Agent 3)
  - POST /api/compare      Cross-company peer benchmarking with currency safety
  - POST /api/research     Conversational research query (Grounded in ChromaDB citations)
  - POST /api/report       Executive briefing report generation (Markdown & structured)
  - GET  /api/visual/{comp}Multi-year financial metrics for interactive charts
  - POST /api/upload       PDF annual report ingestion pipeline
"""

import json
import logging
from typing import Dict, List, Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.api.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    CatalogResponse,
    CompareRequest,
    CompareResponse,
    HealthResponse,
    ReportRequest,
    ReportResponse,
    ResearchRequest,
    ResearchResponse,
    UploadResponse,
)
from app.core import config, data_loader
from app.agents import (
    comparison_agent,
    multi_agent_orchestrator,
    report_agent,
    chat_interface,
    extraction_agent,
)

LOGGER = logging.getLogger("api.endpoints")
router = APIRouter()

# In-memory store for active chat sessions keyed by session_id
_ACTIVE_CHAT_SESSIONS: Dict[str, chat_interface.ChatSession] = {}


def _get_catalog_helper():
    """Helper to safely fetch index catalog and parsed company coverage."""
    if not data_loader.is_vectordb_ready():
        try:
            data_loader.ensure_data_loaded()
        except Exception as e:
            LOGGER.warning("Could not auto-load dataset during catalog lookup: %s", e)
            return {"counts": {}}, {}

    try:
        raw_catalog = comparison_agent.load_index_catalog()
    except Exception as exc:
        LOGGER.error("Failed to load index catalog: %s", exc)
        return {"counts": {}}, {}

    counts = raw_catalog.get("counts", {})
    coverage: Dict[str, List[str]] = {}
    for (comp, yr), _cnt in counts.items():
        if comp and yr and yr != "unknown":
            coverage.setdefault(comp, set()).add(str(yr))

    sorted_coverage = {c: sorted(list(ys)) for c, ys in sorted(coverage.items())}
    return raw_catalog, sorted_coverage


# ---------------------------------------------------------------------------
# Telemetry & Catalog Endpoints
# ---------------------------------------------------------------------------

@router.get("/health", response_model=HealthResponse)
def get_health():
    """Return backend status, ChromaDB readiness, and indexed enterprise telemetry."""
    v_ready = data_loader.is_vectordb_ready()
    d_ready = data_loader.is_dataset_ready()
    raw_cat, coverage = _get_catalog_helper()
    total_chunks = sum(raw_cat.get("counts", {}).values())

    return HealthResponse(
        status="healthy" if v_ready else "initializing",
        vectordb_ready=v_ready,
        dataset_ready=d_ready,
        total_chunks=total_chunks,
        company_count=len(coverage),
        companies=coverage,
        dataset_repo=config.HF_DATASET_REPO,
    )


@router.get("/catalog", response_model=CatalogResponse)
def get_catalog():
    """Return list of indexed companies and their available fiscal years."""
    raw_cat, coverage = _get_catalog_helper()
    total_chunks = sum(raw_cat.get("counts", {}).values())
    return CatalogResponse(companies=coverage, total_chunks=total_chunks)


# ---------------------------------------------------------------------------
# Multi-Agent Analysis Endpoints
# ---------------------------------------------------------------------------

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_company(req: AnalyzeRequest):
    """
    Run sequential Multi-Agent Orchestrator:
      1. Agent 1 extracts metrics for previous_year and current_year
      2. Agent 2 computes YoY variances and margin changes
      3. Agent 3 evaluates red flag anomaly rules and audit risks
    """
    try:
        result = multi_agent_orchestrator.run_financial_analysis(
            req.company, req.previous_year, req.current_year, verbose=False
        )
    except Exception as exc:
        LOGGER.error("Analysis pipeline error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis pipeline execution failed: {str(exc)}"
        )

    return AnalyzeResponse(
        status=result.get("status", "error"),
        company=req.company,
        previous_year=req.previous_year,
        current_year=req.current_year,
        agent_1=result.get("agent_1", {}),
        agent_2=result.get("agent_2", {}),
        agent_3=result.get("agent_3", {}),
        limitations=result.get("limitations", []),
        pipeline_errors=result.get("pipeline_errors", []),
    )


@router.post("/compare", response_model=CompareResponse)
def compare_companies(req: CompareRequest):
    """
    Run Comparison Agent to benchmark metrics across companies for a common fiscal year
    with strict currency safety and unit normalization.
    """
    if len(req.companies) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least two companies are required for peer comparison."
        )

    try:
        cmp_result = comparison_agent.build_comparison(
            req.companies, [req.fiscal_year], metrics=req.metrics
        )
    except Exception as exc:
        LOGGER.error("Comparison execution failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Comparison failed: {str(exc)}"
        )

    return CompareResponse(
        comparisons=cmp_result.get("comparisons", []),
        limitations=cmp_result.get("limitations", []),
        companies=req.companies,
        fiscal_year=req.fiscal_year,
    )


@router.post("/research", response_model=ResearchResponse)
def ask_research_copilot(req: ResearchRequest):
    """
    Ask a natural-language financial question. Grounded purely in ChromaDB vectors
    with verbatim citation provenance.
    """
    session_id = req.session_id or "default_session"
    if session_id not in _ACTIVE_CHAT_SESSIONS:
        _ACTIVE_CHAT_SESSIONS[session_id] = chat_interface.create_session()

    session = _ACTIVE_CHAT_SESSIONS[session_id]
    try:
        turn = session.ask(req.query)
    except Exception as exc:
        LOGGER.error("Research copilot query failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Research copilot could not complete query."
        )

    return ResearchResponse(
        query=req.query,
        route=turn.get("route", "research"),
        markdown=turn.get("markdown", ""),
        plan=turn.get("plan"),
        sources=turn.get("sources", []),
    )


@router.post("/report", response_model=ReportResponse)
def generate_report(req: ReportRequest):
    """
    Generate a publication-ready fundamental research briefing document for an enterprise
    across two fiscal periods.
    """
    try:
        report_obj = report_agent.generate_report(req.company, req.previous_year, req.current_year)
        report_md = report_agent.format_report_markdown(report_obj)
    except Exception as exc:
        LOGGER.error("Report generation failed: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation failed: {str(exc)}"
        )

    return ReportResponse(markdown=report_md, report=report_obj)


@router.get("/visual/{company}")
def get_visual_metrics(company: str):
    """
    Fetch multi-year time-series financial metrics for a company to render
    interactive charts on the frontend.
    """
    _, coverage = _get_catalog_helper()
    available_years = coverage.get(company, [])
    if not available_years:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No indexed data found for company: {company}"
        )

    series_data = []
    metric_keys = ["revenue", "net_income", "eps", "operating_margin", "gross_margin", "cash_flow"]

    for yr in available_years:
        metrics = extraction_agent.extract_metrics(company, yr, metric_keys=metric_keys)
        entry = {"year": f"FY{yr}", "raw_year": int(yr)}
        for k in metric_keys:
            entry[k] = metrics.get(k, {}).get("value")
            entry[f"{k}_unit"] = metrics.get(k, {}).get("unit")
            entry[f"{k}_basis"] = "derived" if metrics.get(k, {}).get("derived") else "reported"
        series_data.append(entry)

    series_data.sort(key=lambda x: x["raw_year"])
    return {"company": company, "years": available_years, "series": series_data}


# ---------------------------------------------------------------------------
# Ingestion Endpoint
# ---------------------------------------------------------------------------

@router.post("/upload", response_model=UploadResponse)
async def upload_annual_report(
    file: UploadFile = File(...),
    company: str = Form(...),
    fiscal_year: int = Form(...)
):
    """
    Upload a PDF annual report and run the full ingestion pipeline:
      1. Save PDF to data/annual_reports
      2. Extract text with pdfplumber into documents/
      3. Chunk text into chunks/
      4. Compute embeddings with sentence-transformers into embeddings/
      5. Index new records into ChromaDB
    """
    import pdfplumber
    import sys
    from pathlib import Path

    # Ingestion scripts
    from scripts import chunk_documents, generate_embeddings, index_chromadb

    safe_company = "".join(c for c in company if c.isalnum() or c in (" ", "_", "-")).strip()
    safe_filename = f"{safe_company}_{fiscal_year}.pdf".replace(" ", "_")

    # Step 1: Save PDF
    config.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    pdf_path = config.REPORTS_DIR / safe_filename
    content = await file.read()
    with open(pdf_path, "wb") as f:
        f.write(content)

    # Step 2: Extract text
    pages_data = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            t = page.extract_text() or ""
            pages_data.append({"page_number": i, "text": t})

    config.DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    doc_json_path = config.DOCUMENTS_DIR / f"{pdf_path.stem}.json"
    with open(doc_json_path, "w", encoding="utf-8") as f:
        json.dump({
            "source_file": safe_filename,
            "company": safe_company,
            "fiscal_year": str(fiscal_year),
            "total_pages": len(pages_data),
            "pages": pages_data,
        }, f, indent=2, ensure_ascii=False)

    # Step 3: Chunking
    chunks = chunk_documents.process_document({
        "source_file": safe_filename,
        "company": safe_company,
        "fiscal_year": str(fiscal_year),
        "total_pages": len(pages_data),
        "pages": pages_data,
    })
    config.CHUNKS_DIR.mkdir(parents=True, exist_ok=True)
    chunks_path = config.CHUNKS_DIR / f"{pdf_path.stem}_chunks.json"
    with open(chunks_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)

    # Step 4: Embeddings
    model = generate_embeddings.get_model()
    generate_embeddings.process_chunk_file(model, chunks_path)

    # Step 5: Indexing
    embeddings_path = config.EMBEDDINGS_DIR / f"{pdf_path.stem}_embeddings.json"
    with open(embeddings_path, "r", encoding="utf-8") as f:
        emb_records = json.load(f)

    _, collection = index_chromadb.get_chroma_collection()
    added_count, _, _ = index_chromadb.index_records(collection, emb_records)

    return UploadResponse(
        status="success",
        filename=safe_filename,
        pages=len(pages_data),
        chunks=len(chunks),
        indexed=added_count,
    )
