import axiosClient from './axiosClient';

const productService = {
  getAll: (params) => {
    const url = '/books'; // Note: backend uses '/books' endpoint
    return axiosClient.get(url, { params });
  },
  
  getById: (id) => {
    const url = `/books/${id}`;
    return axiosClient.get(url);
  },
  
  create: (data) => {
    const url = '/books';
    return axiosClient.post(url, data);
  },
  
  update: (id, data) => {
    const url = `/books/${id}`;
    return axiosClient.put(url, data);
  },
  
  delete: (id) => {
    const url = `/books/${id}`;
    return axiosClient.delete(url);
  }
};

export default productService;
