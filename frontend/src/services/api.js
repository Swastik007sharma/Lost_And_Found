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

// Authentication Endpoints
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Admin Endpoints
export const getDashboardStats = () => api.get('/admin/dashboard-stats');
export const getUsers = (params) => api.get('/admin/users', { params });
export const getUserById = (userId) => api.get(`/admin/users/${userId}`);
export const getUserItems = (userId, params = {}) => api.get(`/admin/users/${userId}/items`, { params });
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);
export const toggleUserActivation = (userId) => api.put(`/admin/users/${userId}/activate`);
export const getConversations = (params) => api.get('/admin/conversations', { params });

// Item Endpoints
export const getItems = (params) => api.get('/items', { params });
export const getItemById = (itemId) => api.get(`/items/${itemId}`);
export const deleteItem = (itemId) => api.delete(`/items/${itemId}`);
export const createItem = (data) => {
  const config = {
    headers: {
      Authorization: `${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  return api.post('/items', data, config);
};
export const getItemDetails = (itemId) => api.get(`/items/${itemId}`);
export const claimItem = (itemId) => api.post(`/items/${itemId}/claim`);
export const startConversation = (data) => api.post('/conversations', data);
export const updateItem = (itemId, data) => {
  const config = {
    headers: {
      Authorization: `${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  return api.put(`/items/${itemId}`, data, config);
};
export const deleteUserItem = (itemId) => api.delete(`/items/${itemId}`);
export const toggleItemActivation = (itemId) => api.put(`/admin/items/${itemId}/activate`);

// Keeper Endpoints
export const getKeepers = () => api.get('/keepers');

// Category Endpoints
export const getCategories = (params = {}) => api.get('/categories', { params });
export const getAllCategoriesForAdmin = (params = {}) => api.get('/categories/admin', { params });
export const addCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// User Endpoints
export const getMyItems = (params = {}) => api.get('/users/me/items', { params });
export const getMyConversations = (params = {}) => api.get('/conversations', { params });

// New Item Management Endpoints
export const markItemAsReturned = (itemId) => api.post(`/items/${itemId}/return`);
export const assignKeeperToItem = (itemId, data) => api.post(`/items/${itemId}/assign-keeper`, data);
export const generateQRCodeForItem = (itemId) => api.post(`/items/${itemId}/generate-qr`);
export const scanQRCodeForItem = (itemId, data) => api.post(`/items/${itemId}/scan-qr`, data);
export const generateOTPForItem = (itemId) => api.post(`/items/${itemId}/generate-otp`);
export const verifyOTPForItem = (itemId, data) => api.post(`/items/${itemId}/verify-otp`, data);

// New User Management Endpoints
export const getUserProfile = () => api.get('/users/me');
export const updateUserProfile = (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${localStorage.getItem('token')}`,
    },
  };
  return api.put('/users/me', data, config);
};
export const updateUserPassword = (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `${localStorage.getItem('token')}`,
    },
  };
  return api.put('/users/me/password', data, config);
};
export const deleteUserAccount = () => api.delete('/users/me');

// New Messaging Endpoints
export const getMessagesInConversation = (conversationId, params = {}) =>
  api.get(`/messages/${conversationId}/messages`, { params });
export const sendMessageInConversation = (conversationId, data) =>
  api.post(`/messages/${conversationId}/messages`, data);

// New Notification Endpoints
export const getNotifications = (params = {}) => api.get('/notifications', { params });
export const markNotificationAsRead = (notificationId) =>
  api.put(`/notifications/${notificationId}/read`, { read: true });

// New Search Endpoints
export const searchItems = (params) => api.get('/search/items/search', { params });

export default api;