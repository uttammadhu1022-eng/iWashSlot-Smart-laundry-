import axios from 'axios';

const isLocalFrontend = window.location.port === '3000' || window.location.hostname === 'localhost';
const defaultApiUrl = isLocalFrontend ? 'http://localhost:5000/api/v1' : '/api/v1';
const API_BASE_URL = import.meta.env.VITE_API_URL || defaultApiUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token dynamically from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
