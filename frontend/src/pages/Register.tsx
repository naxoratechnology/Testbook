import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell } from '../components/auth/AuthShell';
import { Button, Field, Input } from '../components/ui/Primitives';
import { PasswordInput } from '../components/ui/PasswordInput';
import { registerSchema } from '../services/auth/auth.api';
import { fieldErrors } from '../services/auth/auth.validation';

export function Register() {
  const { register, verifyRegistrationOtp, resendRegistrationOtp, uploadIdentityDocument } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', targetExam: '' });
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [otp, setOtp] = useState(''); const [document, setDocument] = useState<File | null>(null); const [message, setMessage] = useState('');
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
    if (!document) { setError('Upload an identity document to continue.'); return; }
    if (document.size > 8 * 1024 * 1024) { setError('Identity document must be 8 MB or smaller.'); return; }
    let values;
    try { values = await registerSchema.validate(form, { abortEarly: false }); setErrors({}); }
    catch (failure) { setErrors(fieldErrors(failure)); return; }
    setLoading(true);
    try { await register(values); setStep('otp'); setMessage(`We sent a 6-digit code to ${values.email}.`); }
    catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
    finally { setLoading(false); }
  };
  const verifyOtp = async (event: React.FormEvent) => { event.preventDefault(); setError(''); if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit OTP.'); return; } if (!document) { setError('Identity document is missing. Please restart registration.'); return; } setLoading(true); try { await verifyRegistrationOtp(otp); await uploadIdentityDocument(document); navigate('/dashboard'); } catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); } finally { setLoading(false); } };
  if (step === 'otp') return <AuthShell title="Verify your email" subtitle="Enter the OTP to complete registration and submit your identity document."><form onSubmit={verifyOtp} className="space-y-4"><p className="rounded-xl bg-orange-50 px-3 py-2.5 text-[13px] text-orange-700">{message}</p><Field label="Verification code"><Input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit OTP" /></Field><p className="text-xs text-ink-muted">After verification, your selected identity document will be submitted for admin approval.</p>{error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] text-red-600">{error}</p>}<Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? 'Completing registration...' : 'Verify & submit document'}</Button><button type="button" className="w-full text-sm font-semibold text-brand-700" onClick={async () => { setError(''); try { await resendRegistrationOtp(); setMessage('A new OTP has been sent.'); } catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); } }}>Resend OTP</button></form></AuthShell>;
  return <AuthShell title="Create your account" subtitle="Start your preparation with Chandrabhaga Academy." footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Login</Link></>}>
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Full name"><Input value={form.name} onChange={set('name')} onBlur={() => void validateField('name')} placeholder="Aarav Sharma" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'register-name-error' : undefined} />{errors.name && <span id="register-name-error" role="alert" className="mt-1 block text-xs text-red-600">{errors.name}</span>}</Field>
      <Field label="Email"><Input value={form.email} onChange={set('email')} onBlur={() => void validateField('email')} placeholder="aarav@example.com" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} />{errors.email && <span id="register-email-error" role="alert" className="mt-1 block text-xs text-red-600">{errors.email}</span>}</Field>
      <Field label="Mobile"><Input value={form.mobile} onChange={set('mobile')} onBlur={() => void validateField('mobile')} placeholder="9876543210" autoComplete="tel" aria-invalid={Boolean(errors.mobile)} aria-describedby={errors.mobile ? 'register-mobile-error' : undefined} />{errors.mobile && <span id="register-mobile-error" role="alert" className="mt-1 block text-xs text-red-600">{errors.mobile}</span>}</Field>
      <Field label="Password"><PasswordInput value={form.password} onChange={set('password')} onBlur={() => void validateField('password')} placeholder="Minimum 8 characters" autoComplete="new-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : undefined} />{errors.password && <span id="register-password-error" role="alert" className="mt-1 block text-xs text-red-600">{errors.password}</span>}</Field>
      <Field label="Target exam"><Input value={form.targetExam} onChange={set('targetExam')} onBlur={() => void validateField('targetExam')} placeholder="e.g. SSC CGL, JKSSB, UPSC CSE" autoComplete="off" aria-invalid={Boolean(errors.targetExam)} aria-describedby={errors.targetExam ? 'register-exam-error' : undefined} />{errors.targetExam && <span id="register-exam-error" role="alert" className="mt-1 block text-xs text-red-600">{errors.targetExam}</span>}</Field>
      <Field label="Identity document"><Input type="file" required accept=".pdf,image/jpeg,image/png,image/webp" onChange={(event) => { setDocument(event.target.files?.[0] || null); setError(''); }} /><span className="mt-1 block text-xs text-ink-muted">Government-issued ID in JPG, PNG, WebP, or PDF format, up to 8 MB. It will be sent for admin approval after OTP verification.</span></Field>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</Button>
    </form>
  </AuthShell>;
}
