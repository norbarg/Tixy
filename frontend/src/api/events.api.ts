// events.api.ts
// import { api } from './axios';
// import type { EventItem } from '../types/event.types';

// export const eventsApi = {
//   async getAllEvents() {
//     const { data } = await api.get<EventItem[]>('/events');
//     return data;
//   },

//   async deleteEvent(id: string) {
//     const { data } = await api.delete<{ message: string }>(`/events/${id}`);
//     return data;
//   },
// };
import { api } from './axios';
import type { EventItem } from '../types/event.types';

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
  async getAllEvents() {
    const { data } = await api.get<EventItem[]>('/events');
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
