import { api } from './axios';
import type {
    EventItem,
    EventFormat,
    EventCategory,
} from '../types/event.types';

export type GetEventsParams = {
    search?: string;
    place?: string;
    date?: string;
    format?: EventFormat;
    category?: EventCategory;
};

export const eventsApi = {
    async getAll(params?: GetEventsParams) {
        const { data } = await api.get<EventItem[]>('/events', { params });
        return data;
    },

    async getById(id: string) {
        const { data } = await api.get<EventItem>(`/events/${id}`);
        return data;
    },
};
