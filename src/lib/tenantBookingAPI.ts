import { api } from './api';

export interface CreateBookingPayload {
  tenant_id?: number | string;
  property_id: number | string;
  property_title?: string;
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

  getByPropertyId: async (propertyId: string | number) => {
    const response = await api.get(`/tenant-bookings/property/${propertyId}`);
    return response.data;
  },
};
