import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });
export const dashboardApi = { home: () => api.get('/dashboard/home'), student: () => api.get('/dashboard/student'), admin: () => api.get('/dashboard/admin') };
