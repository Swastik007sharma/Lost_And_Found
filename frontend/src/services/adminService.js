import api from './api';

export const getDashboardStats = () => api.get('/admin/dashboard-stats');
export const getUsers = (params) => api.get('/admin/users', { params });
export const getUserById = (userId) => api.get(`/admin/users/${userId}`);
export const getUserItems = (userId, params = {}) => api.get(`/admin/users/${userId}/items`, { params });
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);
export const toggleUserActivation = (userId) => api.put(`/admin/users/${userId}/activate`);
export const getConversations = (params) => api.get('/admin/conversations', { params });
export const getAllItems = (params) => api.get('/admin/items', { params });

// Deletion Reports APIs
export const getScheduledItemsReport = () => api.get('/admin/reports/scheduled-items');
export const getScheduledUsersReport = () => api.get('/admin/reports/scheduled-users');
export const getDeletionSuccessReport = (params) => api.get('/admin/reports/deletion-success', { params });

// Cleanup Configuration APIs
export const getCleanupConfig = () => api.get('/admin/cleanup-config');
export const updateCleanupConfig = (config) => api.put('/admin/cleanup-config', config);