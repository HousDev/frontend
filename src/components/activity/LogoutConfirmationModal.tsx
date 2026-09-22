import React, { useState } from "react";
import { LogOut, Coffee, Clock, CheckCircle2, ChevronRight, X, AlertTriangle } from "lucide-react";
import { useActivityTracker } from "../../context/ActivityTrackerContext";
import { useAuth } from "@/contexts/AuthContext";

const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";

const BREAK_OPTIONS = [
  { id: "end_work", label: "End Work Day", isEndWork: true },
  { id: "lunch", label: "Lunch Break", duration: 60 },
  { id: "tea", label: "Tea Break", duration: 15 },
  { id: "personal", label: "Personal Break", duration: 20 },
  { id: "documentation", label: "Documentation", duration: 20 },
  { id: "market_research", label: "Market Research", duration: 30 },
  { id: "meeting", label: "New Client Meeting", duration: 45 },
  { id: "site_visit", label: "Buyer Site Visit", duration: 120 },
  { id: "property_visit", label: "Seller Property Visit", duration: 90 },
];

const LogoutConfirmationModal: React.FC = () => {
  const {
    isLogoutModalOpen,
    closeLogoutModal,
    endSession,
    startBreak,
    endBreak,
    activeBreak,
    sessionTimeFormatted,
    workTimeFormatted,
    idleTimeFormatted,
    breakTimeFormatted,
  } = useActivityTracker();

  const { logout } = useAuth();

  const [selectedOption, setSelectedOption] = useState<string>("end_work");
  const [step, setStep] = useState<"SELECT_OPTION" | "CONFIRM_END" | "CONFIRM_BREAK">("SELECT_OPTION");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLogoutModalOpen) return null;

  const handleContinue = () => {
    if (selectedOption === "end_work") {
      setStep("CONFIRM_END");
    } else {
      setStep("CONFIRM_BREAK");
    }
  };

  const handleFinalEndSession = async () => {
    setIsSubmitting(true);
    try {
      await endSession();
      await logout();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      closeLogoutModal();
      setStep("SELECT_OPTION");
      setIsSubmitting(false);
      window.location.href = "/login";
    }
  };

  const handleFinalStartBreak = async () => {
    setIsSubmitting(true);
    try {
      await startBreak(selectedOption);
    } catch (e) {
      console.error("Start break error:", e);
    } finally {
      closeLogoutModal();
      setStep("SELECT_OPTION");
      setIsSubmitting(false);
    }
  };

  const selectedBreakObj = BREAK_OPTIONS.find((b) => b.id === selectedOption);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100] p-4 animate-fade-in"
      style={{ background: "rgba(15, 43, 61, 0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border flex flex-col"
        style={{ borderColor: BD }}
      >
        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg" style={{ background: `${O}25` }}>
              <LogOut size={16} style={{ color: O }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">End Work Session?</h3>
              <p className="text-[10px] text-white/70">Select your next activity or finalize logout</p>
            </div>
          </div>
          <button onClick={closeLogoutModal} className="p-1.5 rounded-lg text-white/70 hover:bg-white/10">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4" style={{ background: BG }}>
          {/* Active Break prompt handler */}
          {activeBreak ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50 flex items-start gap-3">
                <AlertTriangle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-orange-900">Break Currently Active</h4>
                  <p className="text-[11px] text-orange-700 mt-0.5">
                    You are currently on <strong>{activeBreak.break_type}</strong>. Do you want to resume work or finalize your work session?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await endBreak();
                    closeLogoutModal();
                  }}
                  className="py-2.5 px-3 rounded-xl border font-bold text-xs transition-all hover:bg-slate-100"
                  style={{ borderColor: BD, color: N }}
                >
                  Resume Work
                </button>
                <button
                  type="button"
                  onClick={handleFinalEndSession}
                  disabled={isSubmitting}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs text-white shadow-sm transition-all disabled:opacity-50"
                  style={{ background: "#ef4444" }}
                >
                  {isSubmitting ? "Logging out..." : "End Session & Logout"}
                </button>
              </div>
            </div>
          ) : step === "SELECT_OPTION" ? (
            <>
              <p className="text-xs text-slate-600 font-medium">
                You are about to end your work session. Before logging out, please select what you are doing:
              </p>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                {BREAK_OPTIONS.map((opt) => {
                  const isChecked = selectedOption === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => setSelectedOption(opt.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked ? "border-orange-400 bg-orange-50/70" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="logout_choice"
                          checked={isChecked}
                          onChange={() => setSelectedOption(opt.id)}
                          className="accent-orange-500"
                        />
                        <span className="text-xs font-semibold" style={{ color: N }}>
                          {opt.label}
                        </span>
                      </div>
                      {opt.duration && (
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> {opt.duration}m
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: BD }}>
                <button
                  type="button"
                  onClick={closeLogoutModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border text-slate-600 hover:bg-slate-100 transition-all"
                  style={{ borderColor: BD }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1 transition-all"
                  style={{ background: O }}
                >
                  <span>Continue</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </>
          ) : step === "CONFIRM_END" ? (
            <>
              <div className="p-4 rounded-xl bg-white border space-y-3" style={{ borderColor: BD }}>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Session Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Total Session</span>
                    <span className="font-bold text-slate-800">{sessionTimeFormatted}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Active Work Time</span>
                    <span className="font-bold text-green-600">{workTimeFormatted}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Idle Time</span>
                    <span className="font-bold text-amber-600">{idleTimeFormatted}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Break Time</span>
                    <span className="font-bold text-orange-600">{breakTimeFormatted}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("SELECT_OPTION")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border text-slate-600 hover:bg-slate-100 transition-all"
                  style={{ borderColor: BD }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalEndSession}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
                  style={{ background: "#ef4444" }}
                >
                  {isSubmitting ? "Logging out..." : "End Session & Logout"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-white border text-center space-y-2" style={{ borderColor: BD }}>
                <Coffee size={32} className="mx-auto text-orange-500" />
                <h4 className="text-sm font-bold" style={{ color: N }}>
                  Start {selectedBreakObj?.label}?
                </h4>
                <p className="text-xs text-slate-500">
                  Duration: <strong>{selectedBreakObj?.duration || 15} minutes</strong>. Your current work session will be paused while you are on break.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("SELECT_OPTION")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border text-slate-600 hover:bg-slate-100 transition-all"
                  style={{ borderColor: BD }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalStartBreak}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
                  style={{ background: O }}
                >
                  <CheckCircle2 size={14} />
                  <span>{isSubmitting ? "Starting..." : "Start Break"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationModal;
