import axios from 'axios';
import * as yup from 'yup';

export type NotesStatus = 'draft' | 'published' | 'unpublished';
export interface AdminNote { thumbnail?: string; _id: string; name: string; description: string; exam: string; subject: string; pdfUrl: string; pages: number; status: NotesStatus; createdAt: string; access: 'free' | 'paid'; price: number; hasAccess?: boolean }
export interface NotePayload { name: string; description: string; exam: string; subject: string; status: NotesStatus; access: 'free' | 'paid'; price: number }
export interface CreateNotePayload extends NotePayload { file: File }

export const noteSchema = yup.object({ name: yup.string().trim().required('Notes name is required.'), description: yup.string().trim().default(''), exam: yup.string().trim().required('Exam is required.'), subject: yup.string().trim().required('Subject is required.'), status: yup.mixed<NotesStatus>().oneOf(['draft', 'published', 'unpublished']).required(), access: yup.mixed<'free' | 'paid'>().oneOf(['free', 'paid']).required(), price: yup.number().when('access', { is: 'paid', then: (schema) => schema.min(1).required(), otherwise: (schema) => schema.default(0) }) });
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });
export const notesApiService = {
  uploadThumbnail: (id: string, file: File) => { const data = new FormData(); data.append('thumbnail', file); return api.post(`/notes/${id}/thumbnail`, data); },
  removeThumbnail: (id: string) => api.delete(`/notes/${id}/thumbnail`),
  listPublic: (params?: { exam?: string; subject?: string; search?: string }) => api.get('/notes', { params }),
  getPublic: (id: string) => api.get(`/notes/${id}`),
  listAdmin: () => api.get('/notes/admin'), getAdmin: (id: string) => api.get(`/notes/admin/${id}`),
  create: (payload: CreateNotePayload) => { const data = new FormData(); data.append('name', payload.name); data.append('description', payload.description); data.append('exam', payload.exam); data.append('subject', payload.subject); data.append('status', payload.status); data.append('access', payload.access); data.append('price', String(payload.price)); data.append('file', payload.file, payload.file.name); return api.post('/notes', data); },
  checkout: (id: string) => api.post(`/notes/${id}/checkout`), verifyCheckout: (id: string, payment: Record<string, string>) => api.post(`/notes/${id}/checkout/verify`, payment),
  update: (id: string, payload: NotePayload) => api.patch(`/notes/${id}`, payload), remove: (id: string) => api.delete(`/notes/${id}`),
};
