import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { BriefcaseBusinessIcon, Building2Icon, CalendarDaysIcon, MapPinIcon } from 'lucide-react';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, btn } from '../components/ui/Primitives';
import { fetchNotices } from '../services/notices/notices.slice';
import type { AppDispatch, RootState } from '../store';

export function NoticeDetail() {
  const { noticeId = '' } = useParams(); const dispatch = useDispatch<AppDispatch>(); const { items, loading, error } = useSelector((state: RootState) => state.notices);
  useEffect(() => { if (!items.length) dispatch(fetchNotices()); }, [dispatch, items.length]);
  const notice = items.find((item) => item._id === noticeId);
  if (loading && !notice) return <PageShell title="Notice Details"><p className="py-12 text-center text-sm text-ink-muted">Loading notice...</p></PageShell>;
  if (!notice) return <PageShell title="Notice not found"><p className="mb-5 text-sm text-red-600">{error || 'This notice is unavailable.'}</p><Link to="/notices" className={btn('primary', 'md')}>Back to Notices</Link></PageShell>;
  return <PageShell width="max-w-4xl"><nav className="mb-5 text-sm text-ink-muted"><Link to="/notices" className="hover:text-brand-700">Notices</Link><span className="mx-2">/</span><span>Details</span></nav><Panel><div className="flex flex-wrap items-center justify-between gap-3"><Badge tone={notice.type === 'vacancy' ? 'brand' : notice.type === 'job' ? 'violet' : 'slate'}>{notice.type === 'job' ? 'Job Post' : notice.type}</Badge><span className="text-xs text-ink-muted">Published {new Date(notice.createdAt).toLocaleDateString('en-IN')}</span></div><h1 className="mt-4 text-2xl font-bold leading-tight text-ink sm:text-3xl">{notice.title}</h1><div className="mt-5 grid gap-3 rounded-xl bg-canvas p-4 text-sm text-ink-soft sm:grid-cols-2">{notice.organization && <span className="flex items-center gap-2"><Building2Icon className="h-4 w-4 text-brand-600" />{notice.organization}</span>}{notice.location && <span className="flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-brand-600" />{notice.location}</span>}{notice.eligibility && <span className="flex items-start gap-2"><BriefcaseBusinessIcon className="mt-0.5 h-4 w-4 text-brand-600" />{notice.eligibility}</span>}{notice.lastDate && <span className="flex items-center gap-2"><CalendarDaysIcon className="h-4 w-4 text-brand-600" />Last date: {new Date(notice.lastDate).toLocaleDateString('en-IN')}</span>}</div><div className="mt-6 whitespace-pre-line text-[15px] leading-7 text-ink-soft">{notice.description}</div><div className="mt-7 border-t border-line pt-5"><Link to="/notices" className={btn('secondary', 'md')}>Back to Notices</Link></div></Panel></PageShell>;
}
