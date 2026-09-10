import axiosClient from './axiosClient';

const authService = {
  register: (data) => {
    return axiosClient.post('/auth/register', data);
  },
  
  login: (data) => {
    return axiosClient.post('/auth/login', data);
  },
  
  firebaseLogin: (idToken) => {
    return axiosClient.post('/auth/firebase', { idToken });
  }
};

export default authService;
