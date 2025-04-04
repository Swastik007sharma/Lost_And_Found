import api from './api';

export const getKeepers = async () => {
  const response = await api.get('/keepers');
  return response.data;
};
