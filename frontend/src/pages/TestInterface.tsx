import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ClockIcon } from 'lucide-react';
import { Button, btn } from '../components/ui/Primitives';
import { fetchPublicSeries, submitTestAttempt } from '../services/test-series/testSeries.slice';
import type { AppDispatch, RootState } from '../store';

export function TestInterface() {
  const { seriesId = '', testId = '' } = useParams(); const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate();
  const { publicCurrent: series, loading, saving, error } = useSelector((state: RootState) => state.testSeries);
  const test = series?._id === seriesId ? series.tests.find((item) => item._id === testId) : undefined;
  const [index, setIndex] = useState(0); const [answers, setAnswers] = useState<Record<string, number | null>>({}); const [seconds, setSeconds] = useState(0);
  useEffect(() => { if (!series || series._id !== seriesId) dispatch(fetchPublicSeries(seriesId)); }, [dispatch, series, seriesId]);
  useEffect(() => { if (test) setSeconds(test.duration * 60); }, [test?._id]);
  useEffect(() => { const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, []);
  const answered = useMemo(() => Object.values(answers).filter((value) => value !== null && value !== undefined).length, [answers]);
  if (loading || !test) return <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-ink-muted">{error || 'Loading test...'}</div>;
  const question = test.questions[index]; const selected = answers[question._id];
  const submit = async () => { try { await dispatch(submitTestAttempt({ seriesId, testId, answers })).unwrap(); navigate(`/test-series/${seriesId}/tests/${testId}/result`); } catch { /* Redux displays error. */ } };
  return <div className="min-h-screen bg-canvas"><header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-white px-4 sm:px-8"><button onClick={() => navigate(-1)} className={btn('ghost', 'sm')}>Exit</button><h1 className="min-w-0 flex-1 truncate font-semibold text-ink">{series.title} — {test.title}</h1><span className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700"><ClockIcon className="h-4 w-4" />{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</span></header>
    <main className="mx-auto grid max-w-6xl gap-5 p-4 sm:p-8 lg:grid-cols-[1fr_280px]"><section className="rounded-2xl border border-line bg-white p-5 sm:p-8"><div className="flex justify-between text-xs text-ink-muted"><span>Question {index + 1} of {test.questions.length}</span><span>+{question.marks} / −{question.negativeMarks}</span></div><h2 className="mt-5 text-lg font-semibold leading-7 text-ink">{question.text}</h2><div className="mt-6 space-y-3">{question.options.map((option, optionIndex) => <button key={optionIndex} onClick={() => setAnswers((current) => ({ ...current, [question._id]: optionIndex }))} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm ${selected === optionIndex ? 'border-brand-600 bg-brand-50' : 'border-line hover:bg-canvas'}`}><span className="font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>{option}</button>)}</div><div className="mt-8 flex justify-between"><button disabled={index === 0} onClick={() => setIndex((value) => value - 1)} className={btn('secondary', 'sm')}>Previous</button><button disabled={index === test.questions.length - 1} onClick={() => setIndex((value) => value + 1)} className={btn('primary', 'sm')}>Save & Next</button></div></section>
      <aside className="rounded-2xl border border-line bg-white p-5"><h2 className="font-semibold text-ink">Questions</h2><p className="mt-1 text-xs text-ink-muted">{answered} of {test.questions.length} answered</p><div className="mt-4 grid grid-cols-5 gap-2">{test.questions.map((item, itemIndex) => <button key={item._id} onClick={() => setIndex(itemIndex)} className={`h-9 rounded-lg border text-xs font-semibold ${itemIndex === index ? 'ring-2 ring-brand-400' : ''} ${answers[item._id] !== undefined && answers[item._id] !== null ? 'border-brand-600 bg-brand-600 text-white' : 'border-line'}`}>{itemIndex + 1}</button>)}</div>{error && <p className="mt-4 text-xs text-red-600">{error}</p>}<Button disabled={saving} onClick={submit} className="mt-6 w-full">{saving ? 'Submitting...' : 'Submit Test'}</Button></aside></main>
  </div>;
}
