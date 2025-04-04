import api from './api';

export const getMessages = async (conversationId) => {
  const response = await api.get(`/messages/${conversationId}/messages`);
  return response.data;
};
