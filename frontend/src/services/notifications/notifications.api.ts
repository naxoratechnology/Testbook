import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });
export interface ApiNotification { _id: string; title: string; message: string; type: string; href: string; readBy: string[]; createdAt: string }
export const notificationsApiService = { list: () => api.get('/notifications'), markRead: (id: string) => api.patch(`/notifications/${id}/read`), markAllRead: () => api.patch('/notifications/read-all') };
