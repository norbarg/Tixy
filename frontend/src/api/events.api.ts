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

export type CreateEventPayload = {
    title: string;
    description: string;
    format: string;
    category: string;
    bannerUrl?: string;
    posterUrl?: string;
    placeName: string;
    placeAddress?: string;
    googleMapsUrl?: string;
    googlePlaceId?: string;
    placeLat?: string;
    placeLng?: string;
    startsAt: string;
    endsAt: string;
    publishedAt?: string;
    price: string;
    ticketsLimit: number;
    visitorsVisibility?: string;
    notifyOnNewVisitor?: boolean;
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

    async createEvent(payload: CreateEventPayload) {
        const { data } = await api.post<EventItem>('/events', payload);
        return data;
    },

    async deleteEvent(id: string) {
        const { data } = await api.delete<{ message: string }>(`/events/${id}`);
        return data;
    },
};
