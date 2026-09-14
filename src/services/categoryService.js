import axiosClient from './axiosClient';

const categoryService = {
  getAll: () => axiosClient.get('/categories'),
};

export default categoryService;
