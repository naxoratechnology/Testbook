import axios from 'axios';
import * as yup from 'yup';

export type CourseStatus = 'draft' | 'published' | 'unpublished';
export type CourseAccess = 'free' | 'paid';

export interface CourseLecture {
  _id: string; title: string; description: string; url: string;
  duration?: string; isPreview: boolean; pdfUrl?: string;
}
export interface AdminCourse {
  _id: string; title: string; description: string; exam: string; category: string;
  instructor: string; thumbnail: string; access: CourseAccess; price: number;
  status: CourseStatus; lectures: CourseLecture[]; createdAt: string;
  enrolled?: boolean;
}
export interface CoursePayload {
  title: string; description: string; exam: string; category: string;
  instructor: string; thumbnail: string; access: CourseAccess; price: number;
  status: CourseStatus; lectures?: CourseLecture[];
}
export interface LecturePayload { title: string; description: string; video: File; pdf?: File | null }

export const courseSchema = yup.object({
  title: yup.string().trim().required('Course name is required.'),
  description: yup.string().trim().required('Description is required.'),
  exam: yup.string().trim().required('Exam is required.'),
  category: yup.string().trim().required('Category is required.'),
  instructor: yup.string().trim().required('Instructor is required.'),
  thumbnail: yup.string().trim().url('Enter a valid thumbnail URL.').required('Thumbnail is required.'),
  access: yup.mixed<CourseAccess>().oneOf(['free', 'paid']).required(),
  price: yup.number().min(0).when('access', { is: 'paid', then: (schema) => schema.moreThan(0, 'Price must be greater than zero.') }),
  status: yup.mixed<CourseStatus>().oneOf(['draft', 'published', 'unpublished']).required(),
});

export const coursesApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

export const coursesApiService = {
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
    data.append('title', payload.title); data.append('description', payload.description);
    data.append('video', payload.video, payload.video.name);
    if (payload.pdf) data.append('pdf', payload.pdf, payload.pdf.name);
    return coursesApi.post(`/courses/${courseId}/lectures`, data);
  },
  removeLecture: (courseId: string, lectureId: string) => coursesApi.delete(`/courses/${courseId}/lectures/${lectureId}`),
};
