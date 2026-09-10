import React from "react";
import { Building2, CheckCircle2, ShieldCheck, UserCheck, Calendar } from "lucide-react";
import { SellerPropertyFormData } from "./REXSellerWizardCard";

interface REXSellerConfirmedCardProps {
  data: SellerPropertyFormData;
}

export const REXSellerConfirmedCard: React.FC<REXSellerConfirmedCardProps> = ({ data }) => {
  return (
    <div className="w-full bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 space-y-3 my-1 text-slate-800 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <h4 className="font-bold text-[13px] text-emerald-950 leading-tight">
            Property Submitted for Review!
          </h4>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full inline-block mt-0.5">
            Under Review • Executive Assignment in Progress
          </span>
        </div>
      </div>

      <div className="p-2.5 bg-white rounded-xl border border-emerald-100 text-xs space-y-1.5 shadow-2xs">
        <div className="flex items-center justify-between font-semibold text-slate-900">
          <span className="truncate">{data.bhk} in {data.society_name}</span>
          <span className="text-emerald-700 font-bold shrink-0 ml-2">{data.expected_price}</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Locality: <span className="font-medium text-slate-800">{data.locality}</span>
          {data.carpet_area && data.carpet_area !== "Standard" && (
            <span> • Area: <span className="font-medium text-slate-800">{data.carpet_area}</span></span>
          )}
          {data.furnishing && (
            <span> • Furnishing: <span className="font-medium text-slate-800">{data.furnishing}</span></span>
          )}
        </p>
      </div>

      <div className="space-y-1.5 text-[11px] text-slate-600">
        <div className="flex items-start gap-2">
          <UserCheck size={14} className="text-emerald-700 shrink-0 mt-0.5" />
          <p className="leading-snug">
            Our team will assign a dedicated <strong>Property Executive</strong> for your property shortly.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <ShieldCheck size={14} className="text-emerald-700 shrink-0 mt-0.5" />
          <p className="leading-snug">
            The Executive will contact you directly to verify property ownership documents and handle buyer inquiries.
          </p>
        </div>
      </div>
    </div>
  );
};

export default REXSellerConfirmedCard;
