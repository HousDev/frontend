import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { useActivityTracker } from "../../context/ActivityTrackerContext";

// ---- Design tokens -------------------------------------------------------
const NAVY = "#0f2b3d";
const NAVY_DEEP = "#0a1f2e";
const AMBER = "#e67e22";
const AMBER_LIGHT = "#f5a86a";
const DANGER = "#dc2626";
const SUCCESS = "#16a34a";
const BORDER = "#e6ebf1";
const INK = "#0f2b3d";
const MUTED = "#64748b";
const SURFACE = "#fbfcfd";

const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const ActivityVerificationModal: React.FC = () => {
  const {
    isVerificationOpen,
    verificationQuestion,
    submitVerification,
    timeoutVerification,
    settings,
  } = useActivityTracker();

  const [answer, setAnswer] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // ---- Refs that hold the *latest* values without forcing the timer -----
  // ---- effect to re-run (this is what was breaking the countdown) -------
  const totalSecondsRef = useRef<number>(60);
  const deadlineRef = useRef<number>(0);
  const firedRef = useRef<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const timeoutVerificationRef = useRef(timeoutVerification);
  useEffect(() => {
    timeoutVerificationRef.current = timeoutVerification;
  }, [timeoutVerification]);

  const isSuccessRef = useRef(isSuccess);
  useEffect(() => {
    isSuccessRef.current = isSuccess;
  }, [isSuccess]);

  const isSubmittingRef = useRef(isSubmitting);
  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  // ---- The countdown itself ----------------------------------------------
  // Fixed to a wall-clock deadline (Date.now() + duration) instead of
  // decrementing a counter each tick, so it can't drift or get stuck if the
  // tab is backgrounded, and it only depends on primitives that are stable
  // across re-renders — not on the `settings` object or the
  // `timeoutVerification` function reference, both of which can change
  // identity on every parent render and were previously restarting (and
  // resetting) the timer before it ever reached zero.
  useEffect(() => {
    if (!isVerificationOpen) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const duration = settings?.verification_timeout_seconds || 60;
    totalSecondsRef.current = duration;
    deadlineRef.current = Date.now() + duration * 1000;
    firedRef.current = false;

    setAnswer("");
    setErrorMessage(null);
    setIsSuccess(false);
    setTimeLeft(duration);

    const tick = () => {
      if (firedRef.current) return;
      const msLeft = deadlineRef.current - Date.now();
      const secLeft = Math.max(0, Math.ceil(msLeft / 1000));
      setTimeLeft(secLeft);

      if (msLeft <= 0) {
        firedRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        // Don't fire a timeout if the user's correct answer is already
        // being submitted or already succeeded — avoids a race where the
        // modal gets dismissed as "timed out" a moment after a valid
        // submission.
        if (!isSuccessRef.current && !isSubmittingRef.current) {
          timeoutVerificationRef.current();
        }
      }
    };

    intervalRef.current = setInterval(tick, 250);
    tick();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // Re-arm the full countdown whenever the modal opens, the configured
    // duration changes, or a fresh challenge is issued.
  }, [isVerificationOpen, settings?.verification_timeout_seconds, verificationQuestion]);

  if (!isVerificationOpen || !verificationQuestion) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const responseSec = totalSecondsRef.current - timeLeft;
    const result = await submitVerification(answer, responseSec);

    setIsSubmitting(false);
    if (result.success) {
      setIsSuccess(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setErrorMessage(null);
    } else {
      setErrorMessage(result.message || "That answer doesn't match. Try again.");
    }
  };

  const urgent = timeLeft <= 15;
  const progressRatio = Math.max(0, Math.min(1, timeLeft / totalSecondsRef.current));
  const dashOffset = RING_CIRCUMFERENCE * (1 - progressRatio);
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100] p-4"
      style={{
        background: "rgba(10, 31, 46, 0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        className="w-full max-w-sm overflow-hidden"
        style={{
          background: SURFACE,
          borderRadius: 22,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 30px 70px -20px rgba(10, 31, 46, 0.45), 0 0 0 1px rgba(10, 31, 46, 0.04)",
        }}
      >
        {/* Header */}
        <div
          className="relative px-6 pt-5 pb-5 flex items-center gap-3"
          style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)` }}
        >
          <div
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: `linear-gradient(90deg, transparent, ${AMBER}, transparent)` }}
          />
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 40, height: 40, background: "rgba(230, 126, 34, 0.16)" }}
          >
            <ShieldCheck size={20} style={{ color: AMBER_LIGHT }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-white leading-tight tracking-tight">
              Activity check
            </h3>
            <p className="text-[12.5px] text-white/60 mt-0.5">Confirm you're still at your desk</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-5 pb-6">
          {isSuccess ? (
            <div className="text-center py-7 space-y-3">
              <CheckCircle2 size={40} style={{ color: SUCCESS }} className="mx-auto" />
              <h4 className="text-[15px] font-semibold" style={{ color: INK }}>
                You're all set
              </h4>
              <p className="text-[13px]" style={{ color: MUTED }}>
                Resuming your active session.
              </p>
            </div>
          ) : (
            <>
              {/* Challenge */}
              <div
                className="rounded-2xl text-center py-5 px-4"
                style={{ background: "#fff", border: `1px solid ${BORDER}` }}
              >
                <div
                  className="font-bold leading-none"
                  style={{
                    color: INK,
                    fontSize: 34,
                    letterSpacing: "-0.01em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {verificationQuestion}
                </div>
                <p className="text-[12px] mt-3" style={{ color: MUTED }}>
                  Solve this to keep tracking your time.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="verification-answer"
                    className="block text-[12.5px] font-medium mb-1.5"
                    style={{ color: NAVY }}
                  >
                    Your answer
                  </label>
                  <input
                    id="verification-answer"
                    type="text"
                    inputMode="numeric"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter answer"
                    autoFocus
                    autoComplete="off"
                    className="w-full text-center outline-none transition-shadow"
                    style={{
                      padding: "11px 16px",
                      borderRadius: 12,
                      border: `1px solid ${BORDER}`,
                      background: "#fff",
                      color: INK,
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 0 3px rgba(230, 126, 34, 0.18)`;
                      e.currentTarget.style.borderColor = AMBER;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = BORDER;
                    }}
                  />
                </div>

                {errorMessage && (
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12.5px] font-medium"
                    style={{ background: "#fef2f2", border: "1px solid #fecaca", color: DANGER }}
                  >
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Countdown ring + submit */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="relative shrink-0" style={{ width: 56, height: 56 }}>
                    <svg width={56} height={56} viewBox="0 0 60 60" style={{ transform: "rotate(-90deg)" }}>
                      <circle
                        cx={30}
                        cy={30}
                        r={RING_RADIUS}
                        fill="none"
                        stroke={BORDER}
                        strokeWidth={4}
                      />
                      <circle
                        cx={30}
                        cy={30}
                        r={RING_RADIUS}
                        fill="none"
                        stroke={urgent ? DANGER : AMBER}
                        strokeWidth={4}
                        strokeLinecap="round"
                        strokeDasharray={RING_CIRCUMFERENCE}
                        strokeDashoffset={dashOffset}
                        style={{ transition: "stroke-dashoffset 0.25s linear, stroke 0.3s ease" }}
                      />
                    </svg>
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        color: urgent ? DANGER : NAVY,
                      }}
                    >
                      {mm}:{ss}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!answer.trim() || isSubmitting}
                    className="flex-1 font-semibold text-white transition-opacity disabled:opacity-45 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(135deg, ${AMBER} 0%, #d9691a 100%)`,
                      borderRadius: 12,
                      padding: "12px 16px",
                      fontSize: 14,
                      boxShadow: "0 8px 20px -8px rgba(230, 126, 34, 0.55)",
                    }}
                  >
                    {isSubmitting ? "Confirming…" : "Confirm activity"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityVerificationModal;