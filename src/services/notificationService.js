import axiosClient from './axiosClient';

const notificationService = {
  getMyNotifications: () => axiosClient.get('/notifications'),
  markAsRead: (id) => axiosClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => axiosClient.put('/notifications/read-all'),
  deleteNotification: (id) => axiosClient.delete(`/notifications/${id}`),
};

export default notificationService;
