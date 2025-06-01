import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('[API] Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[API] Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;
