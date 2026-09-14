import axiosClient from './axiosClient';

const commentService = {
  // Client methods
  getByBook: (bookId) => axiosClient.get(`/comments/${bookId}`),
  create: (data) => axiosClient.post('/comments', data),
  
  // Admin methods
  getAllAdmin: (params) => axiosClient.get('/comments/admin/all', { params }),
  delete: (id) => axiosClient.delete(`/comments/${id}`),
  toggleStatus: (id) => axiosClient.put(`/comments/admin/${id}/toggle-status`),
};

export default commentService;
