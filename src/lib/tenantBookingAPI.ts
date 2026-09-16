import { api } from './api';

export interface CreateBookingPayload {
  tenant_id?: number | string;
  property_id: number | string;
  property_title?: string;
  interest_id?: number | string;
  token_amount: number;
  move_in_date: string;
  payment_method?: string;
  monthly_rent?: number;
  security_deposit?: number;
  lock_in_period?: string;
  owner_id?: number | string;
  owner_name?: string;
}

export const tenantBookingAPI = {
  create: async (data: CreateBookingPayload) => {
    const response = await api.post('/tenant-bookings', data);
    return response.data;
  },

  getByTenantId: async (tenantId: string | number) => {
    const response = await api.get(`/tenant-bookings/tenant/${tenantId}`);
    return response.data;
  },

  getByOwnerId: async (ownerId: string | number) => {
    const response = await api.get(`/tenant-bookings/owner/${ownerId}`);
    return response.data;
  },

  getByPropertyId: async (propertyId: string | number) => {
    const response = await api.get(`/tenant-bookings/property/${propertyId}`);
    return response.data;
  },

  claimPayment: async (bookingId: string | number, payload: { payment_reference: string; payment_notes?: string | null }) => {
    const response = await api.post(`/tenant-bookings/${bookingId}/claim-payment`, payload);
    return response.data;
  },

  verifyPayment: async (bookingId: string | number, payload: { verified_by_user_id?: string | number } = {}) => {
    const response = await api.post(`/tenant-bookings/${bookingId}/verify-payment`, payload);
    return response.data;
  },

  flagIssue: async (bookingId: string | number, payload: { notes?: string }) => {
    const response = await api.post(`/tenant-bookings/${bookingId}/flag-issue`, payload);
    return response.data;
  },

  verifyKyc: async (bookingId: string | number) => {
    const response = await api.post(`/tenant-bookings/${bookingId}/verify-kyc`);
    return response.data;
  },

  rejectKyc: async (bookingId: string | number, payload: { reason?: string } = {}) => {
    const response = await api.post(`/tenant-bookings/${bookingId}/reject-kyc`, payload);
    return response.data;
  },

  cancelBooking: async (bookingId: string | number) => {
    const response = await api.post(`/tenant-bookings/${bookingId}/cancel`);
    return response.data;
  },

  requestKyc: async (bookingId: string | number) => {
    const response = await api.post(`/tenant-bookings/${bookingId}/request-kyc`);
    return response.data;
  },

  uploadAgreement: async (bookingId: string | number, payload: FormData | { agreement_document?: string } = {}) => {
    const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
    const response = await api.post(`/tenant-bookings/${bookingId}/upload-agreement`, payload, { headers });
    return response.data;
  },

  updateStatus: async (bookingId: string | number, payload: any) => {
    const response = await api.put(`/tenant-bookings/${bookingId}/status`, payload);
    return response.data;
  },

  signAgreement: async (bookingId: string | number, payload: { tenant_signature_name?: string; signer_name?: string; signature_image?: string } = {}) => {
    const response = await api.post(`/tenant-bookings/${bookingId}/sign-agreement`, payload);
    return response.data;
  },

  finalizeAgreement: async (bookingId: string | number, payload: { rent_due_day?: number; owner_upi_id?: string; owner_qr_code_url?: string } = {}) => {
    const response = await api.post(`/tenant-bookings/${bookingId}/finalize-agreement`, payload);
    return response.data;
  },
};

