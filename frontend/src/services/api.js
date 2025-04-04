// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `${token}`;
  }
  return config;
});

export const register = (data) => api.post('/auth/register', data);
export const getDashboardStats = () => api.get('/admin/dashboard-stats');
export const getUsers = (params) => api.get('/admin/users', { params });
export const getUserById = (userId) => api.get(`/admin/users/${userId}`);
export const getUserItems = (userId, params = {}) => api.get(`/admin/users/${userId}/items`, { params });
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);
export const getItems = (params) => api.get('/admin/items', { params });
export const getItemById = (itemId) => api.get(`/admin/items/${itemId}`);
export const deleteItem = (itemId) => api.delete(`/admin/items/${itemId}`);
export const getKeepers = () => api.get('/keepers');
export const getConversations = (params) => api.get('/admin/conversations', { params });
export const getCategories = (params = {}) => api.get('/categories', { params });
export const getAllCategoriesForAdmin = (params = {}) => api.get('/categories/admin', { params });
export const addCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export default api;