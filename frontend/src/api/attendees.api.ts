import { api } from './axios';

export type EventAttendeeItem = {
    id: string;
    eventId: string;
    userId: string;
    orderId: string;
    quantity: number;
    showInVisitors: boolean;
    createdAt: string;
    user: {
        id: string;
        login: string;
        email?: string;
    } | null;
};

export const attendeesApi = {
    async getByEventId(eventId: string) {
        const { data } = await api.get<EventAttendeeItem[]>(
            `/events/${eventId}/attendees`,
        );
        return data;
    },
};
