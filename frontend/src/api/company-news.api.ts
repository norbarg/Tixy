import { api } from './axios';

export type CreateCompanyNewsDto = {
    companyId: string;
    title: string;
    content: string;
};

export type CompanyNewsItem = {
    id: string;
    companyId: string;
    title: string;
    content: string;
    createdAt: string;
};

export const companyNewsApi = {
    async create(dto: CreateCompanyNewsDto) {
        const { data } = await api.post<CompanyNewsItem>('/company-news', dto);
        return data;
    },

    async getByCompanyId(companyId: string) {
        const { data } = await api.get<CompanyNewsItem[]>(
            `/company-news/company/${companyId}`,
        );
        return data;
    },

    async delete(id: string) {
        const { data } = await api.delete(`/company-news/${id}`);
        return data;
    },
};
