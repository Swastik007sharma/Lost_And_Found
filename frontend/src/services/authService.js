import api from './api';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  console.log('Login response:', response.data);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};
