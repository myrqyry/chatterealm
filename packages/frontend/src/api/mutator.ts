import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export const customInstance = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
customInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default customInstance;

// Export for Orval
export const axiosInstance = customInstance;