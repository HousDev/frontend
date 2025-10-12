// src/components/documents/modals/EsignAadhaarModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  ShieldCheck,
  Phone,
  Mail,
  User as UserIcon,
  Fingerprint,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { electronicSignAPI, PartyRole } from "@/lib/electronicSignAPI";
import documentStatusAPI from "@/lib/documentStatusAPI";

/* -------------------------------- Types -------------------------------- */

type PartyInput = {
  role: PartyRole;
  name: string;
  email?: string;
  phone?: string;
  aadhaar: string; // 12 digits
};

export type SessionInfo = {
  session_id: string;
  status: "created" | "otp_sent" | "otp_verified" | "kyc_done" | "failed";
  role?: PartyRole;
  kyc?: {
    name?: string;
    gender?: string;
    dob?: string;
    address?: Record<string, any> | null;
  };
  error?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  documentId: number | string;
  defaultBuyer?: { name?: string; email?: string; phone?: string };
  defaultSeller?: { name?: string; email?: string; phone?: string };

  /** fires after sessions are created/updated; useful to track provider session IDs */
  onProgress?: (args: {
    docId: number | string;
    sessionIds: { buyer?: string; seller?: string };
  }) => void | Promise<void>;

  /** fires once BOTH parties complete KYC (kyc_done) */
  onBothSigned?: (args: { docId: number | string }) => void | Promise<void>;
};

/* ---------------------------- Helper functions --------------------------- */

const mergeOrAppend = (arr: SessionInfo[], item: SessionInfo): SessionInfo[] => {
  const idx = arr.findIndex((s) => s.session_id === item.session_id);
  if (idx >= 0) {
    const copy = [...arr];
    copy[idx] = { ...arr[idx], ...item };
    return copy;
  }
  return [...arr, item];
};

const onlyDigits = (val: string) => val.replace(/\D/g, "");

type PartyFlags = { buyer_verified?: boolean; seller_verified?: boolean };
const hasPartyFlags = (s: unknown): s is PartyFlags =>
  !!s && (("buyer_verified" in (s as any)) || ("seller_verified" in (s as any)));

const requireBothVerified = async (documentId: number | string) => {
  try {
    const snap = await documentStatusAPI.getSnapshot(documentId);
    if (hasPartyFlags(snap)) {
      return snap.buyer_verified === true && snap.seller_verified === true;
    }
  } catch {
    // ignore and allow
  }
  // fallback: allow if snapshot absent — don’t block KYC
  return true;
};

const getLastSession = (list: SessionInfo[], role: PartyRole) =>
  [...list].reverse().find((s) => s.role === role);

/* ------------------------------- UI helpers ------------------------------ */

const KycBadge: React.FC<{ session?: SessionInfo | null; label: string }> = ({ session, label }) => {
  const st = session?.status;
  const ok = st === "kyc_done" || st === "otp_verified";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
        st === "kyc_done"
          ? "bg-green-100 text-green-800"
          : ok
          ? "bg-blue-100 text-blue-800"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {label} {st === "kyc_done" ? "KYC Verified ✓" : ok ? "OTP Verified" : "Pending"}
    </span>
  );
};

const KycSummaryCard: React.FC<{ session?: SessionInfo | null }> = ({ session }) => {
  if (!session || session.status !== "kyc_done") return null;
  const k = session.kyc || {};
  const addr = k.address || {};
  return (
    <div className="mt-2 text-xs rounded-lg border p-3 bg-green-50 text-green-800">
      <div className="font-medium mb-1">KYC Verified ✓</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div><span className="text-gray-600">Name:</span> {k.name || "—"}</div>
        <div><span className="text-gray-600">DOB:</span> {k.dob || "—"}</div>
        <div><span className="text-gray-600">Gender:</span> {k.gender || "—"}</div>
        <div className="col-span-2">
          <span className="text-gray-600">Address:</span>{" "}
          {addr?.house || addr?.street || addr?.state || addr?.pc
            ? [addr.house, addr.street, addr.loc, addr.vtc, addr.dist, addr.state, addr.pc]
                .filter(Boolean)
                .join(", ")
            : "—"}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------- UI ---------------------------------- */

export default function EsignAadhaarModal({
  isOpen,
  onClose,
  documentId,
  defaultBuyer,
  defaultSeller,
  onProgress,
  onBothSigned,
}: Props) {
  const [step, setStep] = useState<"form" | "otp" | "done">("form");
  const [activeRole, setActiveRole] = useState<PartyRole>("Buyer");

  const [buyer, setBuyer] = useState<PartyInput>({
    role: "Buyer",
    name: defaultBuyer?.name || "",
    email: defaultBuyer?.email || "",
    phone: defaultBuyer?.phone || "",
    aadhaar: "",
  });

  const [seller, setSeller] = useState<PartyInput>({
    role: "Seller",
    name: defaultSeller?.name || "",
    email: defaultSeller?.email || "",
    phone: defaultSeller?.phone || "",
    aadhaar: "",
  });

  const party = activeRole === "Buyer" ? buyer : seller;
  const setParty = (patch: Partial<PartyInput>) => {
    if (activeRole === "Buyer") setBuyer((prev) => ({ ...prev, ...patch }));
    else setSeller((prev) => ({ ...prev, ...patch }));
  };

  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null);
  const [allSessions, setAllSessions] = useState<SessionInfo[]>([]);
  const otpRef = useRef<HTMLInputElement>(null);
  const focusTimerRef = useRef<number | null>(null);

  const buyerSession = useMemo(() => getLastSession(allSessions, "Buyer"), [allSessions]);
  const sellerSession = useMemo(() => getLastSession(allSessions, "Seller"), [allSessions]);

  const buyerKycOk = !!buyerSession && buyerSession.status === "kyc_done";
  const sellerKycOk = !!sellerSession && sellerSession.status === "kyc_done";

  // Sequential rule: Seller locked until Buyer KYC completes
  const sellerLocked = !buyerKycOk;

  const bothConfigured = useMemo(() => {
    const isValid = (p: PartyInput) => /^\d{12}$/.test(p.aadhaar) && !!p.name?.trim();
    return isValid(buyer) && isValid(seller) && consent;
  }, [buyer, seller, consent]);

  const hasPartialVerification = (buyerKycOk && !sellerKycOk) || (!buyerKycOk && sellerKycOk);

  const handleClose = () => {
    if (hasPartialVerification) {
      const confirmed = window.confirm(
        "Only one party has completed KYC. Closing now will not update final status. Close anyway?"
      );
      if (!confirmed) return;
    }
    onClose();
  };

  // progress bar: 0 / 50 / 100
  const progressPct = buyerKycOk && sellerKycOk ? 100 : buyerKycOk || sellerKycOk ? 50 : 0;

  useEffect(() => {
    if (!isOpen) {
      setStep("form");
      setActiveRole("Buyer");
      setCurrentSession(null);
      setAllSessions([]);
      setConsent(false);
      setLoading(false);
      if (focusTimerRef.current) {
        window.clearTimeout(focusTimerRef.current);
        focusTimerRef.current = null;
      }
    }
  }, [isOpen]);

  // Emit progress helper (latest session ids)
  const emitProgress = (sessions: SessionInfo[]) => {
    const buyerSid = [...sessions].reverse().find(s => s.role === "Buyer")?.session_id;
    const sellerSid = [...sessions].reverse().find(s => s.role === "Seller")?.session_id;
    onProgress?.({ docId: documentId, sessionIds: { buyer: buyerSid, seller: sellerSid } });
  };

  // After both done, notify parent once
  useEffect(() => {
    if (!buyerKycOk || !sellerKycOk) return;
    onBothSigned?.({ docId: documentId });
  }, [buyerKycOk, sellerKycOk, documentId, onBothSigned]);

const beginKycFor = async (role: PartyRole) => {
  if (loading) return;

  if (role === "Seller" && sellerLocked) {
    toast.error("Start Seller only after Buyer completes KYC.");
    return;
  }

  try {
    const ok = await requireBothVerified(documentId);
    console.debug("[KYC] requireBothVerified ->", ok);
  } catch {
    // ignore
  }

  const existing = getLastSession(allSessions, role);
  if (existing && (existing.status === "otp_sent" || existing.status === "otp_verified" || existing.status === "kyc_done")) {
    setActiveRole(role);
    setCurrentSession(existing.status === "kyc_done" ? null : existing);
    setStep(existing.status === "otp_sent" || existing.status === "otp_verified" ? "otp" : "form");
    toast.info(`${role} session already active. Reusing it.`);
    return;
  }

  const p = role === "Buyer" ? buyer : seller;
  if (!/^\d{12}$/.test(p.aadhaar)) return toast.error(`${role}: Enter valid 12-digit Aadhaar`);
  if (!p.name?.trim()) return toast.error(`${role}: Name is required`);
  if (!consent) return toast.warn("Please accept the Aadhaar consent");

  const mask = (v: string) => v ? v.replace(/\d(?=\d{4})/g, "•") : v;

  try {
    setLoading(true);

    const payload = {
      document_id: documentId,
      party_role: role,
      name: p.name.trim(),
      email: p.email || "",
      phone: p.phone || "",
      aadhaar: p.aadhaar,
      consent_text: "I consent to use my Aadhaar for KYC.",
    };
    console.debug("[KYC_INIT] request payload:", { ...payload, aadhaar: mask(payload.aadhaar as string) });

    const init = await electronicSignAPI.initSession(payload);
    console.debug("[KYC_INIT] response:", init);

    // helpful hint if we’re in Sandbox test error
    if ((init as any)?.ok === false && /Test environment/i.test((init as any)?.error || "")) {
      toast.error("Sandbox test mode needs the exact saved example. Try Aadhaar 999988887777 and OTP 123456, or enable SANDBOX_MOCK=1.");
      return;
    }

    const session_id = (init as any)?.session_id;
    if (!session_id) throw new Error((init as any)?.error || "No session_id from /aadhaar/init");

    const info: SessionInfo = { session_id, status: "otp_sent", role };
    setCurrentSession(info);
    const merged = mergeOrAppend(allSessions, info);
    setAllSessions(merged);
    emitProgress(merged);

    setStep("otp");
    setActiveRole(role);
    toast.success(`${role} — OTP sent`);
    focusTimerRef.current = window.setTimeout(() => otpRef.current?.focus(), 150);
  } catch (e: any) {
    const status = e?.response?.status;
    const msg = e?.response?.data?.error || e?.message || "Failed to start Aadhaar KYC";
    console.error("[KYC_INIT_ERROR] status:", status);
    console.error("[KYC_INIT_ERROR] data:", e?.response?.data);
    console.error("[KYC_INIT_ERROR] headers:", e?.response?.headers);
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};


  const verifyOtp = async (otp: string) => {
    if (loading) return;
    if (!currentSession?.session_id) return;
    if (!/^\d{6}$/.test(otp)) return toast.error("Enter 6-digit OTP");

    try {
      setLoading(true);

      const res = await electronicSignAPI.verifyOtp(currentSession.session_id, otp);
      if (!(res as any)?.verified) throw new Error("OTP verification failed");

      const updated: SessionInfo = {
        ...(currentSession || { session_id: "" }),
        status: "kyc_done",
        role: currentSession?.role ?? activeRole,
        kyc: (res as any).kyc || {},
      };

      const merged = mergeOrAppend(allSessions, updated);
      setAllSessions(merged);
      setCurrentSession(null);
      emitProgress(merged);

      toast.success(`${activeRole} KYC verified ✓`);

      // If both done → done screen
      const buyerDone = !!merged.find((s) => s.role === "Buyer" && s.status === "kyc_done");
      const sellerDone = !!merged.find((s) => s.role === "Seller" && s.status === "kyc_done");
      if (buyerDone && sellerDone) setStep("done");
      else setStep("form"); // stay to let other party finish
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 !mt-0">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Aadhaar KYC (OTP)</h3>
              <p className="text-xs text-gray-600">Verify Buyer → then Seller (sequential)</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close"
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-blue-600 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Quick status */}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <KycBadge session={buyerSession} label="Buyer" />
            <KycBadge session={sellerSession} label="Seller" />
            {!buyerKycOk && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-medium">
                Seller locked until Buyer completes
              </span>
            )}
          </div>
        </div>

        {/* Role tabs */}
        <div className="px-5 pt-3 flex gap-2">
          {(["Buyer", "Seller"] as PartyRole[]).map((r) => {
            const disabled =
              loading || step === "otp" || (r === "Seller" && sellerLocked);
            return (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  activeRole === r
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={disabled}
                type="button"
                aria-pressed={activeRole === r}
                title={r === "Seller" && sellerLocked ? "Buyer must complete KYC first" : ""}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          {step === "form" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-700">Full Name</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <UserIcon size={14} className="text-gray-400" />
                    <input
                      value={party.name}
                      onChange={(e) => setParty({ name: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded-lg text-sm"
                      placeholder={`${activeRole} name`}
                      autoComplete="off"
                      disabled={(activeRole === "Buyer" && buyerKycOk) || (activeRole === "Seller" && sellerKycOk)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-700">Aadhaar Number</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Fingerprint size={14} className="text-gray-400" />
                    <input
                      value={party.aadhaar}
                      onChange={(e) => setParty({ aadhaar: onlyDigits(e.target.value).slice(0, 12) })}
                      className="w-full px-2 py-1.5 border rounded-lg text-sm tracking-widest"
                      placeholder="XXXXXXXXXXXX"
                      autoComplete="off"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={12}
                      disabled={(activeRole === "Buyer" && buyerKycOk) || (activeRole === "Seller" && sellerKycOk)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-700">Email (optional)</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <input
                      value={party.email || ""}
                      onChange={(e) => setParty({ email: e.target.value })}
                      className="w-full px-2 py-1.5 border rounded-lg text-sm"
                      placeholder="name@email.com"
                      type="email"
                      autoComplete="off"
                      disabled={(activeRole === "Buyer" && buyerKycOk) || (activeRole === "Seller" && sellerKycOk)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-700">Phone (optional)</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <input
                      value={party.phone || ""}
                      onChange={(e) => setParty({ phone: onlyDigits(e.target.value).slice(0, 15) })}
                      className="w-full px-2 py-1.5 border rounded-lg text-sm"
                      placeholder="10-digit"
                      autoComplete="off"
                      inputMode="tel"
                      pattern="\d*"
                      maxLength={15}
                      disabled={(activeRole === "Buyer" && buyerKycOk) || (activeRole === "Seller" && sellerKycOk)}
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  disabled={(activeRole === "Buyer" && buyerKycOk) || (activeRole === "Seller" && sellerKycOk)}
                />
                <span className="text-gray-700">
                  I consent to use my Aadhaar for KYC verification for this document.
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => beginKycFor(activeRole)}
                  disabled={
                    loading ||
                    (activeRole === "Seller" && sellerLocked) ||
                    ((activeRole === "Buyer" && buyerKycOk) || (activeRole === "Seller" && sellerKycOk))
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                  type="button"
                  title={activeRole === "Seller" && sellerLocked ? "Buyer must complete KYC first" : ""}
                >
                  {loading ? "Starting…" : `Send OTP to ${activeRole}`}
                </button>

                <div className="text-xs text-gray-500">
                  {bothConfigured ? "Both parties configured." : "Fill both parties & consent."}
                </div>
              </div>

              {/* KYC summary for current role */}
              <KycSummaryCard session={activeRole === "Buyer" ? buyerSession : sellerSession} />
            </div>
          )}

          {step === "otp" && currentSession && (
            <div className="space-y-4">
              <div className="text-sm text-gray-700">
                OTP sent to the Aadhaar-linked mobile for <strong>{activeRole}</strong>.
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={otpRef}
                  placeholder="Enter 6-digit OTP"
                  className="px-3 py-2 border rounded-lg text-sm w-40 tracking-widest"
                  maxLength={6}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="\d*"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const v = (e.target as HTMLInputElement).value.trim();
                      verifyOtp(v);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const v = (otpRef.current?.value || "").trim();
                    verifyOtp(v);
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                  type="button"
                >
                  Verify OTP
                </button>
                <button
                  onClick={async () => {
                    if (!currentSession?.session_id) return;
                    try {
                      setLoading(true);
                      await electronicSignAPI.resendOtp(currentSession.session_id);
                      toast.success("OTP resent");
                    } catch (e: any) {
                      toast.error(e?.message || "Failed to resend");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-3 py-2 border rounded-lg text-sm flex items-center gap-1"
                  type="button"
                >
                  <RefreshCw size={14} /> Resend
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <CheckCircle size={18} /> Both Buyer &amp; Seller KYC verified.
              </div>
              <div className="text-xs text-gray-600">
                You can close this modal. KYC details have been saved to the document.
              </div>

              {/* Show both summaries */}
              <KycSummaryCard session={buyerSession} />
              <KycSummaryCard session={sellerSession} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-600 flex items-center gap-2">
            <ShieldCheck size={14} /> Aadhaar KYC via licensed provider
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 mr-2">
              {progressPct === 100
                ? "KYC complete"
                : activeRole === "Buyer"
                ? buyerKycOk
                  ? "Buyer KYC done"
                  : "Verify Buyer KYC"
                : sellerLocked
                ? "Seller locked until Buyer completes"
                : sellerKycOk
                ? "Seller KYC done"
                : "Verify Seller KYC"}
            </span>

            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
