import {
  HealthResponse,
  CatalogResponse,
  AnalyzeResponse,
  CompareResponse,
  ResearchResponse,
  ReportResponse,
  VisualResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || `API request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function getHealth(): Promise<HealthResponse> {
  return fetchJson<HealthResponse>("/api/health");
}

export async function getCatalog(): Promise<CatalogResponse> {
  return fetchJson<CatalogResponse>("/api/catalog");
}

export async function analyzeCompany(
  company: string,
  previousYear: string,
  currentYear: string
): Promise<AnalyzeResponse> {
  return fetchJson<AnalyzeResponse>("/api/analyze", {
    method: "POST",
    body: JSON.stringify({
      company,
      previous_year: previousYear,
      current_year: currentYear,
    }),
  });
}

export async function compareCompanies(
  companies: string[],
  fiscalYear: string,
  metrics?: string[]
): Promise<CompareResponse> {
  return fetchJson<CompareResponse>("/api/compare", {
    method: "POST",
    body: JSON.stringify({
      companies,
      fiscal_year: fiscalYear,
      metrics: metrics || ["revenue", "net_income", "eps", "operating_margin"],
    }),
  });
}

export async function askResearch(
  query: string,
  sessionId?: string
): Promise<ResearchResponse> {
  return fetchJson<ResearchResponse>("/api/research", {
    method: "POST",
    body: JSON.stringify({ query, session_id: sessionId }),
  });
}

export async function generateReport(
  company: string,
  previousYear: string,
  currentYear: string
): Promise<ReportResponse> {
  return fetchJson<ReportResponse>("/api/report", {
    method: "POST",
    body: JSON.stringify({
      company,
      previous_year: previousYear,
      current_year: currentYear,
    }),
  });
}

export async function getVisualMetrics(company: string): Promise<VisualResponse> {
  return fetchJson<VisualResponse>(`/api/visual/${encodeURIComponent(company)}`);
}

export async function uploadReport(
  file: File,
  company: string,
  fiscalYear: number
): Promise<{ status: string; filename: string; pages: number; chunks: number; indexed: number }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("company", company);
  formData.append("fiscal_year", fiscalYear.toString());

  const response = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Upload failed");
  }

  return response.json();
}
