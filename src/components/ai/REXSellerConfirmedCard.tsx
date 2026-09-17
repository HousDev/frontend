import React from "react";
import { CheckCircle2, ShieldCheck, UserCheck, Phone, MessageSquare, Building2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SellerPropertyFormData } from "./REXSellerWizardCard";

export interface SellerExecutiveCardInfo {
  executiveId?: number;
  executiveName?: string;
  executivePhone?: string;
  executiveEmail?: string;
  executiveRole?: string;
  propertyTitle?: string;
  propertyId?: number;
  location?: string;
  societyName?: string;
  unitType?: string;
  expectedPrice?: string;
}

export interface REXSellerConfirmedCardProps {
  data: SellerPropertyFormData;
  executiveCard?: SellerExecutiveCardInfo;
  onChatWithExecutive?: () => void;
  onOpenDashboard?: () => void;
}

export const REXSellerConfirmedCard: React.FC<REXSellerConfirmedCardProps> = ({
  data,
  executiveCard,
  onChatWithExecutive,
  onOpenDashboard,
}) => {
  const navigate = useNavigate();

  const execName = executiveCard?.executiveName || "Property Executive";
  const execPhone = executiveCard?.executivePhone || "+91 9604350255";
  const execEmail = executiveCard?.executiveEmail || "support@resaleexpert.in";
  const execRole = executiveCard?.executiveRole || "Dedicated Property Executive";

  const cleanPhone = String(execPhone || "").replace(/\D/g, "");
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const handleDashboardClick = () => {
    if (onOpenDashboard) {
      onOpenDashboard();
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-orange-50/90 via-white to-amber-50/80 border border-orange-200/90 rounded-2xl p-3.5 space-y-3 text-left my-1 shadow-2xs text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-orange-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#e87722] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h4 className="font-bold text-[13px] text-slate-900 leading-tight">
              Property Submitted for Review!
            </h4>
            <span className="text-[9.5px] font-bold px-2 py-0.5 bg-orange-100 text-orange-950 rounded-full inline-block mt-0.5 border border-orange-200">
              Under Review • Executive Assigned
            </span>
          </div>
        </div>
      </div>

      {/* Property Overview */}
      <div className="bg-white rounded-xl border border-orange-100 p-2.5 space-y-1 text-xs shadow-2xs">
        <div className="flex items-center justify-between font-bold text-slate-900">
          <span className="truncate flex items-center gap-1">
            <Building2 size={13} className="text-[#0f2b3d]" />
            {data.unit_type || "Apartment"} in {data.society_name}
          </span>
          <span className="text-[#e87722] font-bold shrink-0 ml-2">{data.expected_price}</span>
        </div>
        <p className="text-[10.5px] text-slate-500 font-medium">
          Locality: <span className="font-semibold text-slate-800">{data.location_name}</span>
          {data.carpet_area && data.carpet_area !== "Standard" && (
            <span> • Carpet Area: <span className="font-semibold text-slate-800">{data.carpet_area}</span></span>
          )}
          {data.floor && (
            <span> • Floor: <span className="font-semibold text-slate-800">{data.floor}</span></span>
          )}
        </p>
      </div>

      {/* Assigned Executive Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-2.5 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0f2b3d] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {execName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 leading-tight">
                {execName}
              </h5>
              <p className="text-[10px] text-[#e87722] font-bold flex items-center gap-1">
               
                {execRole} • Assigned to Your Property
              </p>
            </div>
          </div>
        </div>

        <p className="text-[10.5px] text-slate-600 leading-tight">
          Your Executive will conduct physical verification, review property documents, and connect you with active verified buyers.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {onChatWithExecutive && (
            <button
              type="button"
              onClick={onChatWithExecutive}
              className="py-1.5 px-2 bg-[#0f2b3d] hover:bg-[#163e58] text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <MessageSquare size={12} />
              <span>Chat</span>
            </button>
          )}
          {execPhone && (
            <a
              href={`tel:${execPhone}`}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <Phone size={12} />
              <span>Call</span>
            </a>
          )}
          {execPhone && (
            <a
              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                `Hello ${execName}, I have listed my property (${data.unit_type || "Property"} at ${data.society_name}, ${data.location_name}) on Resale Expert.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <MessageSquare size={12} />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </div>

    </div>
  );
};

export default REXSellerConfirmedCard;
