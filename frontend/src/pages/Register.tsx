import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell } from '../components/auth/AuthShell';
import { Button, Field, Input, Select } from '../components/ui/Primitives';

const exams = ['SSC CGL', 'SSC CHSL', 'IBPS PO', 'IBPS Clerk', 'RRB NTPC', 'UPSC CSE', 'CTET', 'State PSC'];
export function Register() {
  const { register } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', targetExam: 'SSC CGL' });
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = (event: React.FormEvent) => { event.preventDefault(); setError(''); setLoading(true); register(form).then((role) => navigate(role === 'admin' ? '/admin/dashboard' : '/dashboard')).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)); };
  return <AuthShell title="Create your account" subtitle="Start your preparation with Chandrabhaga Academy." footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Login</Link></>}>
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Full name"><Input value={form.name} onChange={set('name')} placeholder="Aarav Sharma" autoComplete="name" /></Field>
      <Field label="Email"><Input value={form.email} onChange={set('email')} placeholder="aarav@example.com" autoComplete="email" /></Field>
      <Field label="Mobile"><Input value={form.mobile} onChange={set('mobile')} placeholder="9876543210" autoComplete="tel" /></Field>
      <Field label="Password"><Input type="password" value={form.password} onChange={set('password')} placeholder="Minimum 8 characters" autoComplete="new-password" /></Field>
      <Field label="Target exam"><Select value={form.targetExam} onChange={set('targetExam')}>{exams.map((exam) => <option key={exam}>{exam}</option>)}</Select></Field>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</Button>
    </form>
  </AuthShell>;
}
