"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Scale } from "lucide-react";
import { getCatalog, compareCompanies } from "@/lib/api";
import { CompareResponse } from "@/lib/types";

export default function ComparisonPage() {
  const [catalog, setCatalog] = useState<Record<string, string[]>>({});
  const [selectedComps, setSelectedComps] = useState<string[]>([]);
  const [allYears, setAllYears] = useState<string[]>([]);
  const [year, setYear] = useState<string>("2024");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCatalog().then((res) => {
      setCatalog(res.companies);
      const comps = Object.keys(res.companies);
      if (comps.length >= 2) {
        setSelectedComps(comps.slice(0, 3));
      }
      const yrs = Array.from(new Set(Object.values(res.companies).flat())).sort().reverse();
      setAllYears(yrs);
      if (yrs.length > 0) setYear(yrs[0]);
    });
  }, []);

  const toggleCompany = (comp: string) => {
    setSelectedComps((prev) =>
      prev.includes(comp) ? prev.filter((c) => c !== comp) : [...prev, comp]
    );
  };

  const handleRunComparison = async () => {
    if (selectedComps.length < 2) {
      setError("Please select at least two companies to benchmark.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await compareCompanies(selectedComps, year);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Comparison failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0B251D]">⚖️ Cross-Company Benchmarking</h2>
        <p className="text-sm text-[#5E6963] mt-1">
          Compare fundamental performance metrics across multiple enterprises for a common fiscal year.
          Strict accounting checks prevent erroneous comparisons across differing currencies and units.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#0F382C]/10 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#333C37] uppercase tracking-wider mb-2">
            Select Enterprises to Benchmark (Min 2)
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(catalog).map((comp) => {
              const isSelected = selectedComps.includes(comp);
              return (
                <button
                  key={comp}
                  type="button"
                  onClick={() => toggleCompany(comp)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors font-medium ${
                    isSelected
                      ? "bg-[#0F382C] text-white border-[#0F382C]"
                      : "bg-white text-[#333C37] border-[#0F382C]/20 hover:border-[#0F382C]/40"
                  }`}
                >
                  {comp}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-48">
            <label className="block text-xs font-bold text-[#333C37] uppercase tracking-wider mb-1.5">
              Fiscal Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#0F382C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F382C]/20 bg-white"
            >
              {allYears.map((y) => (
                <option key={y} value={y}>FY{y}</option>
              ))}
            </select>
          </div>

          <div className="self-end">
            <button
              onClick={handleRunComparison}
              disabled={loading || selectedComps.length < 2}
              className="bg-[#0F382C] hover:bg-[#164E3D] disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  Benchmarking...
                </>
              ) : (
                "Run Comparison Analysis"
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Comparison Results */}
      {data && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-[#0F382C]">Benchmark Results — FY{data.fiscal_year}</h3>

          {data.comparisons.map((c, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-[#0F382C]/10 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#0F382C]/10">
                <h4 className="font-bold text-sm text-[#0B251D]">{c.metric_label}</h4>
                <span className="badge-reported uppercase text-[10px]">{c.metric}</span>
              </div>

              {c.incompatibility && (
                <div className="p-3 bg-[#FBF8EE] border-l-4 border-[#D4AF37] rounded text-xs text-[#6E5311]">
                  <strong>⚠️ Currency / Unit Advisory:</strong> {c.incompatibility.reason}. Nominal amounts in different currencies are preserved in their native units and not falsely equated.
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#0F382C]/10 text-[#5E6963]">
                      <th className="py-2.5 px-3 font-semibold">Company</th>
                      <th className="py-2.5 px-3 font-semibold">Value</th>
                      <th className="py-2.5 px-3 font-semibold">Currency</th>
                      <th className="py-2.5 px-3 font-semibold">Basis</th>
                      <th className="py-2.5 px-3 font-semibold">Source File</th>
                      <th className="py-2.5 px-3 font-semibold">Page</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0F382C]/5 text-[#1A1F1D]">
                    {c.entries.map((entry, eIdx) => (
                      <tr key={eIdx} className="hover:bg-[#F9F8F5]">
                        <td className="py-2.5 px-3 font-bold text-[#0F382C]">{entry.company}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold">
                          {entry.value !== null && entry.value !== undefined
                            ? `${entry.value.toLocaleString()} ${entry.unit || ""}`
                            : "Not Found"}
                        </td>
                        <td className="py-2.5 px-3">{entry.currency || "—"}</td>
                        <td className="py-2.5 px-3">
                          <span className={entry.derived ? "badge-derived" : "badge-reported"}>
                            {entry.derived ? "Derived" : "Reported"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#5E6963] font-mono">{entry.source_file || "—"}</td>
                        <td className="py-2.5 px-3 text-[#5E6963]">p.{entry.page_number ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {c.relations && c.relations.length > 0 && (
                <div className="pt-2 text-xs text-[#333C37] space-y-1">
                  <div className="font-bold text-[#0F382C]">Pairwise Findings:</div>
                  {c.relations.map((r, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-1.5 text-[#5E6963]">
                      <span>•</span>
                      <span>{r.statement}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
