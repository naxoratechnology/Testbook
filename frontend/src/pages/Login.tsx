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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Enter your email/mobile and password to continue.');
      return;
    }
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      const role = login(identifier, password);
      setLoading(false);
      navigate(role === 'admin' ? '/admin/dashboard' : '/dashboard');
    }, 450);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your preparation where you left off."
      footer={
      <>
          New to PrepArena?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Create an account
          </Link>
        </>
      }>
      
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email or mobile">
          <Input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="aarav@example.com"
            autoComplete="username" />
          
        </Field>
        <Field label="Password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password" />
          
        </Field>

        {error &&
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] text-red-600">
            {error}
          </p>
        }

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
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
            login('aarav@example.com', 'google');
            navigate('/dashboard');
          }}>
          
          Continue with Google
        </Button>

        <p className="rounded-xl border border-line bg-canvas px-3.5 py-3 text-xs leading-relaxed text-ink-soft">
          <span className="font-semibold text-ink">Demo access:</span> any email logs in as a student. Use an
          email containing <span className="font-medium text-ink">admin</span> (e.g. admin@preparena.com) to
          land on the admin dashboard.
        </p>
      </form>
    </AuthShell>);

}