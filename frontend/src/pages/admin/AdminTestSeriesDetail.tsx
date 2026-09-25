import { ActionMenu } from '../../components/admin/ActionMenu';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircle2Icon, ChevronDownIcon, Clock3Icon, FileQuestionIcon, FlagIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell, Panel, StatCard } from '../../components/ui/PageShell';
import { Badge, StatusBadge, btn } from '../../components/ui/Primitives';
import { RichText, explanationTextClass, optionContentClass, optionLabelClass, optionTextClass, questionTextClass } from '../../components/ui/RichText';
import { groupTestsBySubject } from '../../services/test-series/testSubjects';
import { deleteTestSeries, fetchAdminSeries, removeSeriesTest, updateSeriesTest } from '../../services/test-series/testSeries.slice';
import type { AppDispatch, RootState } from '../../store';

export function AdminTestSeriesDetail() {
  const { seriesId = '' } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { current, loading, saving, error } = useSelector((state: RootState) => state.testSeries);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  useEffect(() => { if (seriesId) dispatch(fetchAdminSeries(seriesId)); }, [seriesId, dispatch]);
  const series = current?._id === seriesId ? current : null;
  const questions = series?.tests.reduce((total, test) => total + test.questions.length, 0) || 0;
  const totalMinutes = series?.tests.reduce((total, test) => total + test.duration, 0) || 0;

  if (loading) return <PageShell title="Test Series" subtitle="Loading details..." width="max-w-[1200px]"><Panel><p className="text-sm text-ink-muted">Loading test series...</p></Panel></PageShell>;
  if (!series) return <PageShell title="Test Series" subtitle="Unable to open this series." width="max-w-[1200px]"><Panel>{error && <p className="mb-4 text-sm text-red-600">{error}</p>}<Link to="/admin/test-series" className={btn('secondary', 'md')}><ArrowLeftIcon className="h-4 w-4" /> Back to test series</Link></Panel></PageShell>;

  return <PageShell title={series.title} width="max-w-[1200px]" actions={<ActionMenu actions={[
    { label: 'Add test', icon: <PlusIcon className="h-4 w-4" />, href: `/admin/test-series/${series._id}/tests/new` },
    { label: 'Edit series', icon: <PencilIcon className="h-4 w-4" />, href: `/admin/test-series/${series._id}/edit` },
    { label: 'Reported questions', icon: <FlagIcon className="h-4 w-4" />, href: '/admin/question-reports' },
    { label: 'Delete series', icon: <Trash2Icon className="h-4 w-4" />, danger: true, disabled: saving, onClick: () => { if (window.confirm('Delete this series and all of its tests?')) void dispatch(deleteTestSeries(series._id)).unwrap().then(() => navigate('/admin/test-series')).catch(() => undefined); } },
  ]} />}>
    <RichText value={series.description} className="mb-5 text-sm leading-6 text-ink-soft" />
    <Link to="/admin/test-series" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink"><ArrowLeftIcon className="h-4 w-4" /> Back to test series</Link>
    <Panel className="mb-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={series.status} /><Badge tone={series.access === 'free' ? 'green' : 'violet'}>{series.access === 'free' ? 'Free' : `₹${series.price}`}</Badge><Badge tone="brand">{series.kind.replace('-', ' ')}</Badge></div><p className="mt-4 text-sm leading-6 text-ink-soft">{series.exam} · {series.difficulty} · {series.languages}</p></div><p className="text-xs text-ink-muted">Created {new Date(series.createdAt).toLocaleDateString('en-IN')}</p></div></Panel>
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><StatCard label="Tests" value={String(series.tests.length)} icon={<CheckCircle2Icon className="h-4 w-4" />} /><StatCard label="Questions" value={String(questions)} icon={<FileQuestionIcon className="h-4 w-4" />} /><StatCard label="Total duration" value={`${totalMinutes} min`} icon={<Clock3Icon className="h-4 w-4" />} /></div>
    <div className="mb-3"><h2 className="text-lg font-semibold text-ink">Tests in this series</h2><p className="mt-1 text-sm text-ink-muted">Open a test to review answers. Use its three-dot menu to add or edit questions, publish, or delete.</p></div>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
    <div className="space-y-3">
      {series.tests.length === 0 && <Panel><div className="py-8 text-center"><FileQuestionIcon className="mx-auto h-8 w-8 text-ink-muted" /><p className="mt-3 text-sm font-medium text-ink">No tests added yet</p><p className="mt-1 text-sm text-ink-muted">Add the first test to this series.</p><Link to={`/admin/test-series/${series._id}/tests/new`} className={btn('primary', 'md', 'mt-4')}><PlusIcon className="h-4 w-4" /> Add test</Link></div></Panel>}
      {groupTestsBySubject(series.subjects, series.tests).map(group => <details key={group.name || "all"} open className="rounded-xl border border-line"><summary className="cursor-pointer bg-white px-4 py-3 text-sm font-semibold text-ink">{group.name || "All tests"} <span className="text-xs font-normal text-ink-muted">({group.tests.length})</span></summary><div className="space-y-3 p-3">{group.tests.map((test) => { const testIndex = series.tests.findIndex(item => item._id === test._id);
        const open = expandedTest === test._id;
        const marks = test.questions.reduce((sum, question) => sum + question.marks, 0);
        return <div key={test._id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
          <div className="flex items-center gap-2 p-5"><button type="button" onClick={() => setExpandedTest(open ? null : test._id)} className="flex min-w-0 flex-1 items-center gap-4 text-left"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700">{testIndex + 1}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ink">{test.title}</span><span className="mt-1 block text-xs text-ink-muted">{test.questions.length} questions · {marks} marks · {test.duration} minutes</span></span>{test.isPreview && series.access === 'paid' && <Badge tone="green">Free demo</Badge>}<StatusBadge status={test.status} /><ChevronDownIcon className={`h-4 w-4 shrink-0 text-ink-muted transition ${open ? 'rotate-180' : ''}`} /></button><ActionMenu label={`Actions for ${test.title}`} actions={[
            { label: 'Edit test & questions', icon: <PencilIcon className="h-4 w-4" />, href: `/admin/test-series/${series._id}/tests/${test._id}/edit` },
            { label: test.status === 'published' ? 'Unpublish test' : 'Publish test', disabled: saving, onClick: () => { void dispatch(updateSeriesTest({ seriesId: series._id, testId: test._id, payload: { title: test.title, subject: test.subject || '', duration: test.duration, questions: test.questions, status: test.status === 'published' ? 'unpublished' : 'published', isPreview: Boolean(test.isPreview) } })); } },
            { label: 'Delete test', icon: <Trash2Icon className="h-4 w-4" />, danger: true, disabled: saving, onClick: () => { if (window.confirm('Delete this test and its questions?')) void dispatch(removeSeriesTest({ seriesId: series._id, testId: test._id })); } },
          ]} /></div>
          {open && <div className="border-t border-line bg-canvas/50 p-5"><div className="space-y-3">{test.questions.map((question, questionIndex) => <div key={question._id || questionIndex} className="rounded-xl border border-line bg-white p-4"><div className="flex gap-3"><span className="text-xs font-semibold text-ink-muted">Q{questionIndex + 1}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><RichText value={question.text} className={questionTextClass} /><ActionMenu actions={[{ label: 'Edit question', icon: <PencilIcon className="h-4 w-4" />, href: `/admin/test-series/${series._id}/tests/${test._id}/edit?question=${question._id}` }]} /></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <div key={optionIndex} className={`rounded-lg border px-3 py-2 ${optionTextClass} ${optionIndex === question.correctAnswer ? 'border-emerald-200 bg-emerald-50 font-medium text-emerald-700' : 'border-line bg-white text-ink-soft'}`}><div className="flex items-start gap-2"><span className={optionLabelClass}>{String.fromCharCode(65 + optionIndex)}.</span><RichText value={option} className={optionContentClass} /></div></div>)}</div>{question.explanation && <div className={`mt-3 rounded-lg bg-brand-50 px-3 py-2 text-brand-800 ${explanationTextClass}`}><strong>Explanation:</strong> <RichText value={question.explanation} className="inline" /></div>}<p className="mt-2 text-[11px] text-ink-muted">{question.marks} marks · −{question.negativeMarks} negative marks</p></div></div></div>)}</div></div>}
        </div>;
      })}</div></details>)}
    </div>
  </PageShell>;
}
