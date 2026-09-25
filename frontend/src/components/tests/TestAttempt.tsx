import { useCallback, useEffect, useRef, useState } from 'react';
import { ClockIcon, MaximizeIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/Primitives';
import { RichText, optionContentClass, optionLabelClass, optionTextClass, questionTextClass } from '../ui/RichText';
import { useAuth } from '../../contexts/AuthContext';
import { CandidatePhoto, TestInstructions, questionStatusClasses } from './TestInstructions';
import type { AttemptQuestion } from './TestInstructions';

type Answers = Record<string, number | null>;
export function TestAttempt({ title, questions, duration = 0, languages, saving, error, onSubmit, onExit }: { title: string; questions: AttemptQuestion[]; duration?: number; languages?: string; saving: boolean; error: string | null; onSubmit: (answers: Answers) => Promise<void>; onExit: () => void }) {
  const { user } = useAuth();
  const screen = useRef<HTMLDivElement>(null);
  const deadline = useRef(0);
  const submitting = useRef(false);
  const attemptedAutoSubmit = useRef(false);
  const latestAnswers = useRef<Answers>({});
  const [started, setStarted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [review, setReview] = useState<Record<string, boolean>>({});
  const [seconds, setSeconds] = useState(duration * 60);
  const [expired, setExpired] = useState(false);
  const [paperOpen, setPaperOpen] = useState(false);
  const [localError, setLocalError] = useState('');
  const question = questions[index];
  const name = user?.name || 'Candidate';
  useEffect(() => { const original = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = original; }; }, []);
  useEffect(() => { if (!photo) return; const url = URL.createObjectURL(photo); setPhotoUrl(url); return () => URL.revokeObjectURL(url); }, [photo]);
  useEffect(() => { const change = () => setFullscreen(document.fullscreenElement === screen.current); document.addEventListener('fullscreenchange', change); return () => { document.removeEventListener('fullscreenchange', change); if (document.fullscreenElement === screen.current) void document.exitFullscreen().catch(() => undefined); }; }, []);
  useEffect(() => { if (!started) return; const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [started]);
  const requestFullscreen = () => { if (screen.current?.requestFullscreen) void screen.current.requestFullscreen().catch(() => setFullscreen(false)); };
  const submit = useCallback(async () => {
    if (submitting.current || saving) return;
    submitting.current = true; setLocalError('');
    try { await onSubmit(latestAnswers.current); if (document.fullscreenElement === screen.current) await document.exitFullscreen().catch(() => undefined); }
    catch (failure) { setLocalError(typeof failure === 'string' ? failure : failure instanceof Error ? failure.message : 'Submission failed. Your saved answers are still here; please retry.'); }
    finally { submitting.current = false; }
  }, [onSubmit, saving]);
  useEffect(() => {
    if (!started || !duration) return;
    const tick = () => { const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)); setSeconds(remaining); if (remaining === 0) { setExpired(true); if (!attemptedAutoSubmit.current) { attemptedAutoSubmit.current = true; void submit(); } } };
    tick(); const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer);
  }, [started, duration, submit]);
  const go = (nextIndex: number) => { setIndex(nextIndex); setSelected(latestAnswers.current[questions[nextIndex]._id] ?? null); };
  const save = (mark: boolean) => { if (!question || expired) return; const next = { ...latestAnswers.current, [question._id]: selected }; latestAnswers.current = next; setAnswers(next); setReview((value) => ({ ...value, [question._id]: mark })); if (index < questions.length - 1) go(index + 1); };
  const choose = (optionIndex: number) => setSelected((value) => value === optionIndex ? null : optionIndex);
  const clear = () => setSelected(null);
  const exit = () => { if (!started || window.confirm('Leave this test? Your unsubmitted answers will be lost.')) { if (document.fullscreenElement === screen.current) void document.exitFullscreen().catch(() => undefined); onExit(); } };
  const answered = Object.values(answers).filter((value) => value !== null && value !== undefined).length;
  const markedForReview = questions.filter((item) => review[item._id]).length;
  const status = (id: string) => { const hasAnswer = answers[id] !== null && answers[id] !== undefined; return review[id] ? hasAnswer ? 'answeredReview' : 'review' : hasAnswer ? 'answered' : 'unanswered'; };
  const lastQuestionSaved = Boolean(question && index === questions.length - 1 && Object.prototype.hasOwnProperty.call(answers, question._id) && answers[question._id] === selected);
  return <div ref={screen} className="fixed inset-0 z-50 h-[100dvh] w-full overflow-y-auto bg-canvas text-ink">
    {!started ? <TestInstructions title={title} questions={questions} duration={duration} languages={languages} name={name} onExit={exit} onStart={(file) => { setPhoto(file); deadline.current = Date.now() + duration * 60000; setStarted(true); requestFullscreen(); window.scrollTo(0, 0); }} /> : <>
      <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center gap-3 border-b border-line bg-white px-4 py-3 sm:px-6"><Button variant="danger" size="sm" onClick={exit} className="shrink-0 font-semibold">Exit</Button><h1 className="order-last w-full min-w-0 text-sm font-semibold sm:order-none sm:w-auto sm:flex-1 sm:text-base">{title}</h1><div className="ml-auto flex shrink-0 items-center gap-2">{!fullscreen && <Button variant="secondary" size="sm" onClick={requestFullscreen} aria-label="Enter full screen"><MaximizeIcon className="h-4 w-4" /><span className="hidden sm:inline">Full screen</span></Button>}<span role="timer" aria-label="Time remaining" className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700"><ClockIcon className="h-4 w-4" />{duration ? `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` : 'No time limit'}</span><Button disabled={saving} onClick={() => { if (expired || window.confirm(`Submit the test with ${answered} of ${questions.length} saved answers? Any unsaved selection will not be evaluated.`)) void submit(); }} size="sm" className="shrink-0">{saving ? 'Submitting...' : 'Submit Test'}</Button></div></header>
      <main className="grid w-full gap-4 p-4 pb-28 sm:p-6 sm:pb-28 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0 rounded-2xl border border-line bg-white p-5 sm:p-8">
          {expired && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Time is up. Your saved answers are being submitted. If submission fails, use Submit Test to retry.</p>}
          {question ? <><div className="flex flex-wrap justify-between gap-2 text-xs text-ink-muted"><span>Question {index + 1} of {questions.length}</span><span>+{question.marks ?? 1} / −{question.negativeMarks ?? 0}</span></div><RichText value={question.text} className={`mt-5 ${questionTextClass}`} /><fieldset disabled={expired || saving} className="mt-6 space-y-3"><legend className="sr-only">Choose your answer</legend>{question.options.map((option, optionIndex) => <button type="button" aria-pressed={selected === optionIndex} key={optionIndex} onClick={() => choose(optionIndex)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left disabled:opacity-60 ${selected === optionIndex ? 'border-brand-600 bg-brand-50' : 'border-line hover:bg-canvas'}`}><span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected === optionIndex ? 'border-brand-600' : 'border-slate-300'}`}>{selected === optionIndex && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}</span><span className={optionLabelClass}>{String.fromCharCode(65 + optionIndex)}.</span><RichText value={option} className={optionContentClass} /></button>)}</fieldset><p className="mt-4 text-xs text-ink-muted">{lastQuestionSaved ? 'Your answer is saved. You may revise it before submitting.' : 'Click Save & Next or Mark for Review & Next to save your selection.'}</p><div className="mt-6 flex flex-wrap gap-2"><Button variant="secondary" disabled={expired || saving} onClick={clear}>Clear response</Button>{review[question._id] && <Button variant="secondary" disabled={expired || saving} onClick={() => setReview((value) => ({ ...value, [question._id]: false }))}>Unmark</Button>}<Button variant="secondary" disabled={expired || saving} onClick={() => save(true)}>Mark for Review & Next</Button></div></> : <p className="text-sm text-ink-muted">No questions are available.</p>}
        </section>
        <aside className="rounded-2xl border border-line bg-white p-5"><CandidatePhoto src={photoUrl} name={name} /><h2 className="mt-5 font-semibold">Question palette</h2><p className="mt-1 text-xs text-ink-muted">{answered} of {questions.length} answered</p><div className="mt-4 grid grid-cols-5 gap-2">{questions.map((item, itemIndex) => <button type="button" key={item._id} aria-label={`Question ${itemIndex + 1}, ${status(item._id)}`} aria-current={itemIndex === index ? 'step' : undefined} onClick={() => go(itemIndex)} className={`h-10 rounded-lg text-xs font-semibold ${questionStatusClasses[status(item._id)]} ${itemIndex === index ? 'ring-2 ring-brand-400 ring-offset-2' : ''}`}>{itemIndex + 1}{review[item._id] ? ' ▲' : ''}</button>)}</div><div className="mt-5 grid grid-cols-2 gap-2 text-[11px]">{[['unanswered', 'Not answered'], ['answered', 'Answered'], ['review', 'Marked for review'], ['answeredReview', 'Answered & review']].map(([key, label]) => <div key={key} className="flex items-center gap-2"><span className={`h-3 w-3 shrink-0 rounded ${questionStatusClasses[key as keyof typeof questionStatusClasses]}`} />{label}</div>)}</div><div className="mt-5 overflow-hidden rounded-xl border border-line"><table className="w-full text-sm"><caption className="border-b border-line bg-slate-50 px-3 py-2 text-left font-semibold text-ink">Question Analysis</caption><tbody>{[['Answered', answered], ['Not Answered', questions.length - answered], ['Mark for Review', markedForReview]].map(([label, count]) => <tr key={label} className="border-b border-line last:border-b-0"><th scope="row" className="px-3 py-2 text-left font-normal text-ink-soft">{label}</th><td className="w-14 border-l border-line px-3 py-2 text-center"><span className="rounded bg-amber-100 px-2 py-0.5 font-semibold text-amber-900">{count}</span></td></tr>)}</tbody></table></div><Button variant="secondary" className="mt-5 w-full" onClick={() => setPaperOpen(true)}>Question Paper</Button>{(error || localError) && <p role="alert" className="mt-4 text-xs text-red-600">{localError || error}</p>}</aside>
      </main>
      {question && <footer aria-label="Question navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-soft sm:px-6"><div className="flex items-center justify-between gap-3"><Button variant="secondary" disabled={index === 0 || saving} onClick={() => go(index - 1)}>Previous</Button>{lastQuestionSaved && <p role="status" className="text-center text-xs font-semibold leading-5 text-brand-700">Reached the last question of the exam.<br />You may revise your answers.</p>}<Button disabled={expired || saving || lastQuestionSaved} onClick={() => save(false)}>Save & Next</Button></div></footer>}
      {paperOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"><section role="dialog" aria-modal="true" aria-labelledby="question-paper-title" className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 sm:p-8"><div className="flex items-center justify-between gap-3"><h2 id="question-paper-title" className="text-lg font-bold">Question Paper</h2><Button variant="ghost" onClick={() => setPaperOpen(false)} aria-label="Close question paper"><XIcon className="h-5 w-5" /></Button></div><div className="mt-5 space-y-6">{questions.map((item, number) => <div key={item._id}><div className={`flex gap-2 ${questionTextClass}`}><span>{number + 1}.</span><RichText value={item.text} /></div><ol className={`mt-2 list-[upper-alpha] space-y-1 pl-6 text-ink-soft ${optionTextClass}`}>{item.options.map((option, optionIndex) => <li key={optionIndex}><RichText value={option} className="option-rich-text" /></li>)}</ol></div>)}</div></section></div>}
    </>}
  </div>;
}
