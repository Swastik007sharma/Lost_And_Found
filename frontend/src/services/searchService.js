import api from './api';

export const searchItems = async (params) => {
  const response = await api.get('/search/items/search', { params });
  return response.data;
};
