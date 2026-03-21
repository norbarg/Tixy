import { api } from './axios';
import type { User } from '../types/auth.types';

export const usersApi = {
  async updateMyLogin(login: string) {
    const { data } = await api.patch<User>('/users/me', { login });
    return data;
  },

  async deleteMyAccount() {
    const { data } = await api.delete<{ message: string }>('/users/me');
    return data;
  },


  
  async getAllUsers() {
  const { data } = await api.get<User[]>('/users');
  return data;
},

async deleteUserById(id: string) {
  const { data } = await api.delete<{ message: string }>(`/users/${id}`);
  return data;
},

};
