import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });
export type Banner = { _id: string; title: string; subtitle: string; thumbnail: string; buttonLabel: string; buttonUrl: string; placement: 'home' | 'dashboard' | 'both'; status: 'draft' | 'published'; order: number };
export type BannerPayload = Omit<Banner, '_id' | 'thumbnail'>;
export const bannersApi = {
  listPublic: (placement: 'home' | 'dashboard') => api.get('/banners', { params: { placement } }),
  list: () => api.get('/banners/admin'), create: (payload: BannerPayload) => api.post('/banners', payload), update: (id: string, payload: BannerPayload) => api.patch(`/banners/${id}`, payload), remove: (id: string) => api.delete(`/banners/${id}`),
  upload: (id: string, file: File) => { const data = new FormData(); data.append('thumbnail', file); return api.post(`/banners/${id}/image`, data); }, removeImage: (id: string) => api.delete(`/banners/${id}/image`),
};
