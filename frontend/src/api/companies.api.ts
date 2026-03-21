import { api } from './axios';
import type {
    Company,
    CreateCompanyPayload,
    UpdateCompanyPayload,
} from '../types/company.types';

export const companiesApi = {
    async getAll(search?: string) {
        const { data } = await api.get<Company[]>('/companies', {
            params: search ? { search } : undefined,
        });
        return data;
    },

    async getMyCompany() {
        const { data } = await api.get<Company>('/companies/my');
        return data;
    },

    async createCompany(payload: CreateCompanyPayload) {
        const { data } = await api.post<Company>('/companies', payload);
        return data;
    },

    async updateCompany(id: string, payload: UpdateCompanyPayload) {
        const { data } = await api.patch<Company>(`/companies/${id}`, payload);
        return data;
    },

    async deleteCompany(id: string) {
        const { data } = await api.delete<{ message: string }>(
            `/companies/${id}`,
        );
        return data;
    },
};
