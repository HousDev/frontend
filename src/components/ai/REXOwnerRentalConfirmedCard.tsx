import React from "react";
import { CheckCircle2, Phone, MessageSquare, ExternalLink, ShieldCheck, UserCheck, Building2, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface OwnerRentalConfirmedCardProps {
  propertyTitle?: string;
  societyName?: string;
  locality?: string;
  unitType?: string;
  monthlyRent?: number | string;
  securityDeposit?: number | string;
  executiveName?: string;
  executivePhone?: string;
  executiveEmail?: string;
  executiveRole?: string;
  onOpenDashboard?: () => void;
}

export const REXOwnerRentalConfirmedCard: React.FC<OwnerRentalConfirmedCardProps> = ({
  propertyTitle = "Rental Property",
  societyName,
  locality,
  unitType,
  monthlyRent,
  securityDeposit,
  executiveName = "Soniya Singh",
  executivePhone = "+91 9604 350 255",
  executiveEmail = "support@resaleexpert.in",
  executiveRole = "Sales Executive",
  onOpenDashboard,
}) => {
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    if (onOpenDashboard) {
      onOpenDashboard();
    } else {
      navigate("/dashboard/rental-properties");
    }
  };

  const cleanPhone = String(executivePhone || "").replace(/\D/g, "");
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  return (
    <div className="w-full bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/80 border border-teal-200/90 rounded-2xl p-3.5 shadow-2xs space-y-3 text-left my-1">
      {/* Success Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-teal-100">
        <div className="flex items-center gap-1.5 font-bold text-xs text-[#0f2b3d]">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Rental Listing Submitted Successfully</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
          <ShieldCheck size={11} className="text-emerald-600" />
          Under Review
        </span>
      </div>

      {/* Property Overview */}
      <div className="bg-white/80 border border-teal-100 rounded-xl p-2.5 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <Building2 size={13} className="text-teal-700" />
            {societyName || propertyTitle}
          </span>
          {unitType && (
            <span className="px-2 py-0.5 rounded bg-teal-100/70 text-teal-900 text-[10px] font-bold">
              {unitType}
            </span>
          )}
        </div>
        <p className="text-[10.5px] text-slate-500 font-medium">
          {locality ? `${locality}, Pune` : "Pune"} • Status: Executive Assigned
        </p>
        {monthlyRent && (
          <div className="pt-1 flex items-center gap-3 text-[11px] font-bold text-[#0f2b3d]">
            <span>Rent: ₹{Number(monthlyRent).toLocaleString("en-IN")}/mo</span>
            {securityDeposit && (
              <span className="text-slate-600 font-medium">
                Deposit: ₹{Number(securityDeposit).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Assigned Sales Executive Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {executiveName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 leading-tight">
                {executiveName}
              </h5>
              <p className="text-[10px] text-teal-800 font-semibold flex items-center gap-1">
                <UserCheck size={10} className="text-teal-600" />
                {executiveRole} • Assigned to Your Property
              </p>
            </div>
          </div>
        </div>

        <p className="text-[10.5px] text-slate-600 leading-tight">
          Your Sales Executive will verify property documents, assist with key management, and match with verified active tenants.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {executivePhone && (
            <a
              href={`tel:${executivePhone}`}
              className="flex-1 py-1.5 px-2.5 bg-teal-800 hover:bg-teal-900 text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <Phone size={12} />
              <span>Call Executive</span>
            </a>
          )}
          {executivePhone && (
            <a
              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                `Hello ${executiveName}, I am the owner of ${unitType || "Property"} at ${societyName || locality || "Pune"} listed on Resale Expert.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <MessageSquare size={12} />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </div>

      {/* Owner Dashboard Redirection Callout */}
      <div className="bg-teal-100/60 border border-teal-200 rounded-xl p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-teal-950 font-bold">
          <span>Track Interested Tenants on Dashboard</span>
          <span className="text-[9px] bg-teal-200 text-teal-900 px-1.5 py-0.5 rounded font-bold uppercase">Your Portal</span>
        </div>
        <p className="text-[10.5px] text-slate-700 leading-tight">
          Use the advanced tenant matching feature on your dashboard to see active tenants looking for rentals in your society and area!
        </p>
        <button
          type="button"
          onClick={handleDashboardClick}
          className="w-full py-2 px-3 bg-gradient-to-r from-teal-700 to-[#0f2b3d] hover:from-teal-800 hover:to-[#163e58] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <ExternalLink size={13} />
          <span>Open Your Dashboard & View Tenants</span>
        </button>
      </div>
    </div>
  );
};

export default REXOwnerRentalConfirmedCard;
