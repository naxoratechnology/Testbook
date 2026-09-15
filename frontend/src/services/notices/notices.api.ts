import axios from 'axios';
import * as yup from 'yup';
export type NoticeType = 'vacancy' | 'job' | 'general';
export type NoticeStatus = 'draft' | 'published' | 'unpublished';
export interface Notice { _id: string; title: string; description: string; type: NoticeType; organization: string; location: string; eligibility: string; lastDate: string | null; applyUrl: string; status: NoticeStatus; createdAt: string }
export type NoticePayload = Omit<Notice, '_id' | 'createdAt'>;
export const noticeSchema = yup.object({ title: yup.string().trim().required('Title is required.'), description: yup.string().trim().required('Description is required.'), type: yup.mixed<NoticeType>().oneOf(['vacancy', 'job', 'general']).required(), organization: yup.string().trim().default(''), location: yup.string().trim().default(''), eligibility: yup.string().trim().default(''), lastDate: yup.string().nullable().default(null), applyUrl: yup.string().trim().url('Enter a valid URL.').default(''), status: yup.mixed<NoticeStatus>().oneOf(['draft', 'published', 'unpublished']).required() });
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });
export const noticesApiService = { list: () => api.get('/notices'), listAdmin: () => api.get('/notices/admin'), getAdmin: (id: string) => api.get(`/notices/admin/${id}`), create: (payload: NoticePayload) => api.post('/notices', payload), update: (id: string, payload: NoticePayload) => api.patch(`/notices/${id}`, payload), remove: (id: string) => api.delete(`/notices/${id}`) };
