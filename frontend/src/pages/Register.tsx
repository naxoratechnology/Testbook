import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell } from '../components/auth/AuthShell';
import { Button, Field, Input } from '../components/ui/Primitives';
import { PasswordInput } from '../components/ui/PasswordInput';
import { registerSchema } from '../services/auth/auth.api';
import { fieldErrors } from '../services/auth/auth.validation';

export function Register() {
  const { user, register, verifyRegistrationOtp, resendRegistrationOtp, uploadIdentityDocument } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', targetExam: '' });
  const [accountCreated, setAccountCreated] = useState(false);
  const [otp, setOtp] = useState('');
  const [identityDocument, setIdentityDocument] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || user.role !== 'student') return;
    if (user.emailVerified && user.identityDocumentName) { navigate('/dashboard', { replace: true }); return; }
    setAccountCreated(true);
    setForm((current) => ({ ...current, name: user.name, email: user.email, mobile: user.mobile, targetExam: user.targetExam }));
    setMessage(user.emailVerified ? 'Email verified. Select your identity document and complete registration.' : `Enter the verification code sent to ${user.email}.`);
  }, [user, navigate]);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: '' }));
    setError('');
  };
  const validateField = async (key: keyof typeof form) => {
    if (accountCreated) return;
    try { await registerSchema.validateAt(key, form); setErrors((current) => ({ ...current, [key]: '' })); }
    catch (failure) { setErrors((current) => ({ ...current, [key]: fieldErrors(failure)[key] || '' })); }
  };
  const validateDocument = () => {
    if (!identityDocument) { setError('Identity document is required to complete registration.'); return false; }
    if (identityDocument.size > 8 * 1024 * 1024) { setError('Identity document must be 8 MB or smaller.'); return false; }
    return true;
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!accountCreated) {
      let values;
      try { values = await registerSchema.validate(form, { abortEarly: false }); setErrors({}); }
      catch (failure) { setErrors(fieldErrors(failure)); return; }
      setLoading(true);
      try {
        await register(values);
        setAccountCreated(true);
        setMessage(`We sent a 6-digit verification code to ${values.email}. Enter it below to complete registration.`);
      } catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
      finally { setLoading(false); }
      return;
    }
    if (!user?.emailVerified && !/^\d{6}$/.test(otp)) { setError('Enter the 6-digit OTP.'); return; }
    if (user?.emailVerified && !validateDocument()) return;
    setLoading(true);
    try {
      if (!user?.emailVerified) {
        await verifyRegistrationOtp(otp);
        setMessage('Email verified. Upload your required identity document to complete registration.');
      } else {
        await uploadIdentityDocument(identityDocument!);
        navigate('/dashboard', { replace: true });
      }
    } catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
    finally { setLoading(false); }
  };

  return <AuthShell title="Create your account" subtitle="Enter your details, verify your email and upload your identity document." footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Login</Link></>}>
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Full name"><Input disabled={accountCreated} value={form.name} onChange={set('name')} onBlur={() => void validateField('name')} placeholder="Aarav Sharma" autoComplete="name" aria-invalid={Boolean(errors.name)}/>{errors.name && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.name}</span>}</Field>
      <Field label="Email"><Input disabled={accountCreated} value={form.email} onChange={set('email')} onBlur={() => void validateField('email')} placeholder="aarav@example.com" autoComplete="email" aria-invalid={Boolean(errors.email)}/>{errors.email && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.email}</span>}</Field>
      <Field label="Mobile"><Input disabled={accountCreated} value={form.mobile} onChange={set('mobile')} onBlur={() => void validateField('mobile')} placeholder="9876543210" autoComplete="tel" aria-invalid={Boolean(errors.mobile)}/>{errors.mobile && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.mobile}</span>}</Field>
      <Field label="Password"><PasswordInput disabled={accountCreated} value={form.password} onChange={set('password')} onBlur={() => void validateField('password')} placeholder="Minimum 8 characters" autoComplete="new-password" aria-invalid={Boolean(errors.password)}/>{errors.password && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.password}</span>}</Field>
      <Field label="Target exam"><Input disabled={accountCreated} value={form.targetExam} onChange={set('targetExam')} onBlur={() => void validateField('targetExam')} placeholder="e.g. SSC CGL, JKSSB, UPSC CSE" autoComplete="off" aria-invalid={Boolean(errors.targetExam)}/>{errors.targetExam && <span role="alert" className="mt-1 block text-xs text-red-600">{errors.targetExam}</span>}</Field>
      <Field label="Email verification code"><Input disabled={!accountCreated || Boolean(user?.emailVerified)} value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }} inputMode="numeric" autoComplete="one-time-code" placeholder={accountCreated ? '6-digit OTP' : 'OTP will be sent after submitting'}/>{accountCreated && !user?.emailVerified && <button type="button" className="mt-2 text-xs font-semibold text-brand-700" onClick={async () => { setError(''); try { await resendRegistrationOtp(); setMessage('A new OTP has been sent.'); } catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); } }}>Resend OTP</button>}{user?.emailVerified && <span className="mt-1 block text-xs font-medium text-emerald-600">Email verified</span>}</Field>
      {user?.emailVerified && <><Field label="Identity document"><Input type="file" required accept=".pdf,image/jpeg,image/png,image/webp" onChange={(event) => { setIdentityDocument(event.target.files?.[0] || null); setError(''); }}/><span className="mt-1 block text-xs text-ink-muted">Required government-issued ID in JPG, PNG, WebP, or PDF format, up to 8 MB.</span></Field><p className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">The details and document submitted by me are correct. If any information is found incorrect, the administrator may deactivate my account at any time.</p></>}
      {message && <p role="status" className="rounded-xl bg-orange-50 px-3 py-2.5 text-[13px] text-orange-700">{message}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? 'Please wait…' : accountCreated ? user?.emailVerified ? 'Upload document & complete registration' : 'Verify OTP & complete registration' : 'Send verification OTP'}</Button>
    </form>
  </AuthShell>;
}
