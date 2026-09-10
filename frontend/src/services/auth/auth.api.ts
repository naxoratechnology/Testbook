import axios from 'axios';
import * as yup from 'yup';

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

export const registerSchema = yup.object({
  name: yup.string().trim().min(2).max(80).required('Name is required.'),
  email: yup.string().trim().email('Enter a valid email.').required('Email is required.'),
  mobile: yup.string().trim().matches(/^\+?[0-9\s-]{10,20}$/, 'Enter a valid mobile number.').required('Mobile is required.'),
  password: yup.string().min(8).max(72).required('Password is required.'),
  targetExam: yup.string().required('Target exam is required.'),
});

export const loginSchema = yup.object({
  identifier: yup.string().trim().required('Email or mobile is required.'),
  password: yup.string().required('Password is required.'),
});

export type LoginPayload = yup.InferType<typeof loginSchema>;
export type RegisterPayload = yup.InferType<typeof registerSchema>;

export const authApiService = {
  login: (data: LoginPayload) => authApi.post('/auth/login', data),
  register: (data: RegisterPayload) => authApi.post('/auth/register', data),
  logout: () => authApi.post('/auth/logout'),
};
