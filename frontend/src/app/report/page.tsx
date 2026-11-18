"use client";

import { useEffect, useState } from "react";
import { Loader2, Download, FileText } from "lucide-react";
import { getCatalog, generateReport } from "@/lib/api";
import { ReportResponse } from "@/lib/types";

export default function ReportPage() {
  const [catalog, setCatalog] = useState<Record<string, string[]>>({});
  const [company, setCompany] = useState("");
  const [priorYear, setPriorYear] = useState("");
  const [currYear, setCurrYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCatalog().then((res) => {
      setCatalog(res.companies);
      const comps = Object.keys(res.companies);
      if (comps.length > 0) {
        setCompany(comps[0]);
        const years = res.companies[comps[0]];
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
    }
  };

  const handleGenerateReport = async () => {
    if (!company || !priorYear || !currYear) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateReport(company, priorYear, currYear);
      setReportData(res);
    } catch (err: any) {
      setError(err.message || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (format: "md" | "txt") => {
    if (!reportData) return;
    const blob = new Blob([reportData.markdown], {
      type: format === "md" ? "text/markdown" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FinSight_${company}_FY${priorYear}_FY${currYear}_Report.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0B251D]">📑 Executive Report Generator</h2>
        <p className="text-sm text-[#5E6963] mt-1">
          Generate a publication-ready fundamental research briefing document for an enterprise across two fiscal periods.
          Includes executive summaries, key financials, red flag risk assessments, and compliance disclaimers.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#0F382C]/10 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-[#333C37] uppercase tracking-wider mb-1.5">
            Enterprise
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
          onClick={handleGenerateReport}
          disabled={loading || !company}
          className="bg-[#0F382C] hover:bg-[#164E3D] disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
              Compiling Briefing...
            </>
          ) : (
            "Generate Briefing"
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Generated Report View */}
      {reportData && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => downloadFile("md")}
              className="bg-white border border-[#0F382C]/20 hover:border-[#0F382C]/50 text-[#0F382C] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              📥 Download Report (.md)
            </button>
            <button
              onClick={() => downloadFile("txt")}
              className="bg-white border border-[#0F382C]/20 hover:border-[#0F382C]/50 text-[#0F382C] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
              📄 Download Plain Text (.txt)
            </button>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#0F382C]/10 shadow-sm text-xs sm:text-sm text-[#1A1F1D] leading-relaxed whitespace-pre-wrap font-sans">
            {reportData.markdown}
          </div>
        </div>
      )}
    </div>
  );
}
