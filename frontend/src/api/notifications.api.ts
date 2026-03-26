// src/api/notifications.api.ts
import { api } from './axios';

export type NotificationItem = {
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    sentViaEmail: boolean;
    sentViaSite: boolean;
    isRead: boolean;
    createdAt: string;
};

export const notificationsApi = {
    async getMyNotifications() {
        const { data } = await api.get<NotificationItem[]>('/notifications/my');
        return data;
    },

    async markAsRead(id: string) {
        const { data } = await api.patch<NotificationItem>(
            `/notifications/${id}/read`,
        );
        return data;
    },

    async markAllAsRead() {
        const { data } = await api.patch<{ message: string }>(
            '/notifications/read-all',
        );
        return data;
    },
};
