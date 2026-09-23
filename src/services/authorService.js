import axiosClient from './axiosClient';

const authorService = {
  // ── Public ──────────────────────────────────────────────────────────────────
  getAll: (params) => axiosClient.get('/authors', { params }),
  getById: (id) => axiosClient.get(`/authors/${id}`),

  // ── Admin CRUD (multipart/form-data for avatar upload) ───────────────────
  create: (formData) =>
    axiosClient.post('/authors', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  update: (id, formData) =>
    axiosClient.put(`/authors/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  remove: (id) => axiosClient.delete(`/authors/${id}`),

  // ── Follow (authenticated users) ─────────────────────────────────────────
  toggleFollow: (id) => axiosClient.post(`/authors/${id}/follow`),
  getFollowStatus: (id) => axiosClient.get(`/authors/${id}/follow`),
};

export default authorService;
