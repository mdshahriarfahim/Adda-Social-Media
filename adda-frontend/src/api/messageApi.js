import axiosInstance from './axiosInstance';

export const sendMessage = (receiverId, { text, file }) => {
  const formData = new FormData();
  if (text) formData.append('text', text);
  if (file) formData.append('media', file);
  return axiosInstance.post(`/messages/${receiverId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getConversation = (userId) => axiosInstance.get(`/messages/${userId}`);

export const getInbox = () => axiosInstance.get('/messages');