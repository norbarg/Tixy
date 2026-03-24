//src/api/payments.api.ts
import { api } from './axios';

export const paymentsApi = {
    async createCheckout(orderId: string) {
        const { data } = await api.post<{ checkoutUrl: string }>(
            `/payments/checkout/${orderId}`,
        );
        return data;
    },
};
