// src/lib/electronicSignAPI.ts
import { api } from "./api";

/* ================================
   Common Types
   ================================ */
export type PartyRole = "Seller" | "Buyer";

/** Common envelope */
type OkEnvelope = { ok?: boolean };

/** Aadhaar / KYC / eSign status lifecycle */
export type EsignStatus =
  | "created"         // session created
  | "otp_sent"        // Aadhaar OTP sent
  | "otp_verified"    // OTP verified successfully
  | "kyc_pending"     // waiting for KYC completion
  | "kyc_done"        // one party KYC done
  | "kyc_verified"    // both Buyer & Seller verified
  | "failed";         // any error or invalid OTP

/* ================================
   Aadhaar-KYC API responses
   ================================ */

/** /aadhaar/init */
export type AadhaarInitResponse = OkEnvelope & {
  session_id: string;
  masked_last4?: string;
  reference_id?: string;
  message?: string;
};

/** /aadhaar/resend-otp */
export type AadhaarResendOtpResponse = OkEnvelope & {
  resent: boolean;
  reference_id?: string;
  message?: string;
};

/** /aadhaar/verify-otp */
export type AadhaarVerifyOtpResponse = OkEnvelope & {
  verified: boolean;
  status?: EsignStatus; // may return "otp_verified" or "kyc_done"
  kyc?: {
    name?: string;
    gender?: string;
    dob?: string;
    address?: Record<string, any> | null;
  };
};

/** /aadhaar/kyc */
export type AadhaarGetKycResponse = OkEnvelope & {
  party_role: PartyRole;
  name: string;
  aadhaar_last4?: string;
  consent_at?: string;
  otp_sent_at?: string;
  otp_verified_at?: string;
  kyc_verified_at?: string;
  kyc?: {
    name?: string;
    gender?: string;
    dob?: string;
    address?: Record<string, any> | null;
  };
};

/* ================================
   Utility: unwrap axios responses
   ================================ */
const data = async <T>(p: Promise<any>): Promise<T> => {
  const r = await p;
  return (r?.data ?? r) as T;
};

/* ================================
   Aadhaar-KYC API client
   ================================ */
export const electronicSignAPI = {
  /** Step-1: Initiate Aadhaar OTP (Generate OTP) */
  initSession(params: {
    document_id: number | string;
    party_role: PartyRole;
    name: string;
    email?: string;
    phone?: string;
    aadhaar: string;
    consent_text: string;
  }): Promise<AadhaarInitResponse> {
    return data<AadhaarInitResponse>(api.post("/esign/aadhaar/init", params));
  },

  /** Step-2: Resend OTP */
  resendOtp(session_id: string): Promise<AadhaarResendOtpResponse> {
    return data<AadhaarResendOtpResponse>(
      api.post("/esign/aadhaar/resend-otp", { session_id })
    );
  },

  /** Step-3: Verify OTP */
  verifyOtp(session_id: string, otp: string): Promise<AadhaarVerifyOtpResponse> {
    return data<AadhaarVerifyOtpResponse>(
      api.post("/esign/aadhaar/verify-otp", { session_id, otp })
    );
  },

  /** Step-4: Fetch saved KYC summary */
  getKyc(session_id: string): Promise<AadhaarGetKycResponse> {
    return data<AadhaarGetKycResponse>(
      api.get("/esign/aadhaar/kyc", { params: { session_id } })
    );
  },
};
