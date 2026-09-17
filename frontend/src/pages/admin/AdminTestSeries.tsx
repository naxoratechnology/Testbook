import { ActionMenu } from '../../components/admin/ActionMenu';
import { TestSeriesThumbnail } from '../../components/courses/TestSeriesThumbnail';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheckIcon, ChevronDownIcon, Clock3Icon, EyeIcon, ListChecksIcon, PencilIcon, PlusIcon, Trash2Icon, UsersIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell, Panel, StatCard } from '../../components/ui/PageShell';
import { Badge, StatusBadge, btn } from '../../components/ui/Primitives';
import { deleteTestSeries, fetchAdminTestSeries, updateTestSeries } from '../../services/test-series/testSeries.slice';
import type { AdminTestSeries } from '../../services/test-series/testSeries.api';
import type { AppDispatch, RootState } from '../../store';

export function AdminTestSeries() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, saving, error } = useSelector((state: RootState) => state.testSeries);
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => { dispatch(fetchAdminTestSeries()); }, [dispatch]);
  const published = useMemo(() => items.filter((item) => item.status === 'published').length, [items]);
  const questionCount = (series: AdminTestSeries) => series.tests.reduce((sum, test) => sum + test.questions.length, 0);
  const toggle = async (series: AdminTestSeries) => { await dispatch(updateTestSeries({ id: series._id, payload: { title: series.title, description: series.description, exam: series.exam, kind: series.kind, access: series.access, price: series.price, difficulty: series.difficulty, languages: series.languages, status: series.status === 'published' ? 'unpublished' : 'published' } })); };
  const remove = async (id: string) => { if (window.confirm('Delete this test series and all its tests?')) await dispatch(deleteTestSeries(id)); };

  return <PageShell title="Test Series" subtitle="Create and organise mock tests for your students." width="max-w-[1400px]" actions={<Link to="/admin/test-series/new" className={btn('primary', 'md')}><PlusIcon className="h-4 w-4" /> Create test series</Link>}>
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Total series" value={String(items.length)} icon={<BookOpenCheckIcon className="h-4 w-4" />} /><StatCard label="Published" value={String(published)} icon={<UsersIcon className="h-4 w-4" />} /><StatCard label="Total tests" value={String(items.reduce((sum, item) => sum + item.tests.length, 0))} icon={<ListChecksIcon className="h-4 w-4" />} /><StatCard label="Questions" value={String(items.reduce((sum, item) => sum + questionCount(item), 0))} icon={<Clock3Icon className="h-4 w-4" />} /></div>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
    {loading ? <Panel><p className="text-sm text-ink-muted">Loading test series...</p></Panel> : <div className="space-y-3">{items.length === 0 && <Panel><p className="text-center text-sm text-ink-muted">No test series created yet.</p></Panel>}{items.map((series) => <div key={series._id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft"><div className="flex flex-wrap items-center gap-3 p-5">
      <button type="button" onClick={() => setExpanded(expanded === series._id ? null : series._id)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><ChevronDownIcon className={'h-4 w-4 shrink-0 text-ink-muted transition ' + (expanded === series._id ? 'rotate-180' : '')} /><TestSeriesThumbnail src={series.thumbnail} alt={series.title} className="h-12 w-20 shrink-0 rounded-lg object-cover" /><span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink">{series.title}</span><span className="mt-1 block text-xs text-ink-muted">{series.exam} · {series.tests.length} tests · {questionCount(series)} questions</span></span></button>
      <Badge tone={series.access === 'free' ? 'green' : 'violet'}>{series.access === 'free' ? 'Free' : `₹${series.price}`}</Badge><StatusBadge status={series.status} /><ActionMenu label={`Actions for ${series.title}`} actions={[
        { label: 'View tests', icon: <EyeIcon className="h-4 w-4" />, href: `/admin/test-series/${series._id}` },
        { label: 'Add test', icon: <PlusIcon className="h-4 w-4" />, href: `/admin/test-series/${series._id}/tests/new` },
        { label: 'Edit series', icon: <PencilIcon className="h-4 w-4" />, href: `/admin/test-series/${series._id}/edit` },
        { label: series.status === 'published' ? 'Unpublish' : 'Publish', disabled: saving, onClick: () => { void toggle(series); } },
        { label: 'Delete series', icon: <Trash2Icon className="h-4 w-4" />, danger: true, disabled: saving, onClick: () => { void remove(series._id); } },
      ]} />
    </div>{expanded === series._id && <div className="border-t border-line bg-canvas/60 p-5"><div className="grid gap-3 sm:grid-cols-3"><div><p className="text-xs text-ink-muted">Difficulty</p><p className="mt-1 text-sm font-medium text-ink">{series.difficulty}</p></div><div><p className="text-xs text-ink-muted">Languages</p><p className="mt-1 text-sm font-medium text-ink">{series.languages}</p></div><div><p className="text-xs text-ink-muted">Created</p><p className="mt-1 text-sm font-medium text-ink">{new Date(series.createdAt).toLocaleDateString('en-IN')}</p></div></div><div className="mt-5 space-y-2">{series.tests.map((test) => <div key={test._id} className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3"><span className="text-sm font-medium text-ink">{test.title}</span><span className="text-xs text-ink-muted">{test.questions.length} questions · {test.duration} min · {test.status}</span></div>)}</div></div>}</div>)}</div>}
  </PageShell>;
}
