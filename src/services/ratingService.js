import axiosClient from './axiosClient';

const ratingService = {
  // Client methods
  getByBook: (bookId) => axiosClient.get(`/ratings/${bookId}`),
  createOrUpdate: (data) => axiosClient.post('/ratings', data),
  getMyRating: (bookId) => axiosClient.get(`/ratings/${bookId}/my`),
  
  // Admin methods
  getAllAdmin: (params) => axiosClient.get('/ratings/admin/all', { params }),
  delete: (id) => axiosClient.delete(`/ratings/admin/${id}`),
  toggleStatus: (id) => axiosClient.put(`/ratings/admin/${id}/toggle-status`),
};

export default ratingService;
