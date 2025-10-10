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
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import { electronicSignAPI, PartyRole } from "@/lib/electronicSignAPI";
import { documentStatusAPI } from "@/lib/documentStatusAPI";

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
  status: "created" | "otp_sent" | "otp_verified" | "redirected" | "signed" | "failed";
  redirect_url?: string;
  signed_at?: string;
  error?: string;
  role?: PartyRole; // keep who this session belongs to
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  defaultBuyer?: { name?: string; email?: string; phone?: string };
  defaultSeller?: { name?: string; email?: string; phone?: string };
  /** optional; if not provided we will update status ourselves */
  onProgress?: (args: { docId: number; sessionIds: string[] }) => Promise<void> | void;
  onBothSigned?: (args: { docId: number; sessions: SessionInfo[] }) => Promise<void> | void;
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
const norm = (s?: string) => (s === "e-sign_pending" ? "esign_pending" : (s || "created"));

type PartyFlags = { buyer_verified?: boolean; seller_verified?: boolean };
const hasPartyFlags = (s: unknown): s is PartyFlags =>
  !!s && (("buyer_verified" in (s as any)) || ("seller_verified" in (s as any)));

const requireBothVerified = async (documentId: number) => {
  const snap = await documentStatusAPI.getSnapshot(documentId);
  const status = norm((snap as any)?.current_status);
  if (hasPartyFlags(snap)) {
    return snap.buyer_verified === true && snap.seller_verified === true;
  }
  // fallback to stage status
  return status === "otp_verified";
};

// --- new helpers for session control ---
const ACTIVE_PHASES: SessionInfo["status"][] = ["otp_sent", "otp_verified", "redirected"];
const getLastSession = (list: SessionInfo[], role: PartyRole) =>
  [...list].reverse().find((s) => s.role === role);
const hasLiveSession = (list: SessionInfo[], role: PartyRole) => {
  const s = getLastSession(list, role);
  return !!s && (ACTIVE_PHASES.includes(s.status) || s.status === "signed");
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
  const [step, setStep] = useState<"form" | "otp" | "redirect" | "done">("form");
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

  const bothConfigured = useMemo(() => {
    const isValid = (p: PartyInput) => /^\d{12}$/.test(p.aadhaar) && !!p.name?.trim();
    return isValid(buyer) && isValid(seller) && consent;
  }, [buyer, seller, consent]);

  const buyerSession = useMemo(
    () => getLastSession(allSessions, "Buyer"),
    [allSessions]
  );
  const sellerSession = useMemo(
    () => getLastSession(allSessions, "Seller"),
    [allSessions]
  );

  const buyerOtpOk = !!buyerSession && (buyerSession.status === "otp_verified" || buyerSession.status === "signed");
  const sellerOtpOk = !!sellerSession && (sellerSession.status === "otp_verified" || sellerSession.status === "signed");

  const buyerSigned = !!buyerSession && buyerSession.status === "signed";
  const sellerSigned = !!sellerSession && sellerSession.status === "signed";

  // Sequential rule: Seller locked until Buyer fully signed
  const sellerLocked = !buyerSigned;

  // Continue button enablement (for current role)
  const canContinueForBuyer = !!buyerSession && buyerSession.status === "otp_verified";
  const canContinueForSeller = buyerSigned && !!sellerSession && sellerSession.status === "otp_verified";

  const [progressSent, setProgressSent] = useState(false);
  const hasPartialVerification =
    (buyerOtpOk && !sellerOtpOk) || (!buyerOtpOk && sellerOtpOk);

  const handleClose = () => {
    if (hasPartialVerification) {
      const confirmed = window.confirm(
        "Only one party has verified. Closing now will not update status. Close anyway?"
      );
      if (!confirmed) return;
    }
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setStep("form");
      setActiveRole("Buyer");
      setCurrentSession(null);
      setAllSessions([]);
      setConsent(false);
      setLoading(false);
      setProgressSent(false);
      if (focusTimerRef.current) {
        window.clearTimeout(focusTimerRef.current);
        focusTimerRef.current = null;
      }
    }
  }, [isOpen]);

  const beginEsignFor = async (role: PartyRole) => {
    if (loading) return;

    // Sequential gate: Seller cannot start until Buyer is fully signed
    if (role === "Seller" && sellerLocked) {
      toast.error("Start Seller only after Buyer has completed e-sign.");
      return;
    }

    // Step-1 (identity) gate
    try {
      const ok = await requireBothVerified(documentId);
      if (!ok) {
        toast.error("First complete Buyer & Seller identity verification (Step 1).");
        return;
      }
    } catch {
      toast.error("Could not validate verification status.");
      return;
    }

    // Reuse any live session for this role
    const existing = getLastSession(allSessions, role);
    if (existing && (ACTIVE_PHASES.includes(existing.status) || existing.status === "signed")) {
      setActiveRole(role);
      setCurrentSession(existing);
      setStep(existing.status === "otp_verified" ? "form" : existing.status === "redirected" ? "redirect" : "otp");
      toast.info(`${role} session already active. Reusing it.`);
      return;
    }

    const p = role === "Buyer" ? buyer : seller;
    if (!/^\d{12}$/.test(p.aadhaar)) return toast.error(`${role}: Enter valid 12-digit Aadhaar`);
    if (!p.name?.trim()) return toast.error(`${role}: Name is required`);
    if (!consent) return toast.warn("Please accept the Aadhaar eSign consent");

    try {
      setLoading(true);
      const init = await electronicSignAPI.initSession({
        document_id: documentId,
        party_role: role,
        name: p.name.trim(),
        email: p.email || "",
        phone: p.phone || "",
        aadhaar: p.aadhaar,
        consent_text: "I hereby consent to use my Aadhaar for authentication and eSign the document.",
      });

      const session_id = (init as any)?.session_id;
      if (!session_id) throw new Error("No session_id from /esign/init");

      let redirectUrl: string | undefined = (init as any)?.redirect_url;
      if (!redirectUrl) {
        try {
          const ru = await electronicSignAPI.getRedirectUrl(session_id);
          redirectUrl = (ru as any)?.redirect_url;
        } catch {}
      }

      const info: SessionInfo = { session_id, status: "otp_sent", redirect_url: redirectUrl, role };
      setCurrentSession(info);
      setAllSessions((prev) => mergeOrAppend(prev, info));

      setStep("otp");
      setActiveRole(role);
      toast.success(`${role} — OTP sent`);
      focusTimerRef.current = window.setTimeout(() => otpRef.current?.focus(), 150);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to start eSign");
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

      const isOtpVerified = (res: unknown): boolean => {
        const r = res as any;
        return !!(r?.verified ?? r?.ok ?? r?.success === true);
      };

      const res = await electronicSignAPI.verifyOtp(currentSession.session_id, otp);
      const ok = isOtpVerified(res);
      if (!ok) throw new Error("OTP verification failed");

      let redirectUrl = currentSession.redirect_url;
      if (!redirectUrl) {
        try {
          const ru = await electronicSignAPI.getRedirectUrl(currentSession.session_id);
          redirectUrl = (ru as any)?.redirect_url || "";
        } catch {}
      }

      const updated: SessionInfo = {
        ...(currentSession || { session_id: "" }),
        status: "otp_verified",
        redirect_url: redirectUrl || currentSession?.redirect_url,
        role: currentSession?.role ?? activeRole,
      };

      const merged = mergeOrAppend(allSessions, updated);
      setAllSessions(merged);
      setCurrentSession(null); // close session until Continue
      toast.success(`${activeRole} OTP verified ✓`);

      // Stay on form (sequential) – next step is Continue for same role
      setStep("form");
      toast.info(`Click "Continue to e-Sign" for ${activeRole}.`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Continue only for CURRENT role (sequential). Not "both".
  const continueForCurrentRole = async () => {
    const role = activeRole;
    const sess = role === "Buyer" ? buyerSession : sellerSession;

    // Guards
    if (role === "Seller" && sellerLocked) {
      toast.error("Seller can proceed only after Buyer has completed e-sign.");
      return;
    }
    if (!sess || sess.status !== "otp_verified") {
      toast.error(`Verify OTP for ${role} first.`);
      return;
    }

    try {
      setLoading(true);

      // Identity gate re-check
      const docOk = await requireBothVerified(documentId);
      if (!docOk) {
        toast.error("Party identity verification is incomplete. Verify both first.");
        return;
      }

      // esign_pending: set when first redirect happens (i.e., Buyer Continue)
      // We set once; subsequent continues won't re-send.
      if (!progressSent) {
        const sessionIds = Array.from(new Set(allSessions.map((s) => s.session_id)));

        try {
          setProgressSent(true);
          if (onProgress) {
            await onProgress({ docId: documentId, sessionIds });
          } else {
            await documentStatusAPI.setStatus(documentId, {
              new_status: "esign_pending",
              details: {
                session_ids: sessionIds,
                buyer_otp: buyerSession?.session_id,
                seller_otp: sellerSession?.session_id,
              },
            });
          }

          window.dispatchEvent(
            new CustomEvent("doc:status", {
              detail: { id: documentId, status: "esign_pending" },
            })
          );
          toast.success("Document status updated to E-Sign Pending.");
        } catch (e) {
          setProgressSent(false);
          throw e;
        }
      }

      // Open current role tab and enter redirect mode with this session as current
      let url = sess.redirect_url;
      if (!url) {
        try {
          const ru = await electronicSignAPI.getRedirectUrl(sess.session_id);
          url = (ru as any)?.redirect_url;
        } catch {}
      }
      if (url) window.open(url, "_blank", "noopener,noreferrer");

      setCurrentSession({ ...sess, status: "redirected" });
      setAllSessions((prev) => mergeOrAppend(prev, { ...sess, status: "redirected" }));
      setStep("redirect");
      toast.info("Signing page opened (if available).");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Could not continue");
    } finally {
      setLoading(false);
    }
  };

  const pollCurrent = async () => {
    if (loading) return;
    if (!currentSession?.session_id) {
      toast.error("No active signing session to check.");
      return;
    }
    try {
      setLoading(true);
      const s = await electronicSignAPI.pollStatus(currentSession.session_id);
      const raw = String((s as any)?.status ?? "created").toLowerCase();
      const status: SessionInfo["status"] =
        raw === "completed" || raw === "done"
          ? "signed"
          : (["created", "otp_sent", "otp_verified", "redirected", "signed", "failed"] as const).includes(raw as any)
          ? (raw as SessionInfo["status"])
          : "created";

      const signed = status === "signed";
      const newInfo: SessionInfo = {
        ...currentSession,
        status,
        signed_at: signed ? ( (s as any)?.signed_at || new Date().toISOString() ) : currentSession.signed_at,
      };

      // persist
      const merged = mergeOrAppend(allSessions, newInfo);
      setAllSessions(merged);
      setCurrentSession(newInfo);

      if (!signed) {
        toast.info(`Status: ${status}`);
        return;
      }

      toast.success(`Signed ✓ (${activeRole})`);

      if (activeRole === "Buyer") {
        // Buyer done → move to Seller (now unlocked)
        setCurrentSession(null);
        setActiveRole("Seller");
        setStep("form");
        toast.info("Buyer completed. Now start Seller e-sign.");
        return;
      }

      // If Seller signed, complete flow
      if (activeRole === "Seller") {
        const bothOk = await requireBothVerified(documentId);
        if (!bothOk) {
          toast.error("Cannot complete: both parties are not verified anymore.");
          setStep("form");
          setActiveRole("Buyer");
          setCurrentSession(null);
          return;
        }
        setStep("done");
        await onBothSigned?.({ docId: documentId, sessions: merged });
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to poll status");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const continueEnabled =
    activeRole === "Buyer" ? canContinueForBuyer : canContinueForSeller;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 !mt-0">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Aadhaar e-Sign</h3>
            <p className="text-xs text-gray-600">Step 2 • eSign OTP + Redirect (Sequential)</p>
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

        {/* Quick status for both parties */}
        <div className="px-5 pt-3 flex items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
              buyerSigned
                ? "bg-green-100 text-green-800"
                : (buyerOtpOk ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700")
            }`}
          >
            Buyer {buyerSigned ? "Signed ✓" : buyerOtpOk ? "OTP Verified" : "Pending"}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
              sellerSigned
                ? "bg-green-100 text-green-800"
                : (sellerOtpOk ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700")
            }`}
          >
            Seller {sellerSigned ? "Signed ✓" : sellerOtpOk ? "OTP Verified" : "Pending"}
          </span>
          {sellerLocked && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-medium">
              Seller locked until Buyer completes
            </span>
          )}
        </div>

        {/* Role tabs */}
        <div className="px-5 pt-3 flex gap-2">
          {(["Buyer", "Seller"] as PartyRole[]).map((r) => {
            const disabled =
              loading ||
              step === "otp" ||
              step === "redirect" ||
              (r === "Seller" && sellerLocked);
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
                title={r === "Seller" && sellerLocked ? "Buyer must complete signing first" : ""}
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
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span className="text-gray-700">
                  I consent to use my Aadhaar for authentication and to e-sign this document via the licensed eSign provider.
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => beginEsignFor(activeRole)}
                  disabled={
                    loading ||
                    (activeRole === "Seller" && sellerLocked)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                  type="button"
                  title={activeRole === "Seller" && sellerLocked ? "Buyer must complete signing first" : ""}
                >
                  {loading ? "Starting…" : `Send OTP to ${activeRole}`}
                </button>

                <div className="text-xs text-gray-500">
                  {bothConfigured ? "Both parties configured." : "Fill both parties & consent."}
                </div>
              </div>
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

          {step === "redirect" && (
            <div className="space-y-4">
              <div className="text-sm text-gray-700 flex items-center gap-2">
                <Clock size={16} /> Complete signing in the opened tab, then click "Check Status".
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={pollCurrent}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm disabled:opacity-50"
                  type="button"
                >
                  {loading ? "Checking…" : "Check Status"}
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <CheckCircle size={18} /> Both Buyer &amp; Seller have signed.
              </div>
              <div className="text-xs text-gray-600">
                You can close this modal. Signed PDF and audit trail will be attached to the document.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-600 flex items-center gap-2">
            <ShieldCheck size={14} /> Aadhaar e-Sign via licensed ASP/CSP
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 mr-2">
              {activeRole === "Seller" && sellerLocked
                ? "Seller locked until Buyer completes"
                : activeRole === "Buyer"
                ? (canContinueForBuyer ? "Ready to continue" : "Verify Buyer OTP first")
                : (canContinueForSeller ? "Ready to continue" : "Verify Seller OTP first")}
            </span>

            <button
              onClick={continueForCurrentRole}
              disabled={!continueEnabled || loading}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                continueEnabled ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500"
              }`}
              type="button"
              title={
                continueEnabled
                  ? `Open ${activeRole} signing page`
                  : `Verify OTP for ${activeRole} first`
              }
            >
              {loading ? "Processing..." : "Continue to e-Sign"}
            </button>

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
