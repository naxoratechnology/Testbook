import axios from 'axios';
import * as yup from 'yup';

export type CurrentAffairsStatus = 'draft' | 'published' | 'unpublished';
export interface CurrentAffairsQuestion { _id?: string; text: string; options: string[]; correctAnswer: number; explanation: string }
export interface PublicCurrentAffairsQuestion extends Omit<CurrentAffairsQuestion, 'correctAnswer' | 'explanation'> { _id: string; correctAnswer?: number; explanation?: string }
export interface PublicCurrentAffairsEntry extends Omit<AdminCurrentAffairsEntry, 'questions'> { questions: PublicCurrentAffairsQuestion[] }
export interface CurrentAffairsAttempt { _id: string; title: string; currentAffairs: string; answers: Record<string, number>; correct: number; incorrect: number; unanswered: number; score: number; questions: CurrentAffairsQuestion[] }
export interface AdminCurrentAffairsEntry { _id: string; date: string; title: string; exam: string; highlights: string[]; pdfUrl: string; questions: CurrentAffairsQuestion[]; status: CurrentAffairsStatus; createdAt: string }
export interface CurrentAffairsPayload { date: string; title: string; exam: string; highlights: string[]; questions: CurrentAffairsQuestion[]; status: CurrentAffairsStatus }
export interface CreateCurrentAffairsPayload extends CurrentAffairsPayload { file: File }

export const currentAffairsSchema = yup.object({ date: yup.string().required('Date is required.'), title: yup.string().trim().required('Title is required.'), exam: yup.string().trim().required('Exam is required.'), highlights: yup.array().of(yup.string().trim().required()).required(), questions: yup.array().of(yup.object({ text: yup.string().trim().required('Question text is required.'), options: yup.array().of(yup.string().trim().required()).min(2).required(), correctAnswer: yup.number().integer().min(0).required(), explanation: yup.string().trim().default('') })).min(1, 'Add at least one daily question.').required(), status: yup.mixed<CurrentAffairsStatus>().oneOf(['draft', 'published', 'unpublished']).required() });
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1', withCredentials: true });
export const currentAffairsApiService = {
  listPublic: () => api.get('/current-affairs'), getPublic: (id: string) => api.get(`/current-affairs/${id}`), attempt: (id: string, answers: Record<string, number | null>) => api.post(`/current-affairs/${id}/attempts`, { answers }),
  listAdmin: () => api.get('/current-affairs/admin'), getAdmin: (id: string) => api.get(`/current-affairs/admin/${id}`),
  create: (payload: CreateCurrentAffairsPayload) => { const data = new FormData(); data.append('date', payload.date); data.append('title', payload.title); data.append('exam', payload.exam); data.append('highlights', payload.highlights.join('\n')); data.append('questions', JSON.stringify(payload.questions)); data.append('status', payload.status); data.append('file', payload.file, payload.file.name); return api.post('/current-affairs', data); },
  update: (id: string, payload: CurrentAffairsPayload) => api.patch(`/current-affairs/${id}`, payload), remove: (id: string) => api.delete(`/current-affairs/${id}`),
};
