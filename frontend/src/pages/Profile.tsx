import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookmarkIcon, LockIcon, LogOutIcon, MailIcon, PhoneIcon, TargetIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, Button, Field, Input, btn } from '../components/ui/Primitives';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Avatar } from '../components/layout/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword, updateProfile } from '../services/auth/auth.slice';
import type { AppDispatch, RootState } from '../store';

export function Profile() {
  const { user, logout, verifyRegistrationOtp, resendRegistrationOtp, uploadIdentityDocument } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [verificationOtp, setVerificationOtp] = useState(''); const [identityFile, setIdentityFile] = useState<File | null>(null); const [verificationMessage, setVerificationMessage] = useState(''); const [verificationError, setVerificationError] = useState('');
  const [profile, setProfile] = useState({ name: '', email: '', mobile: '', targetExam: '' }); const [profileMessage, setProfileMessage] = useState(''); const [profileError, setProfileError] = useState('');
  useEffect(() => { if (user) setProfile({ name: user.name, email: user.email, mobile: user.mobile, targetExam: user.targetExam }); }, [user]);
  const submitProfile = async (event: React.FormEvent) => { event.preventDefault(); setProfileMessage(''); setProfileError(''); try { const oldEmail = user?.email; await dispatch(updateProfile(profile)).unwrap(); setProfileMessage(oldEmail !== profile.email ? 'Profile updated. Verify the OTP sent to your new email.' : 'Profile updated successfully.'); } catch (failure) { setProfileError(String(failure)); } };
  const submitPassword = async (event: React.FormEvent) => { event.preventDefault(); setSaved(false); setPasswordError(''); try { await dispatch(changePassword(passwords)).unwrap(); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); setSaved(true); } catch (failure) { setPasswordError(String(failure)); } };

  if (!user) {
    return (
      <PageShell title="You're not logged in" subtitle="Log in to see your profile and progress.">
        <Link to="/login" className={btn('primary', 'md')}>
          Login
        </Link>
      </PageShell>);

  }

  return (
    <PageShell title="Profile" subtitle="Your account details and preferences.">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr] lg:items-start">
        <div className="space-y-5"><Panel>
          <div className="flex items-center gap-4">
            <Avatar name={user.name} src={user.avatar} size={64} />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-ink">{user.name}</h2>
              <Badge tone="brand" className="mt-1.5">
                {user.role === 'admin' ? 'Administrator' : 'Student'}
              </Badge>
            </div>
          </div>
          <dl className="mt-6 space-y-3.5 border-t border-line pt-5 text-[13.5px]">
            {[
            [MailIcon, 'Email', user.email],
            [PhoneIcon, 'Mobile', user.mobile],
            [TargetIcon, 'Target exam', user.targetExam]].
            map(([Icon, label, value]) => {
              const IconComp = Icon as React.ElementType;
              return (
                <div key={label as string} className="flex items-center gap-3">
                  <IconComp className="h-4 w-4 shrink-0 text-ink-muted" />
                  <dt className="w-28 shrink-0 text-ink-muted">{label as string}</dt>
                  <dd className="min-w-0 flex-1 truncate font-medium text-ink">{value as string}</dd>
                </div>);

            })}
          </dl>
          <Link to="/saved-questions" className={btn('secondary', 'md', 'mt-6 w-full')}><BookmarkIcon className="h-4 w-4" /> Saved Questions</Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className={btn('danger', 'md', 'mt-6 w-full')}>
            
            <LogOutIcon className="h-4 w-4" /> Logout
          </button>
        </Panel>
        {user.role === 'student' && <Panel><h2 className="text-base font-semibold text-ink">Account verification</h2><p className="mt-1 text-sm text-ink-muted">Email and identity approval are required for new paid purchases.</p>{!user.emailVerified ? <div className="mt-4 space-y-3"><Field label="Email OTP"><Input value={verificationOtp} onChange={(e) => setVerificationOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="6-digit OTP"/></Field><div className="flex flex-wrap gap-2"><Button size="sm" onClick={async () => { setVerificationError(''); try { await verifyRegistrationOtp(verificationOtp); setVerificationMessage('Email verified.'); } catch (e) { setVerificationError(String(e)); } }}>Verify email</Button><Button size="sm" variant="secondary" onClick={async () => { try { await resendRegistrationOtp(); setVerificationMessage('OTP sent.'); } catch (e) { setVerificationError(String(e)); } }}>Send OTP</Button></div></div> : <div className="mt-4 space-y-3"><div className="flex flex-wrap gap-2"><Badge tone="green">Email verified</Badge><Badge tone={user.identityVerificationStatus === 'approved' ? 'green' : user.identityVerificationStatus === 'rejected' ? 'red' : 'amber'}>{user.identityVerificationStatus.replace('_', ' ')}</Badge></div>{user.identityDocumentName && <p className="break-all text-xs text-ink-muted">Current document: {user.identityDocumentName}</p>}{user.identityVerificationNote && <p className="text-sm text-red-600">Admin note: {user.identityVerificationNote}</p>}<Field label={user.identityDocumentName ? 'Replace identity document' : 'Identity document'}><Input type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={(e) => setIdentityFile(e.target.files?.[0] || null)}/></Field><Button size="sm" disabled={!identityFile} onClick={async () => { if (!identityFile) return; setVerificationError(''); try { await uploadIdentityDocument(identityFile); setIdentityFile(null); setVerificationMessage(user.identityDocumentName ? 'Document updated and submitted for admin review.' : 'Document submitted for admin review.'); } catch (e) { setVerificationError(String(e)); } }}>{user.identityDocumentName ? 'Update document' : 'Submit document'}</Button><p className="text-xs text-ink-muted">JPG, PNG, WebP or PDF, up to 8 MB. Updating the document sends it for admin approval again.</p></div>}{verificationMessage && <p className="mt-3 text-sm text-emerald-700">{verificationMessage}</p>}{verificationError && <p className="mt-3 text-sm text-red-600">{verificationError}</p>}</Panel>}</div>

        <div className="space-y-5">
          <Panel><h2 className="text-base font-semibold text-ink">Edit profile</h2><p className="mt-1 text-sm text-ink-muted">Update your personal and exam details.</p><form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={submitProfile}><Field label="Full name"><Input required minLength={2} maxLength={80} value={profile.name} onChange={(e) => setProfile((value) => ({ ...value, name: e.target.value }))}/></Field><Field label="Email"><Input required type="email" value={profile.email} onChange={(e) => setProfile((value) => ({ ...value, email: e.target.value }))}/></Field><Field label="Mobile"><Input required value={profile.mobile} onChange={(e) => setProfile((value) => ({ ...value, mobile: e.target.value }))}/></Field><Field label="Target exam"><Input required maxLength={100} value={profile.targetExam} onChange={(e) => setProfile((value) => ({ ...value, targetExam: e.target.value }))}/></Field><div className="flex items-center gap-3 sm:col-span-2"><Button type="submit" disabled={authLoading}>{authLoading ? 'Saving...' : 'Save profile'}</Button>{profileMessage && <span className="text-[13px] font-medium text-emerald-600">{profileMessage}</span>}</div>{profileError && <p className="text-[13px] text-red-600 sm:col-span-2">{profileError}</p>}</form></Panel>
          <Panel>
            <div className="flex items-center gap-2.5">
              <LockIcon className="h-4 w-4 text-ink-muted" />
              <h2 className="text-base font-semibold text-ink">Change password</h2>
            </div>
            <form
              className="mt-4 grid gap-4 sm:grid-cols-2"
              onSubmit={submitPassword}>
              
              <Field label="Current password" className="sm:col-span-2">
                <PasswordInput required value={passwords.currentPassword} onChange={(event) => setPasswords((value) => ({ ...value, currentPassword: event.target.value }))} placeholder="Current password" autoComplete="current-password" />
              </Field>
              <Field label="New password">
                <PasswordInput required minLength={8} value={passwords.newPassword} onChange={(event) => setPasswords((value) => ({ ...value, newPassword: event.target.value }))} placeholder="Minimum 8 characters" autoComplete="new-password" />
              </Field>
              <Field label="Confirm new password">
                <PasswordInput required minLength={8} value={passwords.confirmPassword} onChange={(event) => setPasswords((value) => ({ ...value, confirmPassword: event.target.value }))} placeholder="Re-enter password" autoComplete="new-password" />
              </Field>
              <div className="flex items-center gap-3 sm:col-span-2">
                <Button type="submit" disabled={authLoading}>{authLoading ? 'Updating...' : 'Update password'}</Button>
                {saved && <span className="text-[13px] font-medium text-emerald-600">Password updated</span>}
              </div>
              {passwordError && <p className="text-[13px] text-red-600 sm:col-span-2">{passwordError}</p>}
            </form>
          </Panel>
        </div>
      </div>
    </PageShell>);

}
