import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Badge, Button, Field, Input, Select, btn } from '../../components/ui/Primitives';
import { ActionMenu } from '../../components/admin/ActionMenu';
import { RichTextEditor, richTextToPlain } from '../../components/ui/RichText';
import { addSeriesTest, fetchAdminSeries, updateSeriesTest } from '../../services/test-series/testSeries.slice';
import type { SeriesStatus } from '../../services/test-series/testSeries.api';
import type { AppDispatch, RootState } from '../../store';

interface DraftQuestion { id: string; _id?: string; text: string; options: string[]; correct: number; explanation: string; marks: string; negative: string }
let sequence = 0;
const blankQuestion = (): DraftQuestion => ({ id: `question-${sequence++}`, text: '', options: ['', '', '', ''], correct: 0, explanation: '', marks: '2', negative: '0.5' });

export function AdminTestBuilder() {
  const { seriesId = '', testId } = useParams(); const [search] = useSearchParams(); const editing = Boolean(testId);
  const navigate = useNavigate(); const dispatch = useDispatch<AppDispatch>();
  const back = search.get('from') === 'reports' ? '/admin/question-reports' : `/admin/test-series/${seriesId}`;
  const { current, loading, saving, error } = useSelector((state: RootState) => state.testSeries);
  const series = current?._id === seriesId ? current : null; const test = series?.tests.find((item) => item._id === testId);
  const loaded = useRef(''); const [failure, setFailure] = useState('');
  const [title, setTitle] = useState(''); const [subject, setSubject] = useState(''); const [duration, setDuration] = useState('60'); const [status, setStatus] = useState<SeriesStatus>('draft');
  const [isPreview, setIsPreview] = useState(false);
  const [questions, setQuestions] = useState<DraftQuestion[]>(() => [blankQuestion()]);
  useEffect(() => { loaded.current = ''; setFailure(''); setTitle(''); setSubject(''); setDuration('60'); setStatus('draft'); setIsPreview(false); setQuestions([blankQuestion()]); }, [seriesId, testId]);
  useEffect(() => { if (seriesId) void dispatch(fetchAdminSeries(seriesId)); }, [seriesId, dispatch]);
  useEffect(() => {
    if (!test || loaded.current === test._id) return;
    loaded.current = test._id; setTitle(test.title); setSubject(test.subject || ''); setDuration(String(test.duration)); setStatus(test.status); setIsPreview(Boolean(test.isPreview));
    setQuestions(test.questions.map((question) => ({ id: question._id || `question-${sequence++}`, _id: question._id, text: question.text, options: question.options, correct: question.correctAnswer, explanation: question.explanation || '', marks: String(question.marks), negative: String(question.negativeMarks) })));
    const target = search.get('question');
    if (target) window.setTimeout(() => document.getElementById(`question-${target}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 100);
  }, [test, search]);
  const update = (id: string, patch: Partial<DraftQuestion>) => setQuestions((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  const otherDemoCount = (series?.tests || []).filter((item) => item.isPreview && item._id !== testId).length;
  const validInformation = Boolean(title.trim()) && Number.isInteger(Number(duration)) && Number(duration) > 0;
  const validQuestions = questions.length > 0 && questions.every((question) => richTextToPlain(question.text) && question.options.length >= 2 && question.options.every((option) => richTextToPlain(option)) && question.correct >= 0 && question.correct < question.options.length && question.marks !== '' && Number.isFinite(Number(question.marks)) && Number(question.marks) >= 0 && question.negative !== '' && Number.isFinite(Number(question.negative)) && Number(question.negative) >= 0);
  const save = async () => {
    if (!seriesId || !validInformation || !validQuestions || saving) return;
    setFailure('');
    if (series?.access === 'paid' && isPreview && otherDemoCount >= 2) { setFailure('Choose no more than two free demo tests.'); return; }
    const payload = { title: title.trim(), subject, duration: Number(duration), status, isPreview: series?.access === 'paid' && isPreview, questions: questions.map((question) => ({ ...(question._id ? { _id: question._id } : {}), text: question.text.trim(), options: question.options.map((option) => option.trim()), correctAnswer: question.correct, explanation: question.explanation.trim(), marks: Number(question.marks), negativeMarks: Number(question.negative) })) };
    try { if (testId) await dispatch(updateSeriesTest({ seriesId, testId, payload })).unwrap(); else await dispatch(addSeriesTest({ seriesId, payload })).unwrap(); navigate(back); }
    catch (error) { setFailure(String(error)); }
  };
  if (loading) return <PageShell title={editing ? 'Edit test & questions' : 'Add test'}><Panel>Loading test...</Panel></PageShell>;
  if (!series || (editing && !test)) return <PageShell title="Test not found"><p className="mb-4 text-sm text-red-600">{error || 'Select an available test series.'}</p><Link to="/admin/test-series" className={btn('secondary', 'md')}>Back to test series</Link></PageShell>;
  return <PageShell title={editing ? 'Edit test & questions' : 'Add test'} subtitle={`Test series: ${series.title}`} width="max-w-5xl">
    <Link to={back} className="mb-5 inline-block text-sm text-brand-700">{search.get('from') === 'reports' ? '← Back to reported questions' : '← Back to tests'}</Link>
    <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); void save(); }}>
      {(error || failure) && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{failure || error}</p>}
      <Panel><h2 className="font-semibold text-ink">Test information</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Test name" className="sm:col-span-2"><Input required value={title} onChange={(event) => setTitle(event.target.value)} /></Field><Field label="Subject folder"><Select value={subject} onChange={event => setSubject(event.target.value)}><option value="">General tests</option>{(series.subjects || []).map(item => <option key={item} value={item}>{item}</option>)}</Select></Field><Field label="Duration (minutes)"><Input required type="number" min="1" step="1" value={duration} onChange={(event) => setDuration(event.target.value)} /></Field><Field label="Status"><Select value={status} onChange={(event) => setStatus(event.target.value as SeriesStatus)}><option value="draft">Draft</option><option value="published">Published</option><option value="unpublished">Unpublished</option></Select></Field></div>{editing && test?.status === 'published' && <p className="mt-3 text-xs text-ink-muted">You can add or edit questions without unpublishing this test. Saved changes are visible to students.</p>}</Panel>
      {series.access === 'paid' && <label className="flex items-start gap-3 rounded-xl border border-line bg-white p-4 text-sm text-ink"><input type="checkbox" checked={isPreview} disabled={!isPreview && otherDemoCount >= 2} onChange={(event) => setIsPreview(event.target.checked)} className="mt-1" /><span><span className="block font-medium">Make this a free demo test (optional)</span><span className="mt-1 block text-xs text-ink-muted">Students can attempt this test before buying the series. {otherDemoCount + (isPreview ? 1 : 0)}/2 demo tests selected.</span></span></label>}
      <div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-ink">Questions ({questions.length})</h2><Button type="button" variant="secondary" onClick={() => setQuestions((items) => [...items, blankQuestion()])}><PlusIcon className="h-4 w-4" /> Add question</Button></div>
      {questions.map((question, index) => <Panel key={question.id}><div id={`question-${question.id}`} className="scroll-mt-24"><div className="flex items-center justify-between"><h3 className="font-semibold text-ink">Question {index + 1}</h3><ActionMenu actions={[{ label: 'Delete question', icon: <Trash2Icon className="h-4 w-4" />, danger: true, disabled: questions.length === 1 || saving, onClick: () => { if (!question._id || window.confirm('Delete this question when you save the test?')) setQuestions((items) => items.filter((item) => item.id !== question.id)); } }]} /></div><div className="mt-4 space-y-4"><Field label="Question" hint="Use x² for powers and x₂ for subscripts."><RichTextEditor value={question.text} onChange={(text) => update(question.id, { text })} placeholder="Enter the question" ariaLabel={`Question ${index + 1}`} /></Field><div className="grid gap-3 sm:grid-cols-2">{question.options.map((option, optionIndex) => <Field key={optionIndex} label={`Option ${String.fromCharCode(65 + optionIndex)}`}><div className="flex items-start gap-2"><div className="min-w-0 flex-1"><RichTextEditor value={option} onChange={(text) => update(question.id, { options: question.options.map((item, i) => i === optionIndex ? text : item) })} placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} minHeight="52px" ariaLabel={`Option ${String.fromCharCode(65 + optionIndex)}`} /></div><button type="button" aria-pressed={question.correct === optionIndex} onClick={() => update(question.id, { correct: optionIndex })} aria-label={`Mark option ${String.fromCharCode(65 + optionIndex)} correct`} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${question.correct === optionIndex ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line text-ink-muted'}`}><CheckIcon className="h-4 w-4" /></button></div></Field>)}</div><p className="text-xs text-ink-soft">Correct answer: <Badge tone="green">{String.fromCharCode(65 + question.correct)}</Badge> Click the check beside the correct option.</p><Field label="Explanation"><RichTextEditor value={question.explanation} onChange={(explanation) => update(question.id, { explanation })} placeholder="Explain the correct answer" ariaLabel={`Explanation for question ${index + 1}`} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Marks"><Input required type="number" min="0" step="0.25" value={question.marks} onChange={(event) => update(question.id, { marks: event.target.value })} /></Field><Field label="Negative marks"><Input required type="number" min="0" step="0.25" value={question.negative} onChange={(event) => update(question.id, { negative: event.target.value })} /></Field></div></div></div></Panel>)}
      <div className="flex flex-wrap items-center justify-between gap-3"><Button type="button" variant="secondary" onClick={() => setQuestions((items) => [...items, blankQuestion()])}><PlusIcon className="h-4 w-4" /> Add question</Button><div className="flex gap-2"><Link to={back} className={btn('secondary', 'md')}>Cancel</Link><Button type="submit" disabled={!validInformation || !validQuestions || saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Save test'}</Button></div></div>
    </form>
  </PageShell>;
}
