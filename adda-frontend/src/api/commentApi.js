import axiosInstance from './axiosInstance';

export const addComment = (postId, data) => axiosInstance.post(`/posts/${postId}/comments`, data);

export const getComments = (postId) => axiosInstance.get(`/posts/${postId}/comments`);

export const updateComment = (id, data) => axiosInstance.put(`/comments/${id}`, data);

export const deleteComment = (id) => axiosInstance.delete(`/comments/${id}`);

export const toggleLikeComment = (id) => axiosInstance.put(`/comments/${id}/like`);