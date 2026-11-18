"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getCatalog, analyzeCompany } from "@/lib/api";
import { AnalyzeResponse } from "@/lib/types";

const METRIC_DEFINITIONS = [
  { key: "revenue", label: "Total Revenue" },
  { key: "net_income", label: "Net Income" },
  { key: "eps", label: "Diluted EPS" },
  { key: "gross_margin", label: "Gross Margin" },
  { key: "operating_margin", label: "Operating Margin" },
  { key: "net_profit_margin", label: "Net Profit Margin" },
  { key: "cash_flow", label: "Operating Cash Flow" },
  { key: "total_debt", label: "Total Debt" },
];

export default function AnalysisPage() {
  const [catalog, setCatalog] = useState<Record<string, string[]>>({});
  const [company, setCompany] = useState("");
  const [priorYear, setPriorYear] = useState("");
  const [currYear, setCurrYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCatalog().then((res) => {
      setCatalog(res.companies);
      const comps = Object.keys(res.companies);
      if (comps.length > 0) {
        const firstComp = comps[0];
        setCompany(firstComp);
        const years = res.companies[firstComp];
        if (years.length >= 2) {
          setPriorYear(years[0]);
          setCurrYear(years[years.length - 1]);
        }
      }
    });
  }, []);

  const handleCompanyChange = (c: string) => {
    setCompany(c);
    const years = catalog[c] || [];
    if (years.length >= 2) {
      setPriorYear(years[0]);
      setCurrYear(years[years.length - 1]);
    } else if (years.length === 1) {
      setPriorYear(years[0]);
      setCurrYear(years[0]);
    }
  };

  const handleRunAnalysis = async () => {
    if (!company || !priorYear || !currYear) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeCompany(company, priorYear, currYear);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0B251D]">📊 Comprehensive Company Analysis</h2>
        <p className="text-sm text-[#5E6963] mt-1">
          Execute automated sequential multi-agent analysis for a selected enterprise across two fiscal years.
          Extracts metrics, validates accounting consistency, computes YoY changes, and runs the Red Flag audit.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#0F382C]/10 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-[#333C37] uppercase tracking-wider mb-1.5">
            Target Company
          </label>
          <select
            value={company}
            onChange={(e) => handleCompanyChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#0F382C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F382C]/20 bg-white"
          >
            {Object.keys(catalog).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="w-36">
          <label className="block text-xs font-bold text-[#333C37] uppercase tracking-wider mb-1.5">
            Prior Year
          </label>
          <select
            value={priorYear}
            onChange={(e) => setPriorYear(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#0F382C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F382C]/20 bg-white"
          >
            {(catalog[company] || []).map((y) => (
              <option key={y} value={y}>FY{y}</option>
            ))}
          </select>
        </div>

        <div className="w-36">
          <label className="block text-xs font-bold text-[#333C37] uppercase tracking-wider mb-1.5">
            Current Year
          </label>
          <select
            value={currYear}
            onChange={(e) => setCurrYear(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#0F382C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F382C]/20 bg-white"
          >
            {(catalog[company] || []).map((y) => (
              <option key={y} value={y}>FY{y}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={loading || !company}
          className="bg-[#0F382C] hover:bg-[#164E3D] disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
              Running Orchestrator...
            </>
          ) : (
            "Run Full Analysis"
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Analysis Results Display */}
      {data && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0F382C]">
              Financial Metrics Dashboard — {data.company} (FY{data.previous_year} vs FY{data.current_year})
            </h3>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {METRIC_DEFINITIONS.map(({ key, label }) => {
              const rec = data.agent_1?.current?.[key];
              const comp = data.agent_2?.result?.comparisons?.[key];
              const hasVal = rec && rec.value !== null && rec.value !== undefined;

              return (
                <div key={key} className="fin-card">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-[#5E6963] uppercase tracking-wider">{label}</span>
                    {hasVal && (
                      <span className={rec.derived ? "badge-derived" : "badge-reported"}>
                        {rec.derived ? "DERIVED" : "REPORTED"}
                      </span>
                    )}
                  </div>

                  <div className="text-xl font-extrabold text-[#0B251D] mb-1">
                    {hasVal ? `${rec.value?.toLocaleString()} ${rec.unit || ""}` : "Not Found"}
                  </div>

                  {/* YoY Delta */}
                  {comp?.percentage_change !== null && comp?.percentage_change !== undefined && (
                    <div className="text-xs font-semibold flex items-center gap-1 mb-2">
                      {comp.percentage_change > 0 ? (
                        <span className="text-emerald-700 flex items-center">
                          <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{comp.percentage_change.toFixed(2)}% YoY
                        </span>
                      ) : comp.percentage_change < 0 ? (
                        <span className="text-rose-700 flex items-center">
                          <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {comp.percentage_change.toFixed(2)}% YoY
                        </span>
                      ) : (
                        <span className="text-gray-500 flex items-center">
                          <Minus className="w-3.5 h-3.5 mr-0.5" /> 0.00% YoY
                        </span>
                      )}
                    </div>
                  )}

                  {comp?.margin_change_percentage_points !== null && comp?.margin_change_percentage_points !== undefined && (
                    <div className="text-xs font-semibold flex items-center gap-1 mb-2">
                      {comp.margin_change_percentage_points > 0 ? (
                        <span className="text-emerald-700 flex items-center">
                          <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{comp.margin_change_percentage_points.toFixed(2)} pts
                        </span>
                      ) : comp.margin_change_percentage_points < 0 ? (
                        <span className="text-rose-700 flex items-center">
                          <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {comp.margin_change_percentage_points.toFixed(2)} pts
                        </span>
                      ) : null}
                    </div>
                  )}

                  {hasVal && (
                    <div className="text-[10px] text-[#5E6963] pt-2 border-t border-[#0F382C]/10 font-mono truncate">
                      Src: {rec.source_file}, p.{rec.page_number}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Red Flag Audit Section */}
          <div className="bg-white p-6 rounded-2xl border border-[#0F382C]/10 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0F382C] uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />
              Agent 3: Red Flag Anomaly & Risk Audit
            </h3>

            {(!data.agent_3?.result?.red_flags || data.agent_3.result.red_flags.length === 0) ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                ✅ <strong>Zero Critical Red Flags Detected:</strong> Operating cash flows, margins, and leverage parameters satisfy healthy bounds.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-amber-800">
                  ⚠️ {data.agent_3.result.red_flags.length} Risk Alerts Flagged (Audit Score: {data.agent_3.result.red_flag_score})
                </div>
                {data.agent_3.result.red_flags.map((flag, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#F9F8F5] border border-[#0F382C]/10 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#0B251D]">🚩 {flag.title || flag.category}</span>
                      <span className={flag.severity === "high" || flag.severity === "critical" ? "badge-flag-critical" : "badge-flag-info"}>
                        {(flag.severity || "MODERATE").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[#333C37]">{flag.description}</p>
                    {flag.evidence && (
                      <blockquote className="italic border-l-2 border-[#D4AF37] pl-2 text-[#5E6963]">
                        "{flag.evidence}"
                      </blockquote>
                    )}
                    {flag.source_file && (
                      <div className="text-[10px] text-[#5E6963]">Source: {flag.source_file}, p.{flag.page_number}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
