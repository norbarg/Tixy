//src/api/auth.api.ts
import { api } from './axios';
import type {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    User,
} from '../types/auth.types';

export const authApi = {
    async login(payload: LoginPayload) {
        const { data } = await api.post<AuthResponse>('/auth/login', payload);
        return data;
    },

    async register(payload: RegisterPayload) {
        const { data } = await api.post<AuthResponse>(
            '/auth/register',
            payload,
        );
        return data;
    },

    async getMe() {
        const { data } = await api.get<User>('/auth/me');
        return data;
    },

    async refresh(refreshToken: string) {
        const { data } = await api.post<AuthResponse>('/auth/refresh', {
            refreshToken,
        });
        return data;
    },

    async logout() {
        const { data } = await api.post<{ message: string }>('/auth/logout');
        return data;
    },
};
