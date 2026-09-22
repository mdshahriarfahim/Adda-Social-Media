import axiosInstance from './axiosInstance';

// text + একাধিক ছবি/ভিডিও একসাথে পাঠানোর জন্য FormData লাগে
export const createPost = ({ text, privacy, files }) => {
  const formData = new FormData();
  formData.append('text', text || '');
  formData.append('privacy', privacy || 'public');
  if (files && files.length > 0) {
    files.forEach((file) => formData.append('media', file));
  }
  return axiosInstance.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getFeed = (page = 1, limit = 10) => axiosInstance.get(`/posts/feed?page=${page}&limit=${limit}`);

export const getPostById = (id) => axiosInstance.get(`/posts/${id}`);

export const getUserPosts = (userId) => axiosInstance.get(`/posts/user/${userId}`);

export const updatePost = (id, data) => axiosInstance.put(`/posts/${id}`, data);

export const deletePost = (id) => axiosInstance.delete(`/posts/${id}`);

export const toggleLikePost = (id) => axiosInstance.put(`/posts/${id}/like`);

export const sharePost = (id, data) => axiosInstance.post(`/posts/${id}/share`, data);