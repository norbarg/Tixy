import { api } from './axios';
import type { Company } from '../types/company.types';

export const companiesApi = {
    async getAll(search?: string) {
        const { data } = await api.get<Company[]>('/companies', {
            params: search ? { search } : undefined,
        });
        return data;
    },
};
