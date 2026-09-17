import React, { useState } from "react";
import { Phone, User, Clock, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Zap } from "lucide-react";

export interface CallRequestData {
  phone: string;
  name: string;
  timing: "Immediately" | "After 1 hr" | "After 2 hr";
  persona?: string;
}

interface REXCallRequestCardProps {
  initialPhone?: string;
  initialName?: string;
  persona?: string;
  disabled?: boolean;
  onSubmit: (data: CallRequestData) => Promise<void> | void;
  onCancel?: () => void;
}

export const REXCallRequestCard: React.FC<REXCallRequestCardProps> = ({
  initialPhone = "",
  initialName = "",
  persona = "tenant",
  disabled = false,
  onSubmit,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState(initialPhone.replace(/\D/g, "").slice(-10));
  const [name, setName] = useState(initialName);
  const [timing, setTiming] = useState<"Immediately" | "After 1 hr" | "After 2 hr">("Immediately");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const cleanDigits = phone.replace(/\D/g, "");

  const handleNextStep1 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    if (cleanDigits.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    setStep(3);
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    if (cleanDigits.length !== 10) {
      setStep(1);
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!name.trim()) {
      setStep(2);
      setErrorMsg("Please enter your name.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        phone: cleanDigits,
        name: name.trim(),
        timing,
        persona,
      });
      setIsDone(true);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to submit call request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="w-full bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/90 rounded-2xl border border-emerald-200 p-3.5 shadow-sm space-y-2 text-left animate-in fade-in duration-200">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Call Request Registered!</span>
        </div>
        <p className="text-[11.5px] text-slate-700 leading-relaxed">
          Thank you <strong className="text-slate-900">{name}</strong>. Our Property Executive will call you{" "}
          <span className="font-semibold text-teal-800">{timing === "Immediately" ? "immediately" : timing}</span> at{" "}
          <strong className="text-slate-900">+91 {cleanDigits}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/95 backdrop-blur-xs rounded-2xl border border-teal-200/90 shadow-sm p-3.5 space-y-3 my-1 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-teal-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0">
            <Phone size={14} />
          </div>
          <div>
            <h4 className="text-[12.5px] font-bold text-slate-900 leading-tight">
              Request Executive Callback
            </h4>
            <p className="text-[10px] text-teal-800 font-medium">
              Connect directly with our dedicated property team
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-100 text-teal-900 border border-teal-200 shrink-0">
          Step {step} of 3
        </span>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-1.5 px-0.5">
        <div className={`h-1 flex-1 rounded-full transition-all ${step >= 1 ? "bg-teal-700" : "bg-slate-200"}`} />
        <div className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? "bg-teal-700" : "bg-slate-200"}`} />
        <div className={`h-1 flex-1 rounded-full transition-all ${step >= 3 ? "bg-teal-700" : "bg-slate-200"}`} />
      </div>

      {/* STEP 1: Mobile Number */}
      {step === 1 && (
        <form onSubmit={handleNextStep1} className="space-y-2.5 animate-in fade-in duration-200">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Mobile Number *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-[11px] font-bold text-slate-500 select-none">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                autoFocus
                value={phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setPhone(v);
                  if (errorMsg) setErrorMsg("");
                }}
                disabled={disabled || isSubmitting}
                placeholder="Enter 10-digit mobile number"
                className="w-full text-xs pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all placeholder:font-normal placeholder:text-slate-400"
              />
            </div>
            <p className="text-[9.5px] text-slate-500 mt-1">
              We will call you on this number to assist with verified properties & visits.
            </p>
          </div>

          {errorMsg && (
            <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 p-1.5 rounded-lg border border-rose-200">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-2 pt-0.5">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={disabled || isSubmitting}
                className="py-1.5 px-3 border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={cleanDigits.length !== 10 || disabled || isSubmitting}
              className="flex-1 py-2 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <span>Continue to Name</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Name */}
      {step === 2 && (
        <form onSubmit={handleNextStep2} className="space-y-2.5 animate-in fade-in duration-200">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Your Full Name *
            </label>
            <div className="relative flex items-center">
              <User size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                disabled={disabled || isSubmitting}
                placeholder="e.g. Rahul Sharma"
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
            <p className="text-[9.5px] text-slate-500 mt-1">
              So our executive knows whom to address when calling.
            </p>
          </div>

          {errorMsg && (
            <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 p-1.5 rounded-lg border border-rose-200">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={disabled || isSubmitting}
              className="py-1.5 px-3 border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={13} />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={!name.trim() || disabled || isSubmitting}
              className="flex-1 py-2 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <span>Select Call Timing</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Timing */}
      {step === 3 && (
        <form onSubmit={handleFinalSubmit} className="space-y-3 animate-in fade-in duration-200">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1.5">
              <Clock size={12} className="text-teal-700" />
              <span>When do you want us to call? *</span>
            </label>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setTiming("Immediately")}
                disabled={disabled || isSubmitting}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  timing === "Immediately"
                    ? "bg-teal-800 text-white border-teal-800 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50 hover:border-teal-300"
                }`}
              >
                <Zap size={13} className={timing === "Immediately" ? "text-amber-300" : "text-amber-500"} />
                <span className="text-[10.5px] font-bold">Immediately</span>
              </button>

              <button
                type="button"
                onClick={() => setTiming("After 1 hr")}
                disabled={disabled || isSubmitting}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  timing === "After 1 hr"
                    ? "bg-teal-800 text-white border-teal-800 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50 hover:border-teal-300"
                }`}
              >
                <Clock size={13} className={timing === "After 1 hr" ? "text-teal-200" : "text-slate-500"} />
                <span className="text-[10.5px] font-bold">After 1 hr</span>
              </button>

              <button
                type="button"
                onClick={() => setTiming("After 2 hr")}
                disabled={disabled || isSubmitting}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  timing === "After 2 hr"
                    ? "bg-teal-800 text-white border-teal-800 shadow-2xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50 hover:border-teal-300"
                }`}
              >
                <Clock size={13} className={timing === "After 2 hr" ? "text-teal-200" : "text-slate-500"} />
                <span className="text-[10.5px] font-bold">After 2 hr</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
              📞 Calling <strong className="text-slate-800">{name}</strong> at{" "}
              <strong className="text-slate-800">+91 {cleanDigits}</strong>:{" "}
              <span className="text-teal-700 font-bold">{timing}</span>
            </p>
          </div>

          {errorMsg && (
            <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 p-1.5 rounded-lg border border-rose-200">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={disabled || isSubmitting}
              className="py-2 px-3 border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={13} />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={disabled || isSubmitting}
              className="flex-1 py-2.5 bg-gradient-to-r from-teal-700 to-[#0f2b3d] hover:from-teal-800 hover:to-[#163e58] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Phone size={13} />
                  <span>Submit Call Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default REXCallRequestCard;
