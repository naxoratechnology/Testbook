import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell } from '../components/auth/AuthShell';
import { Button, Field, Input } from '../components/ui/Primitives';
import { PasswordInput } from '../components/ui/PasswordInput';
import { loginSchema } from '../services/auth/auth.api';
import { fieldErrors } from '../services/auth/auth.validation';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const update = (field: 'identifier' | 'password', value: string) => {
    if (field === 'identifier') setIdentifier(value); else setPassword(value);
    setErrors((current) => ({ ...current, [field]: '' }));
    setError('');
  };
  const validateField = async (field: 'identifier' | 'password') => {
    try { await loginSchema.validateAt(field, { identifier, password }); setErrors((current) => ({ ...current, [field]: '' })); }
    catch (failure) { setErrors((current) => ({ ...current, [field]: fieldErrors(failure)[field] || '' })); }
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try { await loginSchema.validate({ identifier, password }, { abortEarly: false }); setErrors({}); }
    catch (failure) { setErrors(fieldErrors(failure)); return; }
    setLoading(true);
    try { const role = await login(identifier.trim(), password); const redirect = new URLSearchParams(location.search).get('redirect'); navigate(role === 'admin' ? '/admin/dashboard' : redirect || '/dashboard'); }
    catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
    finally { setLoading(false); }
  };
  return <AuthShell title="Welcome back" subtitle="Log in to continue your preparation where you left off." footer={<>New to Chandrabhaga Academy? <Link to="/register" className="font-semibold text-brand-700 hover:underline">Create an account</Link></>}>
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Email or mobile"><Input value={identifier} onChange={(e) => update('identifier', e.target.value)} onBlur={() => void validateField('identifier')} placeholder="aarav@example.com" autoComplete="username" aria-invalid={Boolean(errors.identifier)} aria-describedby={errors.identifier ? 'login-identifier-error' : undefined} />{errors.identifier && <span id="login-identifier-error" role="alert" className="mt-1 block text-xs text-red-600">{errors.identifier}</span>}</Field>
      <Field label="Password"><PasswordInput value={password} onChange={(e) => update('password', e.target.value)} onBlur={() => void validateField('password')} placeholder="••••••••" autoComplete="current-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'login-password-error' : undefined} />{errors.password && <span id="login-password-error" role="alert" className="mt-1 block text-xs text-red-600">{errors.password}</span>}</Field>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</Button>
    </form>
  </AuthShell>;
}
