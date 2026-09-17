import axios from 'axios';
import type { BookmarkReference, QuestionSource } from '../bookmarks/bookmarks.api';
export type ReviewReference = Omit<BookmarkReference, 'questionId'>;
export interface AttemptSummary { _id: string; source: QuestionSource; sourceId: string; testId: string | null; submittedAt: string }
export interface ReviewResult { _id: string; title: string; answers: Record<string, number | null>; questions: { _id: string; text: string; options: string[]; correctAnswer: number; explanation: string; marks?: number; negativeMarks?: number }[] }
export interface ReportPayload extends BookmarkReference { reason: 'wrong-answer' | 'question-error' | 'translation' | 'other'; details: string }
export const reviewKey = (ref: ReviewReference) => `${ref.source}:${ref.sourceId}:${ref.testId || ''}`;
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });
export interface AdminQuestionReport extends ReportPayload { _id: string; title: string; questionText: string; user: { name: string; email: string } | null; status: 'pending' | 'resolved'; createdAt: string }
export const questionReviewApiService = {
  reports: () => api.get('/question-review/reports'),
  updateReportStatus: (id: string, status: 'pending' | 'resolved') => api.patch(`/question-review/reports/${id}`, { status }),
  attempts: (source: QuestionSource, sourceId?: string) => api.get('/question-review/attempts', { params: { source, sourceId } }),
  solution: (reference: ReviewReference) => api.get('/question-review/solution', { params: reference }),
  report: (payload: ReportPayload) => api.post('/question-review/reports', payload),
};
