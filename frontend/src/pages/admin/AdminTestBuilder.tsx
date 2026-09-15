import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Badge, Button, Field, Input, Textarea } from '../../components/ui/Primitives';
import { addSeriesTest, fetchAdminSeries } from '../../services/test-series/testSeries.slice';
import type { SeriesStatus } from '../../services/test-series/testSeries.api';
import type { AppDispatch, RootState } from '../../store';

interface DraftQuestion { id: string; text: string; options: string[]; correct: number; explanation: string; marks: string; negative: string }
let sequence = 0;
const blankQuestion = (): DraftQuestion => ({ id: `question-${sequence++}`, text: '', options: ['', '', '', ''], correct: 0, explanation: '', marks: '2', negative: '0.5' });
const steps = ['Test information', 'Questions', 'Publish'];

export function AdminTestBuilder() {
  const { seriesId } = useParams(); const navigate = useNavigate(); const dispatch = useDispatch<AppDispatch>();
  const { current, loading, saving, error } = useSelector((state: RootState) => state.testSeries);
  const [step, setStep] = useState(0); const [title, setTitle] = useState(''); const [duration, setDuration] = useState('60'); const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion()]);
  useEffect(() => { if (seriesId) dispatch(fetchAdminSeries(seriesId)); }, [seriesId, dispatch]);
  const update = (id: string, patch: Partial<DraftQuestion>) => setQuestions((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  const validInformation = title.trim() && Number(duration) > 0;
  const validQuestions = questions.length > 0 && questions.every((question) => question.text.trim() && question.options.every((option) => option.trim()) && question.correct >= 0 && question.correct < question.options.length);
  const save = async (status: SeriesStatus) => {
    if (!seriesId || !validInformation || !validQuestions) return;
    await dispatch(addSeriesTest({ seriesId, payload: { title: title.trim(), duration: Number(duration), status, questions: questions.map((question) => ({ text: question.text.trim(), options: question.options.map((option) => option.trim()), correctAnswer: question.correct, explanation: question.explanation.trim(), marks: Number(question.marks), negativeMarks: Number(question.negative) })) } })).unwrap();
    navigate('/admin/test-series');
  };

  if (!seriesId) return <PageShell title="Test Builder" subtitle="Select a test series first." width="max-w-5xl"><Panel><Button onClick={() => navigate('/admin/test-series')}>Back to test series</Button></Panel></PageShell>;
  return <PageShell title="Test Builder" subtitle={loading ? 'Loading series...' : current ? `Add a test to ${current.title}` : 'Create a test'} width="max-w-5xl">
    <ol className="mb-6 flex flex-wrap gap-2">{steps.map((label, index) => <li key={label}><button type="button" onClick={() => { if (index === 0 || validInformation) setStep(index); }} className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-[13px] font-medium ${step === index ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-line bg-white text-ink-soft'}`}><span className={`flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold ${step > index ? 'bg-emerald-500 text-white' : step === index ? 'bg-brand-600 text-white' : 'bg-canvas text-ink-muted'}`}>{step > index ? <CheckIcon className="h-3.5 w-3.5" /> : index + 1}</span>{label}</button></li>)}</ol>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
    {step === 0 && <Panel><h2 className="text-base font-semibold text-ink">Test information</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Test name" className="sm:col-span-2"><Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="SSC CGL Mock Test 06" /></Field><Field label="Test series"><Input disabled value={current?.title || 'Loading...'} /></Field><Field label="Duration (minutes)"><Input required type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} /></Field></div><div className="mt-5 flex justify-end"><Button disabled={!validInformation} onClick={() => setStep(1)}>Continue to questions</Button></div></Panel>}
    {step === 1 && <div className="space-y-4">{questions.map((question, index) => <Panel key={question.id}><div className="flex items-center justify-between"><h2 className="text-base font-semibold text-ink">Question {index + 1}</h2><button type="button" disabled={questions.length === 1} onClick={() => setQuestions((items) => items.filter((item) => item.id !== question.id))} aria-label="Delete question" className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-40"><Trash2Icon className="h-4 w-4" /></button></div><div className="mt-4 grid gap-4">
      <Field label="Question"><Textarea required rows={2} value={question.text} onChange={(e) => update(question.id, { text: e.target.value })} /></Field><div className="grid gap-3 sm:grid-cols-2">{question.options.map((option, optionIndex) => <Field key={optionIndex} label={`Option ${String.fromCharCode(65 + optionIndex)}`}><div className="flex items-center gap-2"><Input required value={option} onChange={(e) => update(question.id, { options: question.options.map((item, i) => i === optionIndex ? e.target.value : item) })} /><button type="button" onClick={() => update(question.id, { correct: optionIndex })} aria-label="Mark correct answer" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${question.correct === optionIndex ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line text-ink-muted'}`}><CheckIcon className="h-4 w-4" /></button></div></Field>)}</div><p className="text-[13px] text-ink-soft">Correct answer: <Badge tone="green">{String.fromCharCode(65 + question.correct)}</Badge></p>
      <Field label="Explanation"><Textarea rows={2} value={question.explanation} onChange={(e) => update(question.id, { explanation: e.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Marks"><Input required type="number" min="0" step="0.25" value={question.marks} onChange={(e) => update(question.id, { marks: e.target.value })} /></Field><Field label="Negative marks"><Input required type="number" min="0" step="0.25" value={question.negative} onChange={(e) => update(question.id, { negative: e.target.value })} /></Field></div>
    </div></Panel>)}<div className="flex flex-wrap items-center justify-between gap-3"><Button variant="secondary" onClick={() => setQuestions((items) => [...items, blankQuestion()])}><PlusIcon className="h-4 w-4" /> Add question</Button><div className="flex gap-2"><Button variant="secondary" onClick={() => setStep(0)}>Back</Button><Button disabled={!validQuestions} onClick={() => setStep(2)}>Continue to publish</Button></div></div></div>}
    {step === 2 && <Panel><h2 className="text-base font-semibold text-ink">Publish</h2><dl className="mt-4 grid gap-4 sm:grid-cols-3">{[['Questions', String(questions.length)], ['Total marks', String(questions.reduce((sum, question) => sum + Number(question.marks || 0), 0))], ['Duration', `${duration} minutes`]].map(([label, value]) => <div key={label} className="rounded-xl border border-line px-4 py-3.5"><dt className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">{label}</dt><dd className="mt-1 text-lg font-bold text-ink">{value}</dd></div>)}</dl><div className="mt-5 flex flex-wrap justify-end gap-2"><Button variant="secondary" disabled={saving} onClick={() => { save('draft').catch(() => undefined); }}>Save Draft</Button><Button disabled={saving} onClick={() => { save('published').catch(() => undefined); }}>{saving ? 'Saving…' : 'Publish'}</Button></div></Panel>}
  </PageShell>;
}
