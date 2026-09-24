import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../components/auth/AuthShell';
import { Button, Field, Input } from '../components/ui/Primitives';
import { PasswordInput } from '../components/ui/PasswordInput';
import { authApiService, forgotPasswordSchema, resetPasswordSchema } from '../services/auth/auth.api';
import { fieldErrors } from '../services/auth/auth.validation';

const messageOf = (error: unknown, fallback: string) => (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const [busy, setBusy] = useState(false); const [resendIn, setResendIn] = useState(0);
  useEffect(() => { if (!resendIn) return; const timer = window.setInterval(() => setResendIn(value => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, [resendIn > 0]);
  const set = (key: keyof typeof form, value: string) => { setForm(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: '' })); setError(''); };
  const sendOtp = async () => {
    setError(''); setMessage('');
    try { await forgotPasswordSchema.validate({ email: form.email }, { abortEarly: false }); setErrors({}); }
    catch (failure) { setErrors(fieldErrors(failure)); return; }
    setBusy(true);
    try { const response = await authApiService.forgotPassword(form.email.trim()); setStep('otp'); setResendIn(60); setMessage(response.data.message); }
    catch (failure) { setError(messageOf(failure, 'Unable to send OTP. Please try again.')); }
    finally { setBusy(false); }
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step === 'email') { await sendOtp(); return; }
    setError(''); setMessage('');
    try { await resetPasswordSchema.validate(form, { abortEarly: false }); setErrors({}); }
    catch (failure) { setErrors(fieldErrors(failure)); return; }
    setBusy(true);
    try { await authApiService.resetPassword({ email: form.email.trim(), otp: form.otp, newPassword: form.newPassword }); navigate('/login', { replace: true, state: { passwordReset: true } }); }
    catch (failure) { setError(messageOf(failure, 'Unable to reset password. Please try again.')); }
    finally { setBusy(false); }
  };
  return <AuthShell title={step === 'email' ? 'Forgot password?' : 'Check your email'} subtitle={step === 'email' ? 'Enter your registered email and we’ll send you a secure verification code.' : `Enter the 6-digit OTP sent to ${form.email}. It expires in 10 minutes.`} footer={<>Remember your password? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Back to login</Link></>}>
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Email address"><Input type="email" value={form.email} disabled={step === 'otp' || busy} onChange={(event) => set('email', event.target.value)} placeholder="you@example.com" autoComplete="email" />{errors.email && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.email}</span>}</Field>
      {step === 'otp' && <>
        <Field label="Verification code"><Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={form.otp} onChange={(event) => set('otp', event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit OTP" className="text-center text-lg font-semibold tracking-[0.35em]" />{errors.otp && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.otp}</span>}</Field>
        <Field label="New password"><PasswordInput value={form.newPassword} onChange={(event) => set('newPassword', event.target.value)} autoComplete="new-password" placeholder="Minimum 8 characters" />{errors.newPassword && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.newPassword}</span>}</Field>
        <Field label="Confirm new password"><PasswordInput value={form.confirmPassword} onChange={(event) => set('confirmPassword', event.target.value)} autoComplete="new-password" placeholder="Enter password again" />{errors.confirmPassword && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.confirmPassword}</span>}</Field>
      </>}
      {message && <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2.5 text-[13px] text-emerald-700">{message}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? 'Please wait…' : step === 'email' ? 'Send OTP' : 'Reset password'}</Button>
      {step === 'otp' && <div className="flex items-center justify-between gap-3 text-[13px]"><button type="button" className="font-medium text-ink-soft hover:text-ink" onClick={() => { setStep('email'); setMessage(''); setError(''); }}>Change email</button><button type="button" disabled={busy || resendIn > 0} className="font-semibold text-brand-700 disabled:text-ink-muted" onClick={() => void sendOtp()}>{resendIn ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}</button></div>}
    </form>
  </AuthShell>;
}
