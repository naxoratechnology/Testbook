import axios from 'axios';
import * as yup from 'yup';

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const registerSchema = yup.object({
  name: yup.string().trim().min(2, 'Name must be at least 2 characters.').max(80, 'Name cannot exceed 80 characters.').required('Full name is required.'),
  email: yup.string().trim().email('Enter a valid email.').required('Email is required.'),
  mobile: yup.string().trim().required('Mobile number is required.').matches(/^\+?[0-9\s-]{10,20}$/, 'Enter a valid mobile number (10–20 digits).'),
  password: yup.string().required('Password is required.').min(8, 'Password must be at least 8 characters.').max(72, 'Password cannot exceed 72 characters.'),
  targetExam: yup.string().required('Target exam is required.'),
});

export const loginSchema = yup.object({
  identifier: yup.string().trim().required('Email or mobile is required.').test('email-or-mobile', 'Enter a valid email or mobile number.', (value) => !value || (value.includes('@') ? yup.string().email().isValidSync(value) : /^\+?[0-9\s-]{10,20}$/.test(value))),
  password: yup.string().required('Password is required.'),
});
export const changePasswordSchema = yup.object({ currentPassword: yup.string().required('Current password is required.'), newPassword: yup.string().min(8, 'Password must be at least 8 characters.').max(72).required('New password is required.'), confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords do not match.').required('Confirm your new password.') });

export type LoginPayload = yup.InferType<typeof loginSchema>;
export type RegisterPayload = yup.InferType<typeof registerSchema>;
export type ChangePasswordPayload = yup.InferType<typeof changePasswordSchema>;

export const authApiService = {
  me: () => authApi.get('/auth/me'),
  login: (data: LoginPayload) => authApi.post('/auth/login', data),
  register: (data: RegisterPayload) => authApi.post('/auth/register', data),
  refresh: () => authApi.post('/auth/refresh'),
  logout: () => authApi.post('/auth/logout'),
  changePassword: (data: Omit<ChangePasswordPayload, 'confirmPassword'>) => authApi.patch('/auth/password', data),
};
