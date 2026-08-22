// frontend/src/components/reports/AiInsights.tsx
import React from "react";
import { Sparkles, RefreshCw, Lightbulb } from "lucide-react";
import Button from "@/components/ui/Button";

interface AiInsightsProps {
  insights: string[];
  aiGenerated?: boolean;
  loading?: boolean;
  onRefresh?: () => void;
}

export const AiInsights: React.FC<AiInsightsProps> = ({
  insights = [],
  aiGenerated = false,
  loading = false,
  onRefresh,
}) => {
  return (
    <div className="bg-gradient-to-r from-[#0f1f38] via-[#1e3b8b] to-[#1e293b] text-white p-6 rounded-xl shadow-lg relative overflow-hidden mb-6 border border-navy-700">
      {/* Background Glow Overlay */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-orange-500/25 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/15 backdrop-blur-md rounded-lg border border-white/25">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 text-white">
              AI Business Intelligence Insights
              {aiGenerated && (
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                  OpenAI Generated
                </span>
              )}
            </h3>
            <p className="text-xs text-blue-100 font-medium">
              Automated recommendations based on real-time database metrics
            </p>
          </div>
        </div>

        {onRefresh && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="text-xs text-white hover:text-white hover:bg-white/20 bg-white/10 border border-white/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 text-amber-300 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        )}
      </div>

      <div className="space-y-3 relative z-10">
        {insights.length === 0 ? (
          <p className="text-xs text-blue-100 italic">No specific anomaly detected. Operations are running normally.</p>
        ) : (
          insights.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-white/10 border border-white/20 p-3.5 rounded-xl backdrop-blur-md shadow-inner"
            >
              <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <span className="text-xs text-white font-semibold leading-relaxed tracking-wide">
                {item}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
