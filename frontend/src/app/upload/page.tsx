"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { uploadReport } from "@/lib/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [company, setCompany] = useState("");
  const [year, setYear] = useState<number>(2024);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !company.trim()) {
      setError("Please select a PDF file and provide a company name.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await uploadReport(file, company.trim(), year);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to process and index PDF report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0B251D]">📄 Annual Report Ingestion Pipeline</h2>
        <p className="text-sm text-[#5E6963] mt-1">
          Upload a verified PDF annual report to parse, chunk, embed, and index into the persistent ChromaDB collection.
          The document immediately becomes available for conversational queries, automated ratio analysis, and comparison.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#0F382C]/10 shadow-sm">
          <form onSubmit={handleUpload} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#333C37] uppercase tracking-wider mb-2">
                Select Annual Report PDF (up to 200MB)
              </label>
              <div className="border-2 border-dashed border-[#0F382C]/20 hover:border-[#0F382C]/40 rounded-xl p-8 text-center bg-[#F9F8F5] transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-10 h-10 text-[#0F382C] mx-auto mb-2" />
                <div className="text-sm font-semibold text-[#1A1F1D]">
                  {file ? file.name : "Click or drag & drop PDF annual report here"}
                </div>
                <div className="text-xs text-[#5E6963] mt-1">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Audited 10-K, Integrated Annual Report"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#333C37] uppercase tracking-wider mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apple, Alphabet, Tesla"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#0F382C]/15 focus:outline-none focus:ring-2 focus:ring-[#0F382C]/20 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333C37] uppercase tracking-wider mb-2">
                  Fiscal Year
                </label>
                <input
                  type="number"
                  min={2015}
                  max={2030}
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#0F382C]/15 focus:outline-none focus:ring-2 focus:ring-[#0F382C]/20 text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F382C] hover:bg-[#164E3D] disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  Processing through Multi-Agent Ingestion Pipeline...
                </>
              ) : (
                "🚀 Process & Index Report"
              )}
            </button>
          </form>

          {/* Feedback messages */}
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Successfully Indexed!</span> Processed {result.filename} ({result.pages} pages, {result.chunks} chunks, {result.indexed} new records added to ChromaDB).
              </div>
            </div>
          )}
        </div>

        {/* Specifications Card */}
        <div className="fin-card">
          <h3 className="text-sm font-bold text-[#0F382C] mb-3">Pipeline Specifications</h3>
          <ul className="text-xs text-[#333C37] space-y-3">
            <li>
              <strong>Page-Exact Provenance:</strong> Text is extracted page-by-page to ensure every citation links to an exact physical page.
            </li>
            <li>
              <strong>Overlap Windowing:</strong> 600-word chunks with 100-word sliding overlap preserve financial table contexts.
            </li>
            <li>
              <strong>Neural Embeddings:</strong> Normalized 384-dimensional dense vectors using <code>all-MiniLM-L6-v2</code>.
            </li>
            <li>
              <strong>De-duplication Guard:</strong> ChromaDB unique chunk hashes prevent duplicate entries if re-run.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
