import axiosClient from './axiosClient';

const adminService = {
  getDashboardStats: () => axiosClient.get('/dashboard/stats'),
  createNotification: (data) => axiosClient.post('/notifications', data),
};

export default adminService;
