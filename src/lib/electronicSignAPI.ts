import { api } from "./api";

export type PartyRole = "Seller" | "Buyer";
export type EsignStatus = "created" | "otp_sent" | "otp_verified" | "redirected" | "signed" | "failed";

export type InitSessionResponse = {
  session_id: string;
  redirect_url?: string;
};

export type ResendOtpResponse = { ok: true };

export type VerifyOtpResponse = {
  verified: boolean;
};

export type RedirectUrlResponse = {
  redirect_url: string;
};

export type PollStatusResponse = {
  status: EsignStatus;
  signed_at?: string;
};

export type ArtifactsResponse = {
  signed_pdf_url?: string;
  audit_trail_url?: string;
};

// Normalize axios/fetch responses to T
const data = async <T>(p: Promise<any>): Promise<T> => {
  const r = await p;
  // if using axios, prefer r.data; if fetch/other, r itself may be the payload
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
};
