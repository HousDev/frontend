import React, { useState } from "react";
import { Building2, MapPin, Home, IndianRupee, CheckCircle2, ChevronRight, Sparkles, ShieldCheck } from "lucide-react";

export interface SellerPropertyFormData {
  society_name: string;
  locality: string;
  bhk: string;
  carpet_area: string;
  expected_price: string;
  furnishing: string;
  floor?: string;
}

interface REXSellerWizardCardProps {
  initialData?: Partial<SellerPropertyFormData>;
  disabled?: boolean;
  onSubmit: (data: SellerPropertyFormData) => void;
}

const LOCALITY_LIST = ["Punawale", "Wakad", "Hinjewadi", "Baner", "Ravet", "Tathawade", "Kharadi", "Other"];
const BHK_OPTIONS = [
  "1 RK",
  "1 BHK",
  "1.5 BHK",
  "2 BHK",
  "2.5 BHK",
  "3 BHK",
  "3.5 BHK",
  "4 BHK",
  "5+ BHK",
  "Penthouse",
  "Villa / Row House",
];
const FURNISHING_OPTIONS = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];

export const REXSellerWizardCard: React.FC<REXSellerWizardCardProps> = ({
  initialData,
  disabled = false,
  onSubmit,
}) => {
  const [society, setSociety] = useState(initialData?.society_name || "");
  const [locality, setLocality] = useState(initialData?.locality || "Punawale");
  const [customLocality, setCustomLocality] = useState("");
  const [bhk, setBhk] = useState(initialData?.bhk || "2 BHK");
  const [carpetArea, setCarpetArea] = useState(initialData?.carpet_area || "");
  const [expectedPrice, setExpectedPrice] = useState(initialData?.expected_price || "");
  const [furnishing, setFurnishing] = useState(initialData?.furnishing || "Semi-Furnished");
  const [floor, setFloor] = useState(initialData?.floor || "");
  const [errorMsg, setErrorMsg] = useState("");

  const activeLocality = customLocality.trim() || locality;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!society.trim()) {
      setErrorMsg("Please enter your society / project name.");
      return;
    }
    if (!expectedPrice.trim()) {
      setErrorMsg("Please enter your expected selling price.");
      return;
    }
    setErrorMsg("");

    onSubmit({
      society_name: society.trim(),
      locality: activeLocality,
      bhk,
      carpet_area: carpetArea.trim() || "Standard",
      expected_price: expectedPrice.trim(),
      furnishing,
      floor: floor.trim() || undefined,
    });
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-sm p-3.5 space-y-3 my-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#e87722] shrink-0">
            <Building2 size={15} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
              Sell Your Property
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Direct connection with dedicated Property Executive
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 1. Society Name & Locality */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
            <Building2 size={12} className="text-[#0f2b3d]" />
            <span>Society / Project Name *</span>
          </label>
          <input
            type="text"
            disabled={disabled}
            value={society}
            onChange={(e) => {
              setSociety(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            placeholder="e.g. VTP HiLife, My Home Punawale, Life Republic"
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0f2b3d] focus:bg-white transition-all font-medium text-slate-800"
          />
        </div>

        {/* 2. Locality Chips */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
            <MapPin size={12} className="text-[#e87722]" />
            <span>Locality</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {LOCALITY_LIST.map((loc) => {
              const isSelected = locality === loc && !customLocality.trim();
              return (
                <button
                  key={loc}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setLocality(loc);
                    setCustomLocality("");
                  }}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#e87722] text-white border-[#e87722] shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300"
                  } disabled:cursor-not-allowed`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
          {locality === "Other" && (
            <input
              type="text"
              disabled={disabled}
              value={customLocality}
              onChange={(e) => setCustomLocality(e.target.value)}
              placeholder="Type your locality name..."
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2b3d] mt-1"
            />
          )}
        </div>

        {/* 3. BHK & Furnishing */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              <Home size={11} className="text-[#0f2b3d]" />
              <span>BHK</span>
            </label>
            <select
              disabled={disabled}
              value={bhk}
              onChange={(e) => setBhk(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2b3d] font-semibold text-slate-800"
            >
              {BHK_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              <Sparkles size={11} className="text-[#e87722]" />
              <span>Furnishing</span>
            </label>
            <select
              disabled={disabled}
              value={furnishing}
              onChange={(e) => setFurnishing(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2b3d] font-medium text-slate-800"
            >
              {FURNISHING_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Expected Price & Carpet Area */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              <IndianRupee size={11} className="text-emerald-600" />
              <span>Expected Price *</span>
            </label>
            <input
              type="text"
              disabled={disabled}
              value={expectedPrice}
              onChange={(e) => {
                setExpectedPrice(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="e.g. ₹75 Lakhs or 1.1 Cr"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2b3d] font-semibold text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
              <span>Carpet Area (sq.ft)</span>
            </label>
            <input
              type="text"
              disabled={disabled}
              value={carpetArea}
              onChange={(e) => setCarpetArea(e.target.value)}
              placeholder="e.g. 750 sq.ft"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2b3d] font-medium text-slate-800"
            />
          </div>
        </div>

        {errorMsg && (
          <p className="text-[11px] text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-100">
            {errorMsg}
          </p>
        )}

        {/* Managed Platform Badge */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>100% Managed Resale Listing</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Admin will assign a dedicated Property Executive to verify documents, coordinate visits, and handle negotiations.
          </p>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={disabled}
          className="w-full py-2.5 bg-gradient-to-r from-[#e87722] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <CheckCircle2 size={14} />
          <span>Submit Property for Executive Review</span>
        </button>
      </form>
    </div>
  );
};

export default REXSellerWizardCard;
