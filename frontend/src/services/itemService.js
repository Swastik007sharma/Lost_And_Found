import api from './api';

export const createItem = async (formData) => {
  const response = await api.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getItems = async (params) => {
  const response = await api.get('/items', { params });
  return response.data;
};

export const getItemById = async (id) => {
  const response = await api.get(`/items/${id}`);
  return response.data;
};
