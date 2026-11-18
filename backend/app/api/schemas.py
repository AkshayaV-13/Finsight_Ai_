"""
schemas.py

Pydantic schemas for request and response validation in the FinSight AI REST API.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------

class AnalyzeRequest(BaseModel):
    company: str = Field(..., description="Target company name, e.g. 'Apple'")
    previous_year: str = Field(..., description="Prior fiscal year, e.g. '2023'")
    current_year: str = Field(..., description="Current fiscal year, e.g. '2024'")


class CompareRequest(BaseModel):
    companies: List[str] = Field(..., min_length=2, description="List of at least two companies to compare")
    fiscal_year: str = Field(..., description="Common fiscal year to compare across, e.g. '2024'")
    metrics: List[str] = Field(
        default=["revenue", "net_income", "eps", "operating_margin"],
        description="List of metric keys to benchmark"
    )


class ResearchRequest(BaseModel):
    query: str = Field(..., min_length=3, description="Financial question or research query")
    session_id: Optional[str] = Field(default=None, description="Optional conversational session ID")


class ReportRequest(BaseModel):
    company: str = Field(..., description="Target company name")
    previous_year: str = Field(..., description="Prior fiscal year")
    current_year: str = Field(..., description="Current fiscal year")


# ---------------------------------------------------------------------------
# Response Schemas
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str
    vectordb_ready: bool
    dataset_ready: bool
    total_chunks: int
    company_count: int
    companies: Dict[str, List[str]]
    dataset_repo: str


class CatalogResponse(BaseModel):
    companies: Dict[str, List[str]]
    total_chunks: int


class AnalyzeResponse(BaseModel):
    status: str
    company: str
    previous_year: str
    current_year: str
    agent_1: Dict[str, Any]
    agent_2: Dict[str, Any]
    agent_3: Dict[str, Any]
    limitations: List[Any] = []
    pipeline_errors: List[Any] = []


class CompareResponse(BaseModel):
    comparisons: List[Dict[str, Any]]
    limitations: List[Any] = []
    companies: List[str]
    fiscal_year: str


class ResearchResponse(BaseModel):
    query: str
    route: str
    markdown: str
    plan: Optional[Dict[str, Any]] = None
    sources: List[Any] = []


class ReportResponse(BaseModel):
    markdown: str
    report: Dict[str, Any]


class UploadResponse(BaseModel):
    status: str
    filename: str
    pages: int
    chunks: int
    indexed: int
