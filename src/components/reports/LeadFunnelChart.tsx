// frontend/src/components/reports/LeadFunnelChart.tsx
import React from "react";
import { ArrowDown, Filter } from "lucide-react";

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
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-orange-500" /> Lead Conversion Funnel
          </h3>
          <p className="text-xs text-gray-500">
            Lifecycle stage conversion and drop-off rates (Total: {totalLeads.toLocaleString()} leads)
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {funnel.map((stage, idx) => {
          // Dynamic width calculation for funnel visualization
          const widthPct = Math.max(15, stage.overallPct || (idx === 0 ? 100 : 20));
          const stageColors = [
            "bg-blue-600",
            "bg-indigo-600",
            "bg-violet-600",
            "bg-purple-600",
            "bg-pink-600",
            "bg-amber-600",
            "bg-emerald-600",
          ];
          const colorClass = stageColors[idx % stageColors.length];

          return (
            <div key={stage.key} className="relative">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-gray-800">{stage.name}</span>
                <span className="text-gray-600">
                  {stage.count.toLocaleString()} ({stage.overallPct}%)
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden flex">
                <div
                  className={`h-full ${colorClass} transition-all duration-500 rounded-full flex items-center justify-end pr-2 text-[10px] text-white font-bold`}
                  style={{ width: `${widthPct}%` }}
                >
                  {widthPct > 25 && `${stage.count}`}
                </div>
              </div>

              {/* Conversion Step Indicator */}
              {idx > 0 && (
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1 pl-2">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <ArrowDown className="w-3 h-3" /> Step Conv: {stage.stepConvPct}%
                  </span>
                  {stage.dropOffPct > 0 && (
                    <span className="text-rose-500 font-medium">
                      Drop-off: {stage.dropOffPct}%
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
