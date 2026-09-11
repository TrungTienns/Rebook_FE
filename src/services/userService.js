import axiosClient from './axiosClient';

const userService = {
  // === FAVORITES ===
  getFavorites: () => axiosClient.get('/favorites'),
  toggleFavorite: (bookId) => axiosClient.post('/favorites', { bookId }),
  checkFavorite: (bookId) => axiosClient.get(`/favorites/check/${bookId}`),

  // === READING HISTORY ===
  getReadingHistory: () => axiosClient.get('/reading-history'),
  updateReadingHistory: (bookId, chapterId) => axiosClient.post('/reading-history', { bookId, chapterId }),

  // === RATINGS ===
  getRatingsByBook: (bookId) => axiosClient.get(`/ratings/${bookId}`),
  getMyRating: (bookId) => axiosClient.get(`/ratings/${bookId}/my`),
  submitRating: (bookId, stars, review) => axiosClient.post('/ratings', { bookId, stars, review }),

  // === COMMENTS ===
  getCommentsByBook: (bookId) => axiosClient.get(`/comments/${bookId}`),
  createComment: (bookId, content, parentId = null) => axiosClient.post('/comments', { bookId, content, parentId }),
  // === ADMIN - USER MANAGEMENT ===
  getAllUsers: () => axiosClient.get('/users'),
  updateUserRole: (id, role) => axiosClient.put(`/users/${id}/role`, { role }),
  updateUserStatus: (id, status) => axiosClient.put(`/users/${id}/status`, { status }),
};

export default userService;
