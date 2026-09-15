import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusinessIcon, Building2Icon, CalendarDaysIcon, MapPinIcon, MegaphoneIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, EmptyState, btn } from '../components/ui/Primitives';
import { fetchNotices } from '../services/notices/notices.slice';
import type { AppDispatch, RootState } from '../store';

export function NoticesPage() {
  const dispatch = useDispatch<AppDispatch>(); const { items, loading, error } = useSelector((state: RootState) => state.notices);
  useEffect(() => { dispatch(fetchNotices()); }, [dispatch]);
  return <PageShell title="Notices" subtitle="Latest vacancies, job opportunities and important announcements." width="max-w-7xl">
    {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
    {loading ? <Panel><p className="text-sm text-ink-muted">Loading notices...</p></Panel> : items.length === 0 ? <EmptyState icon={<MegaphoneIcon className="h-5 w-5" />} title="No notices available." description="New vacancies, job posts and announcements will appear here." /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((notice) => <Panel key={notice._id} className="flex h-full flex-col"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge tone={notice.type === 'vacancy' ? 'brand' : notice.type === 'job' ? 'violet' : 'slate'}>{notice.type === 'job' ? 'Job Post' : notice.type}</Badge>{notice.lastDate && <span className="flex items-center gap-1 text-xs text-ink-muted"><CalendarDaysIcon className="h-3.5 w-3.5" /> Last date: {new Date(notice.lastDate).toLocaleDateString('en-IN')}</span>}</div><h2 className="mt-3 text-lg font-semibold text-ink">{notice.title}</h2></div><span className="text-xs text-ink-muted">{new Date(notice.createdAt).toLocaleDateString('en-IN')}</span></div><p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-6 text-ink-soft">{notice.description}</p><div className="mt-4 space-y-2 text-xs text-ink-muted">{notice.organization && <span className="flex items-center gap-1.5"><Building2Icon className="h-3.5 w-3.5" /> {notice.organization}</span>}{notice.location && <span className="flex items-center gap-1.5"><MapPinIcon className="h-3.5 w-3.5" /> {notice.location}</span>}{notice.eligibility && <span className="flex items-start gap-1.5"><BriefcaseBusinessIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {notice.eligibility}</span>}</div><div className="mt-auto pt-5"><Link to={`/notices/${notice._id}`} className={btn('primary', 'md', 'w-full')}>View Details</Link></div></Panel>)}</div>}
  </PageShell>;
}
