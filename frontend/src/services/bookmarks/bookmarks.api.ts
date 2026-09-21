import axios from 'axios';

export type QuestionSource = 'test-series' | 'current-affairs' | 'previous-paper';
export interface BookmarkReference { source: QuestionSource; sourceId: string; testId?: string | null; questionId: string }
export interface SavedQuestion extends BookmarkReference { _id: string; user: string; title: string; question: { text: string; options: string[]; correctAnswer?: number; explanation?: string; marks: number; negativeMarks: number }; createdAt: string }
export const bookmarkKey = (ref: BookmarkReference) => `${ref.source}:${ref.sourceId}:${ref.testId || ''}:${ref.questionId}`;
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });
export const bookmarksApiService = {
  list: () => api.get('/bookmarks'),
  save: (ref: BookmarkReference) => api.post('/bookmarks', ref),
  remove: (id: string) => api.delete(`/bookmarks/${id}`),
};
