import { api } from './axios';
import type { CommentItem } from '../types/comment.types';

export const commentsApi = {
  async getAllComments() {
    const { data } = await api.get<CommentItem[]>('/comments');
    return data;
  },

  async deleteComment(id: string) {
    const { data } = await api.delete<{ message: string }>(`/comments/${id}`);
    return data;
  },
};
