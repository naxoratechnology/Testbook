import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell } from '../components/auth/AuthShell';
import { Button, Field, Input, Select } from '../components/ui/Primitives';
import { PasswordInput } from '../components/ui/PasswordInput';
import { registerSchema } from '../services/auth/auth.api';
import { fieldErrors } from '../services/auth/auth.validation';

const exams = ['SSC CGL', 'SSC CHSL', 'IBPS PO', 'IBPS Clerk', 'RRB NTPC', 'UPSC CSE', 'CTET', 'State PSC'];
export function Register() {
  const { register } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', targetExam: 'SSC CGL' });
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: '' }));
    setError('');
  };
  const validateField = async (key: keyof typeof form) => {
    try { await registerSchema.validateAt(key, form); setErrors((current) => ({ ...current, [key]: '' })); }
    catch (failure) { setErrors((current) => ({ ...current, [key]: fieldErrors(failure)[key] || '' })); }
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    let values;
    try { values = await registerSchema.validate(form, { abortEarly: false }); setErrors({}); }
    catch (failure) { setErrors(fieldErrors(failure)); return; }
    setLoading(true);
    try { const role = await register(values); navigate(role === 'admin' ? '/admin/dashboard' : '/dashboard'); }
    catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
    finally { setLoading(false); }
  };
  return <AuthShell title="Create your account" subtitle="Start your preparation with Chandrabhaga Academy." footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Login</Link></>}>
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Full name"><Input value={form.name} onChange={set('name')} onBlur={() => void validateField('name')} placeholder="Aarav Sharma" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'register-name-error' : undefined} />{errors.name && <span id="register-name-error" role="alert" className="mt-1 block text-xs text-red-600">{errors.name}</span>}</Field>
      <Field label="Email"><Input value={form.email} onChange={set('email')} onBlur={() => void validateField('email')} placeholder="aarav@example.com" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} />{errors.email && <span id="register-email-error" role="alert" className="mt-1 block text-xs text-red-600">{errors.email}</span>}</Field>
      <Field label="Mobile"><Input value={form.mobile} onChange={set('mobile')} onBlur={() => void validateField('mobile')} placeholder="9876543210" autoComplete="tel" aria-invalid={Boolean(errors.mobile)} aria-describedby={errors.mobile ? 'register-mobile-error' : undefined} />{errors.mobile && <span id="register-mobile-error" role="alert" className="mt-1 block text-xs text-red-600">{errors.mobile}</span>}</Field>
      <Field label="Password"><PasswordInput value={form.password} onChange={set('password')} onBlur={() => void validateField('password')} placeholder="Minimum 8 characters" autoComplete="new-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : undefined} />{errors.password && <span id="register-password-error" role="alert" className="mt-1 block text-xs text-red-600">{errors.password}</span>}</Field>
      <Field label="Target exam"><Select value={form.targetExam} onChange={set('targetExam')} onBlur={() => void validateField('targetExam')} aria-invalid={Boolean(errors.targetExam)} aria-describedby={errors.targetExam ? 'register-exam-error' : undefined}>{exams.map((exam) => <option key={exam}>{exam}</option>)}</Select>{errors.targetExam && <span id="register-exam-error" role="alert" className="mt-1 block text-xs text-red-600">{errors.targetExam}</span>}</Field>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</Button>
    </form>
  </AuthShell>;
}
