//src/api/orders.api.ts
import { api } from './axios';
import type { OrderItem } from '../types/order.types';

export type CreateOrderPayload = {
    eventId: string;
    quantity: number;
    promoCode?: string;
    showUserInVisitors?: boolean;
};

export const ordersApi = {
    async createOrder(payload: CreateOrderPayload) {
        const { data } = await api.post<OrderItem>('/orders', payload);
        return data;
    },

    async getMyOrders() {
        const { data } = await api.get<OrderItem[]>('/orders/my');
        return data;
    },
};
