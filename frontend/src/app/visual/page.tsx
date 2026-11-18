"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getCatalog, getVisualMetrics } from "@/lib/api";
import { VisualResponse } from "@/lib/types";

export default function VisualPage() {
  const [catalog, setCatalog] = useState<Record<string, string[]>>({});
  const [selectedComp, setSelectedComp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<VisualResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCatalog().then((res) => {
      setCatalog(res.companies);
      const comps = Object.keys(res.companies);
      if (comps.length > 0) {
        setSelectedComp(comps[0]);
        loadCompanyVisuals(comps[0]);
      }
    });
  }, []);

  const loadCompanyVisuals = async (comp: string) => {
    setSelectedComp(comp);
    setLoading(true);
    setError(null);
    try {
      const res = await getVisualMetrics(comp);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load visual data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0B251D]">📈 Visual Analytics & Financial Trends</h2>
        <p className="text-sm text-[#5E6963] mt-1">
          Interactive graphical analysis of revenue growth, profitability margins, and capital structure.
          Every chart is rendered strictly from verified annual report values.
        </p>
      </div>

      {/* Target Selector */}
      <div className="bg-white p-5 rounded-2xl border border-[#0F382C]/10 shadow-sm flex items-center gap-4">
        <label className="text-xs font-bold text-[#333C37] uppercase tracking-wider">Target Company:</label>
        <select
          value={selectedComp}
          onChange={(e) => loadCompanyVisuals(e.target.value)}
          className="px-4 py-2 rounded-lg border border-[#0F382C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F382C]/20 bg-white"
        >
          {Object.keys(catalog).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {data && (
          <div className="text-xs text-[#5E6963]">
            Covered Periods: <span className="font-semibold text-[#0F382C]">{data.years.map((y) => `FY${y}`).join(", ")}</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-[#5E6963] p-8 justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[#0F382C]" />
          Extracting multi-year data points for {selectedComp}...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Revenue & Net Income */}
          <div className="fin-card">
            <h4 className="font-bold text-xs text-[#5E6963] uppercase tracking-wider mb-4">
              Revenue & Net Income Trajectory (Millions)
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0F382C" strokeOpacity={0.06} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0F382C" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net_income" fill="#D4AF37" name="Net Income" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Profitability Margins */}
          <div className="fin-card">
            <h4 className="font-bold text-xs text-[#5E6963] uppercase tracking-wider mb-4">
              Profitability Margin Trends (%)
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0F382C" strokeOpacity={0.06} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="gross_margin" stroke="#164E3D" strokeWidth={3} name="Gross Margin %" />
                  <Line type="monotone" dataKey="operating_margin" stroke="#B8972E" strokeWidth={3} name="Operating Margin %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Diluted EPS */}
          <div className="fin-card">
            <h4 className="font-bold text-xs text-[#5E6963] uppercase tracking-wider mb-4">
              Diluted Earnings Per Share ($)
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0F382C" strokeOpacity={0.06} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="eps" fill="#0F382C" name="Diluted EPS" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Operating Cash Flow */}
          <div className="fin-card">
            <h4 className="font-bold text-xs text-[#5E6963] uppercase tracking-wider mb-4">
              Operating Cash Flow ($)
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0F382C" strokeOpacity={0.06} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="cash_flow" stroke="#164E3D" fill="#0F382C" fillOpacity={0.15} name="Cash Flow" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
