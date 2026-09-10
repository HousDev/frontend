import React from "react";
import { TrendingUp, Users, ShieldCheck, Zap, Award, CheckCircle2, ChevronRight, PhoneCall } from "lucide-react";

export interface SellerInsightsData {
  locality: string;
  bhk?: string;
  society_name?: string;
  carpet_area?: number | string;
  valuation: {
    min_rate_sqft: number;
    avg_rate_sqft: number;
    max_rate_sqft: number;
    estimated_min_price: number;
    estimated_max_price: number;
    comparable_properties_count?: number;
  };
  active_buyers_count: number;
  readiness_score: number;
  assigned_executive?: string;
  sla_minutes?: number;
}

interface REXSellerInsightsCardProps {
  data: SellerInsightsData;
  onTalkToExecutive?: () => void;
  onListProperty?: () => void;
}

function formatPriceINR(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(0)} Lakh`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
}

export const REXSellerInsightsCard: React.FC<REXSellerInsightsCardProps> = ({
  data,
  onTalkToExecutive,
  onListProperty,
}) => {
  const minFormatted = formatPriceINR(data.valuation.estimated_min_price);
  const maxFormatted = formatPriceINR(data.valuation.estimated_max_price);

  return (
    <div className="w-full bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-emerald-50/80 border border-amber-200/90 rounded-2xl p-3.5 space-y-3 my-1 text-slate-800 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#e87722] text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
            <TrendingUp size={15} />
          </div>
          <div>
            <h4 className="font-bold text-[13px] text-slate-900 leading-tight">
              Live Resale Valuation & Demand
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              {data.locality}, Pune {data.bhk ? `• ${data.bhk}` : ""}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
          AI Verified
        </span>
      </div>

      {/* Metric 1: Valuation Range & Rate per Sq.Ft */}
      <div className="grid grid-cols-2 gap-2 bg-white/95 rounded-xl p-2.5 border border-amber-100/90 shadow-2xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Estimated Resale Value
          </span>
          <div className="text-[14px] font-extrabold text-[#0f2b3d] leading-tight mt-0.5">
            {minFormatted} – {maxFormatted}
          </div>
          <span className="text-[10px] text-slate-500">
            Based on {data.carpet_area || 750} sq.ft carpet
          </span>
        </div>

        <div className="border-l border-slate-100 pl-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Current Market Rate
          </span>
          <div className="text-[13px] font-bold text-emerald-700 leading-tight mt-0.5">
            ₹{data.valuation.avg_rate_sqft.toLocaleString("en-IN")}/sq.ft
          </div>
          <span className="text-[10px] text-slate-500">
            Range: ₹{data.valuation.min_rate_sqft} – ₹{data.valuation.max_rate_sqft}
          </span>
        </div>
      </div>

      {/* Metric 2: Live Active Buyers Demand Counter */}
      <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl text-white shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Users size={15} className="text-emerald-100" />
          </div>
          <div>
            <div className="text-[12px] font-extrabold leading-tight">
              {data.active_buyers_count} Verified Buyers Searching
            </div>
            <p className="text-[10px] text-emerald-100 font-medium">
              Actively looking for resale flats in {data.locality}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
          High Demand 🔥
        </span>
      </div>

      {/* Metric 3: Listing Health / Readiness */}
      <div className="bg-white/95 rounded-xl p-2.5 border border-slate-100 space-y-1.5 shadow-2xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Award size={13} className="text-amber-500" />
            Listing Readiness Score
          </span>
          <span className="font-extrabold text-emerald-600">
            {data.readiness_score}% Complete
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${data.readiness_score}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500">
          Our dedicated executive will take high-res photography and verify legal papers.
        </p>
      </div>

      {/* Resale Expert Value Highlights */}
      <div className="space-y-1 text-[11px] text-slate-700 pt-1">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
          <span><strong>100% Zero Buyer Spam Calls</strong> (Direct executive filtering)</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
          <span><strong>Legal & Agreement Support</strong> (Title check & Escrow assistance)</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/50">
        <button
          type="button"
          onClick={onTalkToExecutive}
          className="w-full py-2 px-3 bg-[#0f2b3d] hover:bg-[#163e58] text-white text-[11.5px] font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <PhoneCall size={12} />
          <span>Talk to Executive</span>
        </button>

        <button
          type="button"
          onClick={onListProperty}
          className="w-full py-2 px-3 bg-gradient-to-r from-[#e87722] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-[11.5px] font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>List Another Flat</span>
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default REXSellerInsightsCard;
