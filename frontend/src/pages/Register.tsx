import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell } from '../components/auth/AuthShell';
import { Button, Field, Input, Select } from '../components/ui/Primitives';

const targetExams = ['SSC CGL', 'SSC CHSL', 'IBPS PO', 'IBPS Clerk', 'RRB NTPC', 'UPSC CSE', 'CTET', 'State PSC'];

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', targetExam: 'SSC CGL' });
  const [error, setError] = useState('');

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
  setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill in your name, email/mobile and password.');
      return;
    }
    register(form);
    navigate('/dashboard');
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free current affairs, free sectional tests and a free foundation course to begin."
      footer={
      <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Login
          </Link>
        </>
      }>
      
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name">
          <Input value={form.name} onChange={set('name')} placeholder="Aarav Sharma" autoComplete="name" />
        </Field>
        <Field label="Email or mobile">
          <Input value={form.email} onChange={set('email')} placeholder="aarav@example.com" autoComplete="email" />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder="Minimum 8 characters"
            autoComplete="new-password" />
          
        </Field>
        <Field label="Target exam">
          <Select value={form.targetExam} onChange={set('targetExam')}>
            {targetExams.map((exam) =>
            <option key={exam}>{exam}</option>
            )}
          </Select>
        </Field>

        {error &&
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] text-red-600">
            {error}
          </p>
        }

        <Button type="submit" size="lg" className="w-full">
          Create account
        </Button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-line" />
          <span className="text-xs text-ink-muted">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => {
            register({ name: 'Aarav Sharma', email: 'aarav@example.com', targetExam: 'SSC CGL' });
            navigate('/dashboard');
          }}>
          
          Continue with Google
        </Button>
      </form>
    </AuthShell>);

}