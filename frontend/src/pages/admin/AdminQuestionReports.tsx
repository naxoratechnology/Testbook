import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CheckCircleIcon, PencilIcon, RotateCcwIcon } from 'lucide-react';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Button, Select } from '../../components/ui/Primitives';
import { ActionMenu } from '../../components/admin/ActionMenu';
import { fetchQuestionReports, updateQuestionReportStatus } from '../../services/question-review/questionReview.slice';
import type { AdminQuestionReport } from '../../services/question-review/questionReview.api';
import type { AppDispatch } from '../../store';

export function AdminQuestionReports() {
  const dispatch = useDispatch<AppDispatch>();
  const [items, setItems] = useState<AdminQuestionReport[]>([]); const [loading, setLoading] = useState(true); const [pending, setPending] = useState(''); const [error, setError] = useState(''); const [filter, setFilter] = useState('pending');
  useEffect(() => { let active = true; void dispatch(fetchQuestionReports()).unwrap().then((items) => { if (active) setItems(items); }).catch((error) => { if (active) setError(String(error)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [dispatch]);
  const update = async (item: AdminQuestionReport) => { setPending(item._id); setError(''); try { const updated = await dispatch(updateQuestionReportStatus({ id: item._id, status: item.status === 'pending' ? 'resolved' : 'pending' })).unwrap(); setItems((items) => items.map((entry) => entry._id === updated._id ? updated : entry)); } catch (error) { setError(String(error)); } finally { setPending(''); } };
  const editor = (item: AdminQuestionReport) => item.source === 'test-series' ? `/admin/test-series/${item.sourceId}/tests/${item.testId}/edit?question=${item.questionId}&from=reports` : item.source === 'current-affairs' ? `/admin/current-affairs/${item.sourceId}/edit` : `/admin/previous-papers/${item.sourceId}/edit`;
  const visible = items.filter((item) => filter === 'all' || item.status === filter);
  return <PageShell title="Reported Questions" subtitle="Review feedback, correct the question, then mark the report resolved." actions={<Select aria-label="Filter reports" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="pending">Pending</option><option value="resolved">Resolved</option><option value="all">All reports</option></Select>}>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}<Button variant="secondary" size="sm" className="ml-3" onClick={() => { setLoading(true); void dispatch(fetchQuestionReports()).unwrap().then(setItems).then(() => setError('')).catch((error) => setError(String(error))).finally(() => setLoading(false)); }}>Retry</Button></p>}
    {loading ? <Panel>Loading reports...</Panel> : !visible.length ? <Panel><p className="text-center text-sm text-ink-muted">No {filter === 'all' ? '' : filter} reports.</p></Panel> : <div className="space-y-4">{visible.map((item) => <Panel key={item._id}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-ink">{item.title}</p><p className="mt-1 text-xs text-ink-muted">{item.user?.name || 'User'} · {new Date(item.createdAt).toLocaleDateString('en-IN')} · {item.status}</p></div><ActionMenu label={`Actions for report: ${item.title}`} actions={[{ label: 'Edit reported question', icon: <PencilIcon className="h-4 w-4" />, href: editor(item) }, { label: item.status === 'pending' ? 'Mark resolved' : 'Reopen report', icon: item.status === 'pending' ? <CheckCircleIcon className="h-4 w-4" /> : <RotateCcwIcon className="h-4 w-4" />, disabled: Boolean(pending), onClick: () => { void update(item); } }]} /></div><p className="mt-4 whitespace-pre-wrap text-sm font-medium text-ink">{item.questionText}</p><p className="mt-3 text-xs font-semibold text-brand-700">{({ 'wrong-answer': 'Incorrect answer or explanation', 'question-error': 'Question or options error', translation: 'Language or translation issue', other: 'Other' })[item.reason]}</p>{item.details && <p className="mt-2 whitespace-pre-wrap rounded-xl bg-canvas p-3 text-sm text-ink-soft">{item.details}</p>}</Panel>)}</div>}
  </PageShell>;
}
