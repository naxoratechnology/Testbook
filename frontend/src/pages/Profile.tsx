import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookmarkIcon, BellIcon, LockIcon, LogOutIcon, MailIcon, PhoneIcon, TargetIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, Button, Field, Input, btn } from '../components/ui/Primitives';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Avatar } from '../components/layout/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../services/auth/auth.slice';
import type { AppDispatch, RootState } from '../store';

export function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dailyCA, setDailyCA] = useState(true);
  const [saved, setSaved] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
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
        <Panel>
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

        <div className="space-y-5">
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

          <Panel>
            <div className="flex items-center gap-2.5">
              <BellIcon className="h-4 w-4 text-ink-muted" />
              <h2 className="text-base font-semibold text-ink">Notifications</h2>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {[
              ['Email alerts', 'New courses, test series and announcements', emailAlerts, setEmailAlerts],
              ['Daily current affairs', 'A reminder when the daily test goes live', dailyCA, setDailyCA]].
              map(([label, desc, value, setter]) =>
              <li key={label as string} className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <p className="text-[13.5px] font-medium text-ink">{label as string}</p>
                    <p className="text-xs text-ink-muted">{desc as string}</p>
                  </div>
                  <button
                  type="button"
                  role="switch"
                  aria-checked={value as boolean}
                  aria-label={label as string}
                  onClick={() => (setter as (v: boolean) => void)(!(value as boolean))}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-smooth ${
                  value ? 'bg-brand-600' : 'bg-slate-200'}`
                  }>
                  
                    <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left] duration-150 ease-smooth ${
                    value ? 'left-[22px]' : 'left-0.5'}`
                    } />
                  
                  </button>
                </li>
              )}
            </ul>
          </Panel>
        </div>
      </div>
    </PageShell>);

}
