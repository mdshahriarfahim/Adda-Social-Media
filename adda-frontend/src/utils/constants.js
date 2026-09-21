// Central place for all environment/config values used across the app
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
export const TOKEN_KEY = 'adda_token';
export const USER_KEY = 'adda_user';