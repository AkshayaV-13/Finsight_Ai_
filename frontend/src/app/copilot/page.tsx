"use client";

import { useState } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { askResearch } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  route?: string;
}

const PRESET_QUERIES = [
  "Compare Apple's FY2023 and FY2024 revenue, net income, diluted EPS and operating margin. Explain the changes using only the indexed annual reports.",
  "Compare Apple, Microsoft and Amazon for FY2024 revenue, net income and operating margin.",
  "What financial risks are mentioned in Microsoft's annual report for FY2024?",
];

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to FinSight AI Research Copilot. Ask any question about indexed companies' margins, risks, or comparisons. Every response is grounded in verbatim citations.",
      route: "system",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || input;
    if (!q.trim() || loading) return;

    const userMessage: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await askResearch(q);
      const assistantMessage: Message = {
        role: "assistant",
        content: res.markdown,
        route: res.route,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error executing research query: ${err.message || "Failed to reach backend API."}`,
          route: "error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-14rem)]">
      <div>
        <h2 className="text-xl font-bold text-[#0B251D]">💬 Institutional Research Copilot</h2>
        <p className="text-sm text-[#5E6963] mt-1">
          Ask natural-language questions about any indexed company's financial results, margins, risks, or comparisons.
          Every figure is grounded in verbatim citations from audited filings.
        </p>
      </div>

      {/* Preset Queries */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] font-bold text-[#5E6963] uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Quick Queries:
        </span>
        {PRESET_QUERIES.map((query, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(query)}
            className="text-xs bg-white border border-[#0F382C]/15 hover:border-[#0F382C]/40 text-[#333C37] px-3 py-1.5 rounded-full transition-colors shadow-2xs truncate max-w-xs"
          >
            {query.slice(0, 45)}...
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 bg-white/60 p-4 rounded-2xl border border-[#0F382C]/10 shadow-inner">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-3xl ${
              m.role === "user" ? "ml-auto justify-end" : "mr-auto justify-start"
            }`}
          >
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-[#0F382C] text-[#D4AF37] flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                m.role === "user"
                  ? "bg-[#0F382C] text-white rounded-tr-none"
                  : "bg-white border border-[#0F382C]/10 text-[#1A1F1D] rounded-tl-none"
              }`}
            >
              {m.route && m.role === "assistant" && (
                <div className="flex justify-between items-center mb-2 pb-1 border-b border-[#0F382C]/10 text-[10px] font-bold text-[#5E6963]">
                  <span>FinSight Intelligence</span>
                  <span className="badge-reported uppercase">{m.route}</span>
                </div>
              )}
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>

            {m.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/30 text-[#0F382C] flex items-center justify-center shrink-0 text-xs font-bold">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-xs text-[#5E6963]">
            <Loader2 className="w-4 h-4 animate-spin text-[#0F382C]" />
            Retrieving annual report evidence and synthesizing response...
          </div>
        )}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a financial question (e.g., 'What was Tesla\'s FY2024 EPS and operating cash flow?')..."
          className="flex-1 px-4 py-3 rounded-xl border border-[#0F382C]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F382C]/30 text-sm shadow-xs"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-[#0F382C] hover:bg-[#164E3D] disabled:opacity-50 text-white px-5 rounded-xl flex items-center justify-center shadow-xs transition-colors"
        >
          <Send className="w-4 h-4 text-[#D4AF37]" />
        </button>
      </form>
    </div>
  );
}
