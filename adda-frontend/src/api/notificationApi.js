import axiosInstance from './axiosInstance';

export const getNotifications = () => axiosInstance.get('/notifications');

export const markAsSeen = (id) => axiosInstance.put(`/notifications/${id}/seen`);

export const markAllAsSeen = () => axiosInstance.put('/notifications/seen-all');