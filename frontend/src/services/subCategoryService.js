import api from './api';

export const getSubCategories = (categoryId, params = {}) => api.get(`/subcategories/by-category/${categoryId}`, { params });
export const getAllSubCategoriesForAdmin = (params = {}) => api.get('/subcategories/admin', { params });
export const addSubCategory = (data) => api.post('/subcategories', data);
export const updateSubCategory = (id, data) => api.put(`/subcategories/${id}`, data);
export const deleteSubCategory = (id) => api.delete(`/subcategories/${id}`);