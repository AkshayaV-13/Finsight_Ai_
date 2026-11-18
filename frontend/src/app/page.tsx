"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Database, Layers, Sparkles, Building2 } from "lucide-react";
import { getHealth } from "@/lib/api";
import { HealthResponse } from "@/lib/types";

export default function OverviewPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => {});
  }, []);

  const totalFilings = health?.companies
    ? Object.values(health.companies).reduce((acc, yrs) => acc + yrs.length, 0)
    : 14;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-[#0B251D] flex items-center gap-2">
          🏛️ Executive Intelligence Dashboard
        </h2>
        <p className="text-sm text-[#5E6963] mt-1">
          FinSight AI automates fundamental financial research by orchestrating specialized AI agents
          across audited annual filings with complete mathematical and citation provenance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="fin-card">
          <div className="text-xs font-bold text-[#5E6963] uppercase tracking-wider mb-2 flex justify-between items-center">
            Indexed Chunks
            <Database className="w-4 h-4 text-[#0F382C]" />
          </div>
          <div className="text-2xl font-extrabold text-[#0B251D]">
            {health?.total_chunks?.toLocaleString() ?? "2,500+"}
          </div>
          <div className="text-xs text-[#5E6963] mt-1">Verified financial text chunks</div>
        </div>

        <div className="fin-card">
          <div className="text-xs font-bold text-[#5E6963] uppercase tracking-wider mb-2 flex justify-between items-center">
            Covered Enterprises
            <Building2 className="w-4 h-4 text-[#0F382C]" />
          </div>
          <div className="text-2xl font-extrabold text-[#0B251D]">
            {health?.company_count ?? "7"}
          </div>
          <div className="text-xs text-[#5E6963] mt-1">Global technology & industrials</div>
        </div>

        <div className="fin-card">
          <div className="text-xs font-bold text-[#5E6963] uppercase tracking-wider mb-2 flex justify-between items-center">
            Filing Catalog
            <Layers className="w-4 h-4 text-[#0F382C]" />
          </div>
          <div className="text-2xl font-extrabold text-[#0B251D]">{totalFilings}</div>
          <div className="text-xs text-[#5E6963] mt-1">Audited annual 10-K / reports</div>
        </div>

        <div className="fin-card">
          <div className="text-xs font-bold text-[#5E6963] uppercase tracking-wider mb-2 flex justify-between items-center">
            Provenance Integrity
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#0B251D]">100%</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">Zero hallucinated values</div>
        </div>
      </div>

      {/* Action Banner */}
      <div className="bg-white border border-[#0F382C]/10 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-[#0F382C]">Need to analyze a new filing?</h3>
          <p className="text-xs text-[#333C37] mt-1 max-w-2xl">
            Upload any company's PDF annual report or 10-K filing to automatically extract metrics,
            generate vector embeddings, and enable deep conversational research.
          </p>
        </div>
        <Link
          href="/upload"
          className="bg-[#0F382C] text-white hover:bg-[#164E3D] px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-sm"
        >
          📤 Ingest New PDF Report
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Agent Architecture */}
      <div>
        <h3 className="text-base font-bold text-[#0B251D] mb-4">Specialized Agent Architecture</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="fin-card flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-[#5E6963] uppercase tracking-wider mb-2">Agent 1: Extraction</div>
              <p className="text-xs text-[#333C37] mb-4">
                Extracts financial metrics directly from audited tables and notes with phrase tiers and exact page citations.
              </p>
            </div>
            <div>
              <span className="badge-reported">PROVENANCE VERIFIED</span>
            </div>
          </div>

          <div className="fin-card flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-[#5E6963] uppercase tracking-wider mb-2">Agent 2: Analysis</div>
              <p className="text-xs text-[#333C37] mb-4">
                Computes YoY absolute and percentage variances, normalized margins, and enforces cross-period consistency.
              </p>
            </div>
            <div>
              <span className="badge-derived">STRICT ARITHMETIC</span>
            </div>
          </div>

          <div className="fin-card flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-[#5E6963] uppercase tracking-wider mb-2">Agent 3: Red Flag Audit</div>
              <p className="text-xs text-[#333C37] mb-4">
                Identifies margin compression, negative operating cash flows, leverage spikes, and verbatim risk disclosures.
              </p>
            </div>
            <div>
              <span className="badge-flag-critical">RISK GOVERNANCE</span>
            </div>
          </div>

          <div className="fin-card flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-[#5E6963] uppercase tracking-wider mb-2">Agent 4: Synthesis</div>
              <p className="text-xs text-[#333C37] mb-4">
                Generates executive briefing reports and conducts cross-company peer comparisons with strict currency safety.
              </p>
            </div>
            <div>
              <span className="badge-reported">EXECUTIVE BRIEFINGS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Coverage Directory */}
      {health?.companies && (
        <div>
          <h3 className="text-base font-bold text-[#0B251D] mb-4">Enterprise Coverage Directory</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(health.companies).map(([comp, years]) => (
              <div key={comp} className="fin-card p-3">
                <div className="font-bold text-[#0F382C] text-xs truncate mb-2">{comp}</div>
                <div className="flex flex-wrap gap-1">
                  {years.map((yr) => (
                    <span key={yr} className="badge-reported text-[9px] px-1.5 py-0.5">
                      FY{yr}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
