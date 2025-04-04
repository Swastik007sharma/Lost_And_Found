import api from './api';

export const getConversations = async (userId) => {
  const response = await api.get(`/conversations/${userId}`);
  return response.data;
};
