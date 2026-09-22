import axiosInstance from './axiosInstance';

export const getUserProfile = (id) => axiosInstance.get(`/users/${id}`);

export const updateProfile = (data) => axiosInstance.put('/users/me', data);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return axiosInstance.put('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadCoverPhoto = (file) => {
  const formData = new FormData();
  formData.append('cover', file);
  return axiosInstance.put('/users/me/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const searchUsers = (query) => axiosInstance.get(`/users/search?q=${encodeURIComponent(query)}`);

export const sendFriendRequest = (id) => axiosInstance.post(`/users/${id}/friend-request`);

export const acceptFriendRequest = (id) => axiosInstance.post(`/users/${id}/accept-request`);

export const rejectFriendRequest = (id) => axiosInstance.post(`/users/${id}/reject-request`);

export const unfriendUser = (id) => axiosInstance.delete(`/users/${id}/unfriend`);