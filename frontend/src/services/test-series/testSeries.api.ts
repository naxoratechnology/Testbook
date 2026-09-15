import axios from 'axios';
import * as yup from 'yup';

export type SeriesStatus = 'draft' | 'published' | 'unpublished';
export type SeriesKind = 'full' | 'sectional' | 'current-affairs' | 'previous-year';
export interface SeriesQuestion { _id?: string; text: string; options: string[]; correctAnswer: number; explanation: string; marks: number; negativeMarks: number }
export interface PublicSeriesQuestion extends Omit<SeriesQuestion, 'correctAnswer' | 'explanation'> { _id: string; correctAnswer?: number; explanation?: string }
export interface PublicSeriesTest extends Omit<SeriesTest, 'questions'> { questions: PublicSeriesQuestion[] }
export interface PublicTestSeries extends Omit<AdminTestSeries, 'tests'> { purchased: boolean; tests: PublicSeriesTest[] }
export interface AttemptResult { _id: string; series: string; test: string; testTitle: string; answers: Record<string, number>; score: number; correct: number; incorrect: number; unanswered: number; accuracy: number; totalMarks: number; submittedAt: string; questions: SeriesQuestion[] }
export interface SeriesTest { _id: string; title: string; duration: number; questions: SeriesQuestion[]; status: SeriesStatus; createdAt: string }
export interface AdminTestSeries { _id: string; title: string; description: string; exam: string; kind: SeriesKind; access: 'free' | 'paid'; price: number; difficulty: 'Easy' | 'Moderate' | 'Hard'; languages: string; tests: SeriesTest[]; status: SeriesStatus; createdAt: string }
export interface SeriesPayload { title: string; description: string; exam: string; kind: SeriesKind; access: 'free' | 'paid'; price: number; difficulty: 'Easy' | 'Moderate' | 'Hard'; languages: string; status: SeriesStatus }
export interface TestPayload { title: string; duration: number; questions: SeriesQuestion[]; status: SeriesStatus }

export const seriesSchema = yup.object({
  title: yup.string().trim().required('Series name is required.'), description: yup.string().trim().required('Description is required.'), exam: yup.string().trim().required('Exam is required.'),
  kind: yup.mixed<SeriesKind>().oneOf(['full', 'sectional', 'current-affairs', 'previous-year']).required(), access: yup.mixed<'free' | 'paid'>().oneOf(['free', 'paid']).required(),
  price: yup.number().min(0).when('access', { is: 'paid', then: (schema) => schema.moreThan(0, 'Price must be greater than zero.') }),
  difficulty: yup.mixed<'Easy' | 'Moderate' | 'Hard'>().oneOf(['Easy', 'Moderate', 'Hard']).required(), languages: yup.string().required(), status: yup.mixed<SeriesStatus>().oneOf(['draft', 'published', 'unpublished']).required(),
});
export const testSchema = yup.object({ title: yup.string().trim().required('Test name is required.'), duration: yup.number().integer().min(1).required(), questions: yup.array().min(1, 'Add at least one question.').required(), status: yup.mixed<SeriesStatus>().oneOf(['draft', 'published', 'unpublished']).required() });

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1', withCredentials: true });
export const testSeriesApiService = {
  listPublic: (params?: { exam?: string; access?: string }) => api.get('/test-series', { params }), getPublic: (id: string) => api.get(`/test-series/${id}`),
  checkout: (id: string) => api.post(`/test-series/${id}/checkout`),
  verifyCheckout: (id: string, payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => api.post(`/test-series/${id}/checkout/verify`, payload),
  purchase: (id: string) => api.post(`/test-series/${id}/purchase`), attempt: (seriesId: string, testId: string, answers: Record<string, number | null>) => api.post(`/test-series/${seriesId}/tests/${testId}/attempts`, { answers }),
  results: (id: string) => api.get(`/test-series/${id}/results`),
  listAdmin: () => api.get('/test-series/admin'), getAdmin: (id: string) => api.get(`/test-series/admin/${id}`),
  create: (payload: SeriesPayload) => api.post('/test-series', payload), update: (id: string, payload: SeriesPayload) => api.patch(`/test-series/${id}`, payload),
  remove: (id: string) => api.delete(`/test-series/${id}`), addTest: (id: string, payload: TestPayload) => api.post(`/test-series/${id}/tests`, payload),
};
