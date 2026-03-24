import { api } from './axios';

type MySubscriptionsResponse = {
    events: Array<{
        id: string;
        eventId: string;
        createdAt: string;
        event: any | null;
    }>;
    companies: Array<{
        id: string;
        companyId: string;
        createdAt: string;
        company: any | null;
    }>;
};

export const subscriptionsApi = {
    async getMySubscriptions() {
        const { data } =
            await api.get<MySubscriptionsResponse>('/subscriptions/my');
        return data;
    },

    async subscribeToEvent(eventId: string) {
        const { data } = await api.post(`/subscriptions/events/${eventId}`);
        return data;
    },

    async unsubscribeFromEvent(eventId: string) {
        const { data } = await api.delete(`/subscriptions/events/${eventId}`);
        return data;
    },

    async subscribeToCompany(companyId: string) {
        const { data } = await api.post(
            `/subscriptions/companies/${companyId}`,
        );
        return data;
    },

    async unsubscribeFromCompany(companyId: string) {
        const { data } = await api.delete(
            `/subscriptions/companies/${companyId}`,
        );
        return data;
    },
};
