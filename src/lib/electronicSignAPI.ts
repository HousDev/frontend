import { api } from "./api";

export type PartyRole = "Seller" | "Buyer";
export type EsignStatus =
  | "created"
  | "otp_sent"
  | "otp_verified"
  | "redirected"
  | "signed"
  | "failed";

/** Common "ok" envelope your backend returns */
type OkEnvelope = { ok?: boolean };

/** /esign/init */
export type InitSessionResponse = OkEnvelope & {
  session_id: string;
  redirect_url?: string | null;
  /** Dev-only helpers (mock provider) */
  mock_otp?: string;
  mock_otp_expires_at?: string; // ISO
  /** When an active session exists and we rotated OTP instead of creating new */
  reused?: boolean;
};

/** /esign/resend-otp */
export type ResendOtpResponse = OkEnvelope & {
  resent: boolean;
  mock_otp?: string;
  mock_otp_expires_at?: string;
};

/** /esign/verify-otp */
export type VerifyOtpResponse = OkEnvelope & {
  /** Your current backend returns only this: */
  verified: boolean;
  /** If you later decide to return redirect directly, keep these optional: */
  status?: EsignStatus;               // e.g., "otp_verified" or "redirected"
  redirect_url?: string | null;       // if BE creates redirect in verify step
  signed_at?: string | null;
};

/** /esign/redirect-url */
export type RedirectUrlResponse = OkEnvelope & {
  redirect_url: string;
};

/** /esign/status */
export type PollStatusResponse = OkEnvelope & {
  status: EsignStatus;
  signed_at?: string | null;
  redirect_url?: string | null; // your backend also returns redirect_url here
};

/** /esign/artifacts */
export type ArtifactsResponse = OkEnvelope & {
  signed_pdf_url?: string | null;
  audit_trail_url?: string | null;
};

/** (optional) /esign/session helper */
export type GetSessionResponse = OkEnvelope & {
  session_id: string;
  status: EsignStatus;
  redirect_url?: string | null;
  signed_at?: string | null;
};

// Normalize axios/fetch responses to T
const data = async <T>(p: Promise<any>): Promise<T> => {
  const r = await p;
  return (r?.data ?? r) as T;
};

export const electronicSignAPI = {
  initSession(params: {
    document_id: number | string;
    party_role: PartyRole;
    name: string;
    email?: string;
    phone?: string;
    aadhaar: string;
    consent_text: string;
  }): Promise<InitSessionResponse> {
    return data<InitSessionResponse>(api.post("/esign/init", params));
  },

  resendOtp(session_id: string): Promise<ResendOtpResponse> {
    return data<ResendOtpResponse>(api.post("/esign/resend-otp", { session_id }));
  },

  verifyOtp(session_id: string, otp: string): Promise<VerifyOtpResponse> {
    return data<VerifyOtpResponse>(api.post("/esign/verify-otp", { session_id, otp }));
  },

  getRedirectUrl(session_id: string): Promise<RedirectUrlResponse> {
    return data<RedirectUrlResponse>(api.get("/esign/redirect-url", { params: { session_id } }));
  },

  pollStatus(session_id: string): Promise<PollStatusResponse> {
    return data<PollStatusResponse>(api.get("/esign/status", { params: { session_id } }));
  },

  fetchArtifacts(session_id: string): Promise<ArtifactsResponse> {
    return data<ArtifactsResponse>(api.get("/esign/artifacts", { params: { session_id } }));
  },

  /** optional helper you already have on BE */
  getSession(session_id: string): Promise<GetSessionResponse> {
    return data<GetSessionResponse>(api.get("/esign/session", { params: { session_id } }));
  },
};
