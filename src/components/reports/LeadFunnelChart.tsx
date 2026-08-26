import React from "react";
import { Filter } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface FunnelStage {
  name: string;
  key: string;
  count: number;
  overallPct: number;
  stepConvPct: number;
  dropOffPct: number;
}

interface LeadFunnelChartProps {
  funnel: FunnelStage[];
  totalLeads: number;
}

export const LeadFunnelChart: React.FC<LeadFunnelChartProps> = ({ funnel = [], totalLeads = 0 }) => {
  const kagiData = funnel.map((st, idx) => {
    const rawName = (st as any)?.name || (st as any)?.stage || (st as any)?.stageName || `Stage ${idx + 1}`;
    const overallPct = st?.overallPct ?? (st as any)?.conversionRate ?? (idx === 0 ? 100 : 20);
    return {
      stage: rawName.split(" ")[0],
      fullName: rawName,
      conversion: Number(overallPct) || 0,
      count: st?.count || 0,
      target: Math.max(5, Number(overallPct) * 0.8),
    };
  });

  const stepColors = ["#f43f5e", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b"];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-rose-500" /> Lead Conversion Funnel
          </h3>
          <p className="text-xs text-gray-500">
            Step-wise conversion tracking across funnel stages (Total: {totalLeads.toLocaleString()} leads)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Kagi Step Line Chart matching Screenshot 2 */}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={kagiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={true} />
              <XAxis dataKey="stage" tick={{ fontSize: 10, fontWeight: 700 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 10, fontWeight: 700 }} stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: "700",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                  border: "1px solid #cbd5e1",
                }}
                itemStyle={{ color: "#0f172a", fontWeight: "700" }}
                labelStyle={{ color: "#475569", fontWeight: "800" }}
              />
              <Area
                type="stepAfter"
                dataKey="conversion"
                name="Stage Conversion (%)"
                stroke="#f43f5e"
                fill="#f43f5e"
                fillOpacity={0.15}
                strokeWidth={3}
                dot={{ r: 4, fill: "#ffffff", stroke: "#f43f5e", strokeWidth: 2 }}
              />
              <Area
                type="stepAfter"
                dataKey="target"
                name="Qualified Benchmark"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#ffffff", stroke: "#06b6d4", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Step Breakdown List */}
        <div className="space-y-2.5">
          {funnel.map((stage, idx) => {
            const rawName = (stage as any)?.name || (stage as any)?.stage || (stage as any)?.stageName || `Stage ${idx + 1}`;
            const overallPct = stage?.overallPct ?? (stage as any)?.conversionRate ?? (idx === 0 ? 100 : 20);
            const count = stage?.count ?? 0;
            const color = stepColors[idx % stepColors.length];
            return (
              <div key={stage.key || idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                    {rawName}
                  </span>
                  <span className="text-gray-600 font-bold">
                    {count.toLocaleString()} ({overallPct}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(10, Number(overallPct))}%`, backgroundColor: color }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
