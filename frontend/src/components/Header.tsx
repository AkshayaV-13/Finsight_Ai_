import { Database } from "lucide-react";

export default function Header() {
  return (
    <div className="bg-gradient-to-r from-[#0F382C] to-[#0B251D] text-white p-6 rounded-2xl border border-[#D4AF37]/40 shadow-md mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            📈 FinSight AI
          </h1>
          <span className="bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            Institutional Edition
          </span>
        </div>
        <p className="text-sm text-[#D3DFDA] mt-1 font-normal">
          Autonomous Multi-Agent Financial Research, YoY Audit & Provenance Intelligence
        </p>
      </div>

      <div className="text-right text-xs text-[#D3DFDA] flex items-center gap-3 self-end md:self-auto">
        <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
        <span className="font-semibold text-white">ChromaDB Live</span>
        <span>•</span>
        <span>Zero Hallucinated Values</span>
      </div>
    </div>
  );
}
