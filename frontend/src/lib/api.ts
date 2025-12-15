import axios from 'axios';

// API Base URL - ensure /api is appended
const getApiBaseUrl = () => {
  // Check if we're in browser
  if (typeof window !== 'undefined') {
    // In production (deployed), use production backend
    if (window.location.hostname !== 'localhost') {
      return 'https://devhelper-37jw.onrender.com/api';
    }
  }

  // For local development or if env var is set
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  // If URL doesn't end with /api, append it
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔧 API Base URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Regex API
export const regexApi = {
  test: (data: { pattern: string; testString: string; flags?: string[] }) =>
    api.post('/regex/test', data),
};

// JSON API
export const jsonApi = {
  format: (data: { jsonString: string; indentSize?: number; sortKeys?: boolean }) =>
    api.post('/json/format', data),
};

// SSH Commands API
export const sshApi = {
  getAll: (params?: { category?: string; search?: string }) =>
    api.get('/ssh', { params }),
  getById: (id: number) => api.get(`/ssh/${id}`),
  create: (data: any) => api.post('/ssh', data),
  update: (id: number, data: any) => api.put(`/ssh/${id}`, data),
  delete: (id: number) => api.delete(`/ssh/${id}`),
};

// API Tester API
export const apiTesterApi = {
  test: (data: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: string;
    timeout?: number;
  }) => api.post('/api-tester/request', data),
};

// Notes API
export const notesApi = {
  getAll: (params?: { search?: string; tag?: string }) =>
    api.get('/notes', { params }),
  getById: (id: number) => api.get(`/notes/${id}`),
  create: (data: any) => api.post('/notes', data),
  update: (id: number, data: any) => api.put(`/notes/${id}`, data),
  togglePin: (id: number) => api.patch(`/notes/${id}/pin`),
  delete: (id: number) => api.delete(`/notes/${id}`),
};

export default api;

