export interface HealthResponse {
  status: string;
  vectordb_ready: boolean;
  dataset_ready: boolean;
  total_chunks: number;
  company_count: number;
  companies: Record<string, string[]>;
  dataset_repo: string;
}

export interface CatalogResponse {
  companies: Record<string, string[]>;
  total_chunks: number;
}

export interface MetricRecord {
  metric?: string;
  value?: number | null;
  unit?: string | null;
  currency?: string | null;
  status?: string;
  derived?: boolean;
  source_file?: string | null;
  page_number?: number | null;
  evidence?: string | null;
  confidence?: string | null;
  warnings?: string[];
  calculation?: string | null;
  reason?: string | null;
}

export interface MetricComparison {
  metric?: string;
  previous_value?: number | null;
  current_value?: number | null;
  absolute_change?: number | null;
  percentage_change?: number | null;
  margin_change_percentage_points?: number | null;
  direction?: string;
  unit?: string | null;
  currency?: string | null;
  status?: string;
  reason?: string | null;
}

export interface RedFlagAlert {
  category?: string;
  severity?: "informational" | "moderate" | "high" | "critical";
  title?: string;
  description?: string;
  criteria?: string;
  evidence?: string;
  source_file?: string;
  page_number?: number;
}

export interface AnalyzeResponse {
  status: string;
  company: string;
  previous_year: string;
  current_year: string;
  agent_1: {
    previous?: Record<string, MetricRecord>;
    current?: Record<string, MetricRecord>;
  };
  agent_2: {
    result?: {
      comparisons?: Record<string, MetricComparison>;
      summary?: string;
    };
  };
  agent_3: {
    result?: {
      red_flags?: RedFlagAlert[];
      red_flag_score?: number;
      summary?: string;
    };
  };
  limitations?: Array<{ stage?: string; message?: string }>;
  pipeline_errors?: Array<{ stage?: string; message?: string }>;
}

export interface ComparisonEntry {
  company: string;
  value?: number | null;
  unit?: string | null;
  currency?: string | null;
  derived?: boolean;
  source_file?: string | null;
  page_number?: number | null;
  status?: string;
}

export interface ComparisonBlock {
  metric: string;
  metric_label: string;
  entries: ComparisonEntry[];
  relations?: Array<{ statement: string }>;
  incompatibility?: {
    reason: string;
    currencies?: string[];
  } | null;
}

export interface CompareResponse {
  comparisons: ComparisonBlock[];
  limitations: any[];
  companies: string[];
  fiscal_year: string;
}

export interface ResearchResponse {
  query: string;
  route: string;
  markdown: string;
  plan?: any;
  sources: any[];
}

export interface ReportResponse {
  markdown: string;
  report: Record<string, any>;
}

export interface VisualDataSeries {
  year: string;
  raw_year: number;
  revenue?: number | null;
  net_income?: number | null;
  eps?: number | null;
  operating_margin?: number | null;
  gross_margin?: number | null;
  cash_flow?: number | null;
}

export interface VisualResponse {
  company: string;
  years: string[];
  series: VisualDataSeries[];
}
