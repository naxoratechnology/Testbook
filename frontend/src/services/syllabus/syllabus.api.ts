import axios from 'axios';
import * as yup from 'yup';
export type SyllabusStatus = 'draft' | 'published' | 'unpublished';
export interface AdminSyllabusDocument { _id: string; name: string; pdfUrl: string; status: SyllabusStatus; createdAt: string; updatedAt: string }
export interface SyllabusPayload { name: string; status: SyllabusStatus }
export interface CreateSyllabusPayload extends SyllabusPayload { file: File }
export const syllabusSchema = yup.object({ name: yup.string().trim().required('Syllabus name is required.'), status: yup.mixed<SyllabusStatus>().oneOf(['draft', 'published', 'unpublished']).required() });
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1', withCredentials: true });
export const syllabusApiService = { listPublic: () => api.get('/syllabus'), getPublic: (id: string) => api.get(`/syllabus/${id}`), listAdmin: () => api.get('/syllabus/admin'), getAdmin: (id: string) => api.get(`/syllabus/admin/${id}`), create: (payload: CreateSyllabusPayload) => { const data = new FormData(); data.append('name', payload.name); data.append('status', payload.status); data.append('file', payload.file, payload.file.name); return api.post('/syllabus', data); }, update: (id: string, payload: SyllabusPayload) => api.patch(`/syllabus/${id}`, payload), remove: (id: string) => api.delete(`/syllabus/${id}`) };
