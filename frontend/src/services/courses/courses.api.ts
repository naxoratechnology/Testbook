import axios from 'axios';
import * as yup from 'yup';

export type CourseStatus = 'draft' | 'published' | 'unpublished';
export type CourseAccess = 'free' | 'paid';

export interface CourseLecture {
  _id: string; title: string; description: string; url: string; subject?: string;
  videoSource?: 'upload' | 'youtube'; duration?: string; isPreview: boolean; pdfUrl?: string;
}
export interface AdminCourse {
  _id: string; title: string; description: string; exam: string; category: string;
  instructor: string; thumbnail: string; access: CourseAccess; price: number;
  subjects?: string[]; status: CourseStatus; lectures: CourseLecture[]; createdAt: string;
  enrolled?: boolean;
}
export interface CoursePayload {
  title: string; description: string; exam: string; category: string;
  instructor: string; thumbnail: string; access: CourseAccess; price: number;
  subjects?: string[]; status: CourseStatus; lectures?: CourseLecture[];
}
export interface LecturePayload { subject?: string; title: string; description: string; video?: File | null; youtubeUrl?: string; pdf?: File | null }

export const courseSchema = yup.object({
  title: yup.string().trim().required('Course name is required.'),
  description: yup.string().trim().required('Description is required.'),
  exam: yup.string().trim().required('Exam is required.'),
  category: yup.string().trim().required('Category is required.'),
  instructor: yup.string().trim().required('Instructor is required.'),
  thumbnail: yup.string().trim().url('Enter a valid thumbnail URL.').default(''),
  access: yup.mixed<CourseAccess>().oneOf(['free', 'paid']).required(),
  price: yup.number().min(0).when('access', { is: 'paid', then: (schema) => schema.moreThan(0, 'Price must be greater than zero.') }),
  subjects: yup.array().of(yup.string().trim().required('Subject name is required.').max(120)).test('unique-subjects', 'Subject names must be unique.', (subjects) => !subjects || new Set(subjects.map((subject) => subject?.toLowerCase())).size === subjects.length),
  status: yup.mixed<CourseStatus>().oneOf(['draft', 'published', 'unpublished']).required(),
});

export const coursesApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const coursesApiService = {
  removeThumbnail: (id: string) => coursesApi.delete(`/courses/${id}/thumbnail`),
  uploadThumbnail: (id: string, file: File) => { const data = new FormData(); data.append('thumbnail', file); return coursesApi.post(`/courses/${id}/thumbnail`, data); },
  listPublic: (params?: { search?: string; exam?: string; category?: string; access?: string }) => coursesApi.get('/courses', { params }),
  getPublic: (id: string) => coursesApi.get(`/courses/${id}`),
  checkout: (id: string) => coursesApi.post(`/courses/${id}/checkout`),
  verifyCheckout: (id: string, payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => coursesApi.post(`/courses/${id}/checkout/verify`, payload),
  listAdmin: (search = '') => coursesApi.get('/courses/admin', { params: search ? { search } : undefined }),
  get: (id: string) => coursesApi.get(`/courses/admin/${id}`),
  create: (payload: CoursePayload) => coursesApi.post('/courses', payload),
  update: (id: string, payload: CoursePayload) => coursesApi.patch(`/courses/${id}`, payload),
  remove: (id: string) => coursesApi.delete(`/courses/${id}`),
  addLecture: (courseId: string, payload: LecturePayload) => {
    const data = new FormData();
    if (payload.subject) data.append('subject', payload.subject);
    data.append('title', payload.title); data.append('description', payload.description);
    if (Boolean(payload.video) === Boolean(payload.youtubeUrl?.trim())) throw new Error('Provide an uploaded video or a YouTube URL, not both.');
    if (payload.video) data.append('video', payload.video, payload.video.name);
    if (payload.youtubeUrl?.trim()) data.append('youtubeUrl', payload.youtubeUrl.trim());
    if (payload.pdf) data.append('pdf', payload.pdf, payload.pdf.name);
    return coursesApi.post(`/courses/${courseId}/lectures`, data);
  },
  removeLecture: (courseId: string, lectureId: string) => coursesApi.delete(`/courses/${courseId}/lectures/${lectureId}`),
};
