import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell } from '../components/auth/AuthShell';
import { Button, Field, Input } from '../components/ui/Primitives';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password.trim()) return setError('Enter your email/mobile and password.');
    setError(''); setLoading(true);
    login(identifier, password).then((role) => navigate(role === 'admin' ? '/admin/dashboard' : '/dashboard')).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  };
  return <AuthShell title="Welcome back" subtitle="Log in to continue your preparation where you left off." footer={<>New to Chandrabhaga Academy? <Link to="/register" className="font-semibold text-brand-700 hover:underline">Create an account</Link></>}>
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Email or mobile"><Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="aarav@example.com" autoComplete="username" /></Field>
      <Field label="Password"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" /></Field>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</Button>
    </form>
  </AuthShell>;
}
