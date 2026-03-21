import { api } from './axios';
import type { OrderItem } from '../types/order.types';

export const ordersApi = {
  async getMyOrders() {
    const { data } = await api.get<OrderItem[]>('/orders/my');
    return data;
  },
};
