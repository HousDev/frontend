// src/lib/stripeIntegrationAPI.ts
import { api } from "./api";

export const stripeIntegrationAPI = {
  // ✅ Get Stripe integration config
  getIntegration: async () => {
    try {
      const res = await api.get("/stripe-integration/get");
      return res;
    } catch (err) {
      console.error("❌ [Stripe] Get Integration Error:", err);
      throw err;
    }
  },

  // ✅ Save or update integration keys
  // expected data shape: { keyId: string (publishable), keySecret: string (secret), webhookSecret?: string, webhookUrl?: string, mode?: 'test'|'live' }
  saveIntegration: async (data: {
    keyId: string;
    keySecret: string;
    webhookSecret?: string | null;
    webhookUrl?: string | null;
    mode?: string | null;
  }) => {
    try {
      const res = await api.post("/stripe-integration/save", data);
      return res;
    } catch (err) {
      console.error("❌ [Stripe] Save Integration Error:", err);
      throw err;
    }
  },

  // ✅ Toggle active/inactive
  toggleIntegration: async (data: { active: boolean }) => {
    try {
      const res = await api.post("/stripe-integration/toggle", data);
      return res;
    } catch (err) {
      console.error("❌ [Stripe] Toggle Integration Error:", err);
      throw err;
    }
  },

  // ✅ Create PaymentIntent (for Payment Intents + Elements flows)
  // data: { amount: number, currency?: string, metadata?: object, automatic_payment_methods?: boolean }
  createPaymentIntent: async (data: {
    amount: number;
    currency?: string;
    metadata?: Record<string, any>;
    automatic_payment_methods?: boolean;
  }) => {
    try {
      const res = await api.post("/stripe-integration/create-payment-intent", data);
      return res;
    } catch (err) {
      console.error("❌ [Stripe] Create PaymentIntent Error:", err);
      throw err;
    }
  },

  // ✅ Create Checkout Session (hosted Stripe Checkout)
  // data: { line_items: Array, mode: 'payment'|'subscription', success_url, cancel_url, customer_email? }
  createCheckoutSession: async (data: Record<string, any>) => {
    try {
      const res = await api.post("/stripe-integration/create-checkout-session", data);
      return res;
    } catch (err) {
      console.error("❌ [Stripe] Create Checkout Session Error:", err);
      throw err;
    }
  },

  // ✅ (Optional) Refund charge via backend
  // data: { chargeId: string, amount?: number, reason?: string }
  createRefund: async (data: { chargeId: string; amount?: number; reason?: string }) => {
    try {
      const res = await api.post("/stripe-integration/refund", data);
      return res;
    } catch (err) {
      console.error("❌ [Stripe] Create Refund Error:", err);
      throw err;
    }
  },

  // ✅ (Optional) Verify webhook on the server — typically handled server-side; placeholder if you want to request verification/test from backend
  verifyWebhookTest: async (data: { payload?: any }) => {
    try {
      const res = await api.post("/stripe-integration/verify-webhook-test", data);
      return res;
    } catch (err) {
      console.error("❌ [Stripe] Verify Webhook Test Error:", err);
      throw err;
    }
  },
};
