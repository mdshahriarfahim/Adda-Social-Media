import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

// একটাই axios instance পুরো app জুড়ে ব্যবহার হবে,
// যাতে token বসানো আর error handling একবারই লিখতে হয়
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// প্রতিটা রিকোয়েস্টের আগে localStorage থেকে token নিয়ে
// automatically Authorization header এ বসিয়ে দেয়
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token মেয়াদ শেষ হয়ে গেলে (401) বা invalid হলে
// অটোমেটিক লগইন পেজে পাঠিয়ে দেয়
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;