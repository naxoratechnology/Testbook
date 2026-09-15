import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircle2Icon, ChevronDownIcon, Clock3Icon, FileQuestionIcon, PencilIcon, PlusIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell, Panel, StatCard } from '../../components/ui/PageShell';
import { Badge, StatusBadge, btn } from '../../components/ui/Primitives';
import { fetchAdminSeries } from '../../services/test-series/testSeries.slice';
import type { AppDispatch, RootState } from '../../store';

export function AdminTestSeriesDetail() {
  const { seriesId = '' } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { current, loading, error } = useSelector((state: RootState) => state.testSeries);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  useEffect(() => { if (seriesId) dispatch(fetchAdminSeries(seriesId)); }, [seriesId, dispatch]);
  const series = current?._id === seriesId ? current : null;
  const questions = series?.tests.reduce((total, test) => total + test.questions.length, 0) || 0;
  const totalMinutes = series?.tests.reduce((total, test) => total + test.duration, 0) || 0;

  if (loading) return <PageShell title="Test Series" subtitle="Loading details..." width="max-w-[1200px]"><Panel><p className="text-sm text-ink-muted">Loading test series...</p></Panel></PageShell>;
  if (!series) return <PageShell title="Test Series" subtitle="Unable to open this series." width="max-w-[1200px]"><Panel>{error && <p className="mb-4 text-sm text-red-600">{error}</p>}<Link to="/admin/test-series" className={btn('secondary', 'md')}><ArrowLeftIcon className="h-4 w-4" /> Back to test series</Link></Panel></PageShell>;

  return <PageShell title={series.title} subtitle={series.description} width="max-w-[1200px]" actions={<><Link to={`/admin/test-series/${series._id}/edit`} className={btn('secondary', 'md')}><PencilIcon className="h-4 w-4" /> Edit series</Link><Link to={`/admin/test-series/${series._id}/tests/new`} className={btn('primary', 'md')}><PlusIcon className="h-4 w-4" /> Add test</Link></>}>
    <Link to="/admin/test-series" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink"><ArrowLeftIcon className="h-4 w-4" /> Back to test series</Link>
    <Panel className="mb-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={series.status} /><Badge tone={series.access === 'free' ? 'green' : 'violet'}>{series.access === 'free' ? 'Free' : `₹${series.price}`}</Badge><Badge tone="brand">{series.kind.replace('-', ' ')}</Badge></div><p className="mt-4 text-sm leading-6 text-ink-soft">{series.exam} · {series.difficulty} · {series.languages}</p></div><p className="text-xs text-ink-muted">Created {new Date(series.createdAt).toLocaleDateString('en-IN')}</p></div></Panel>
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><StatCard label="Tests" value={String(series.tests.length)} icon={<CheckCircle2Icon className="h-4 w-4" />} /><StatCard label="Questions" value={String(questions)} icon={<FileQuestionIcon className="h-4 w-4" />} /><StatCard label="Total duration" value={`${totalMinutes} min`} icon={<Clock3Icon className="h-4 w-4" />} /></div>
    <div className="mb-3"><h2 className="text-lg font-semibold text-ink">Tests in this series</h2><p className="mt-1 text-sm text-ink-muted">Open a test to review its questions and correct answers.</p></div>
    <div className="space-y-3">
      {series.tests.length === 0 && <Panel><div className="py-8 text-center"><FileQuestionIcon className="mx-auto h-8 w-8 text-ink-muted" /><p className="mt-3 text-sm font-medium text-ink">No tests added yet</p><p className="mt-1 text-sm text-ink-muted">Add the first test to this series.</p><Link to={`/admin/test-series/${series._id}/tests/new`} className={btn('primary', 'md', 'mt-4')}><PlusIcon className="h-4 w-4" /> Add test</Link></div></Panel>}
      {series.tests.map((test, testIndex) => {
        const open = expandedTest === test._id;
        const marks = test.questions.reduce((sum, question) => sum + question.marks, 0);
        return <div key={test._id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
          <button type="button" onClick={() => setExpandedTest(open ? null : test._id)} className="flex w-full items-center gap-4 p-5 text-left"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700">{testIndex + 1}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ink">{test.title}</span><span className="mt-1 block text-xs text-ink-muted">{test.questions.length} questions · {marks} marks · {test.duration} minutes</span></span><StatusBadge status={test.status} /><ChevronDownIcon className={`h-4 w-4 shrink-0 text-ink-muted transition ${open ? 'rotate-180' : ''}`} /></button>
          {open && <div className="border-t border-line bg-canvas/50 p-5"><div className="space-y-3">{test.questions.map((question, questionIndex) => <div key={question._id || questionIndex} className="rounded-xl border border-line bg-white p-4"><div className="flex gap-3"><span className="text-xs font-semibold text-ink-muted">Q{questionIndex + 1}</span><div className="min-w-0 flex-1"><p className="text-sm font-medium leading-6 text-ink">{question.text}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <div key={optionIndex} className={`rounded-lg border px-3 py-2 text-xs ${optionIndex === question.correctAnswer ? 'border-emerald-200 bg-emerald-50 font-medium text-emerald-700' : 'border-line bg-white text-ink-soft'}`}>{String.fromCharCode(65 + optionIndex)}. {option}</div>)}</div>{question.explanation && <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs leading-5 text-brand-800"><strong>Explanation:</strong> {question.explanation}</p>}<p className="mt-2 text-[11px] text-ink-muted">{question.marks} marks · −{question.negativeMarks} negative marks</p></div></div></div>)}</div></div>}
        </div>;
      })}
    </div>
  </PageShell>;
}
