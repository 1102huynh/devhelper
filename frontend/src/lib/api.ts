import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

