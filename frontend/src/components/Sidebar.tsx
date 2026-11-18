"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Upload,
  MessageSquare,
  BarChart3,
  Scale,
  LineChart,
  FileText,
  Database,
  Building2,
} from "lucide-react";
import { getHealth } from "@/lib/api";
import { HealthResponse } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/", label: "Executive Overview", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Report", icon: Upload },
  { href: "/copilot", label: "Research Copilot", icon: MessageSquare },
  { href: "/analysis", label: "Company Analysis", icon: BarChart3 },
  { href: "/comparison", label: "Company Comparison", icon: Scale },
  { href: "/visual", label: "Visual Analytics", icon: LineChart },
  { href: "/report", label: "Report Copilot", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch((err) => console.warn("Backend not yet connected:", err));
  }, []);

  return (
    <aside className="w-64 bg-[#F4F3EE] border-r border-[#0F382C]/10 flex flex-col justify-between min-h-screen p-5 shrink-0">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <span className="text-2xl">📈</span>
          <div>
            <div className="font-extrabold text-[#0B251D] text-lg tracking-tight">FinSight AI</div>
            <div className="text-[10px] text-[#5E6963] uppercase tracking-wider font-semibold">Institutional Edition</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#0F382C] text-white shadow-sm"
                    : "text-[#333C37] hover:bg-[#0F382C]/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#D4AF37]" : "text-[#5E6963]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Vector Store Telemetry Widget */}
      <div className="bg-white rounded-xl p-4 border border-[#0F382C]/10 shadow-sm mt-8">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0F382C] uppercase tracking-wider mb-2">
          <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
          Active Vector Store
        </div>
        <div className="text-xs text-[#5E6963] space-y-1 mb-3">
          <div>Engine: <span className="font-semibold text-[#1A1F1D]">ChromaDB (Cosine)</span></div>
          <div>Model: <span className="font-mono text-[11px] text-[#1A1F1D]">all-MiniLM-L6-v2</span></div>
          <div>Records: <span className="font-bold text-[#0F382C]">{health?.total_chunks?.toLocaleString() ?? "2,500+"}</span></div>
          <div>Enterprises: <span className="font-bold text-[#0F382C]">{health?.company_count ?? "7"}</span></div>
        </div>

        {health?.companies && (
          <div>
            <div className="text-[11px] font-bold text-[#333C37] mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#5E6963]" />
              Coverage
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-[11px] text-[#5E6963]">
              {Object.entries(health.companies).map(([comp, yrs]) => (
                <div key={comp} className="flex justify-between">
                  <span className="font-medium text-[#1A1F1D] truncate">{comp}</span>
                  <span className="text-[10px] text-[#5E6963]">({yrs.map((y) => `'${y.slice(-2)}`).join(", ")})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
