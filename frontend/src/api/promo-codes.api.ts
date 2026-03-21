import { api } from './axios';

export type CreatePromoCodePayload = {
  eventId: string;
  code: string;
  discountPercent: number;
};

export const promoCodesApi = {
  async createPromoCode(payload: CreatePromoCodePayload) {
    const { data } = await api.post('/promo-codes', payload);
    return data;
  },
};
