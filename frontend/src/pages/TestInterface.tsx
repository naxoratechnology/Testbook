import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeftIcon, ClockIcon, FlagIcon, GridIcon, XIcon } from 'lucide-react';
import { findTest } from '../data/testSeries';
import { SECTIONS, buildQuestions } from '../data/questions';
import { AttemptResult } from '../types';
import { Button, btn } from '../components/ui/Primitives';
import { useViewer } from '../contexts/ViewerContext';

export function TestInterface() {
  const { testId = '' } = useParams();
  const navigate = useNavigate();
  const { saveResult } = useViewer();

  const found = findTest(testId);
  const meta = useMemo(
    () => ({
      title: found ? `${found.series.exam} — ${found.test.title}` : 'Practice Test',
      count: found?.test.questions ?? 20,
      duration: found?.test.duration ?? 20
    }),
    [found]
  );

  const questions = useMemo(() => buildQuestions(meta.count), [meta.count]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [marked, setMarked] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([questions[0]?.id]);
  const [selected, setSelected] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(meta.duration * 60);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const question = questions[index];

  useEffect(() => {
    setSelected(answers[question.id] ?? null);
    setVisited((v) => v.includes(question.id) ? v : [...v, question.id]);
  }, [index, question.id, answers]);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const submit = () => {
    let correct = 0;
    let incorrect = 0;
    let attempted = 0;
    questions.forEach((q) => {
      const a = answers[q.id];
      if (a === null || a === undefined) return;
      attempted += 1;
      if (a === q.correct) correct += 1;else
      incorrect += 1;
    });
    const total = questions.reduce((sum, q) => sum + q.marks, 0);
    const raw = correct * 2 - incorrect * 0.5;
    const score = Math.max(0, Math.round(raw));
    const sections = SECTIONS.map((name) => {
      const list = questions.filter((q) => q.section === name);
      const right = list.filter((q) => answers[q.id] === q.correct).length;
      return { name, percent: list.length ? Math.round(right / list.length * 100) : 0 };
    });
    const result: AttemptResult = {
      testId,
      testTitle: meta.title,
      total,
      score,
      attempted,
      unanswered: questions.length - attempted,
      correct,
      incorrect,
      accuracy: attempted ? Math.round(correct / attempted * 100) : 0,
      percent: total ? Math.round(score / total * 100) : 0,
      sections,
      answers,
      questions,
      date: '29 Aug 2026'
    };
    saveResult(result);
    navigate(`/test/${testId}/result`);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const stateOf = (qid: string) => {
    if (marked.includes(qid)) return 'marked';
    if (answers[qid] !== undefined && answers[qid] !== null) return 'answered';
    if (visited.includes(qid)) return 'not-answered';
    return 'not-visited';
  };

  const paletteColors: Record<string, string> = {
    answered: 'bg-emerald-500 text-white border-emerald-500',
    'not-answered': 'bg-red-50 text-red-600 border-red-200',
    marked: 'bg-violet-500 text-white border-violet-500',
    'not-visited': 'bg-white text-ink-soft border-line'
  };

  const counts = {
    answered: questions.filter((q) => stateOf(q.id) === 'answered').length,
    'not-answered': questions.filter((q) => stateOf(q.id) === 'not-answered').length,
    marked: marked.length,
    'not-visited': questions.filter((q) => stateOf(q.id) === 'not-visited').length
  };

  const palette =
  <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
        <p className="text-sm font-semibold text-ink">Question palette</p>
        <button
        type="button"
        onClick={() => setPaletteOpen(false)}
        aria-label="Close palette"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-canvas lg:hidden">
        
          <XIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 border-b border-line px-4 py-3 text-[11px]">
        {[
      ['answered', 'Answered'],
      ['not-answered', 'Not answered'],
      ['marked', 'Marked'],
      ['not-visited', 'Not visited']].
      map(([key, label]) =>
      <div key={key} className="flex items-center gap-2 text-ink-soft">
            <span className={`h-3 w-3 rounded border ${paletteColors[key]}`} />
            {label} ({counts[key as keyof typeof counts]})
          </div>
      )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-5">
          {questions.map((q, i) =>
        <button
          key={q.id}
          type="button"
          onClick={() => {
            setIndex(i);
            setPaletteOpen(false);
          }}
          className={`flex h-9 items-center justify-center rounded-lg border text-[13px] font-semibold tabular-nums transition-colors duration-150 ease-smooth ${
          paletteColors[stateOf(q.id)]} ${
          i === index ? 'ring-2 ring-brand-400 ring-offset-1' : ''}`}>
          
              {i + 1}
            </button>
        )}
        </div>
      </div>
      <div className="border-t border-line p-4">
        <Button variant="dark" className="w-full" onClick={() => setConfirmSubmit(true)}>
          Submit Test
        </Button>
      </div>
    </div>;


  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Exit test"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft hover:bg-canvas">
            
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{meta.title}</p>
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-bold tabular-nums ${
            seconds < 300 ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'}`
            }>
            
            <ClockIcon className="h-4 w-4" />
            {mm}:{ss}
          </div>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className={btn('secondary', 'sm', 'lg:hidden')}>
            
            <GridIcon className="h-4 w-4" />
            {index + 1}/{questions.length}
          </button>
          <Button
            variant="dark"
            size="sm"
            className="hidden lg:inline-flex"
            onClick={() => setConfirmSubmit(true)}>
            
            Submit Test
          </Button>
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-t border-line px-4 py-2 sm:px-6">
          {SECTIONS.map((section) => {
            const first = questions.findIndex((q) => q.section === section);
            const active = question.section === section;
            return (
              <button
                key={section}
                type="button"
                onClick={() => first > -1 && setIndex(first)}
                className={`h-8 shrink-0 rounded-lg px-3 text-[13px] font-medium transition-colors duration-150 ease-smooth ${
                active ? 'bg-brand-600 text-white' : 'bg-canvas text-ink-soft hover:text-ink'}`
                }>
                
                {section}
              </button>);

          })}
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_300px] lg:px-8">
        <div className="pb-28 lg:pb-0">
          <div className="rounded-2xl border border-line bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-brand-600">
                Question {index + 1}
              </p>
              <p className="text-xs text-ink-muted">
                +{question.marks} marks · −{question.negative} negative
              </p>
            </div>
            <h1 className="mt-3 text-lg font-semibold leading-relaxed text-ink sm:text-xl">{question.text}</h1>

            <fieldset className="mt-6 space-y-2.5">
              <legend className="sr-only">Select an option</legend>
              {question.options.map((option, i) => {
                const active = selected === i;
                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 transition-colors duration-150 ease-smooth ${
                    active ? 'border-brand-600 bg-brand-50' : 'border-line bg-white hover:bg-canvas'}`
                    }>
                    
                    <input
                      type="radio"
                      name={question.id}
                      checked={active}
                      onChange={() => setSelected(i)}
                      className="sr-only" />
                    
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[13px] font-semibold ${
                      active ? 'border-brand-600 bg-brand-600 text-white' : 'border-line text-ink-soft'}`
                      }>
                      
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={`text-[15px] ${active ? 'font-medium text-brand-900' : 'text-ink'}`}>
                      {option}
                    </span>
                  </label>);

              })}
            </fieldset>
          </div>
        </div>

        <aside className="hidden overflow-hidden rounded-2xl border border-line bg-white lg:block lg:sticky lg:top-[7.5rem] lg:h-[calc(100vh-9rem)]">
          {palette}
        </aside>
      </div>

      {/* Sticky controls */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-white px-4 py-3 sm:px-6 lg:static lg:border-t lg:px-0 lg:py-0">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 lg:px-8 lg:py-3">
          <button
            type="button"
            onClick={() =>
            setMarked((m) => m.includes(question.id) ? m.filter((id) => id !== question.id) : [...m, question.id])
            }
            className={btn(marked.includes(question.id) ? 'primary' : 'secondary', 'sm')}>
            
            <FlagIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Mark for Review</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setAnswers((a) => ({ ...a, [question.id]: null }));
            }}
            className={btn('secondary', 'sm')}>
            
            Clear Response
          </button>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className={btn('secondary', 'sm')}>
              
              Previous
            </button>
            <button
              type="button"
              onClick={() => {
                setAnswers((a) => ({ ...a, [question.id]: selected }));
                if (index === questions.length - 1) setConfirmSubmit(true);else
                setIndex((i) => i + 1);
              }}
              className={btn('primary', 'sm')}>
              
              Save &amp; Next
            </button>
          </div>
        </div>
      </div>

      {paletteOpen &&
      <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setPaletteOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[88%] max-w-sm bg-white shadow-lift">{palette}</div>
        </div>
      }

      {confirmSubmit &&
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
          <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift">
          
            <h2 className="text-lg font-bold text-ink">Submit this test?</h2>
            <p className="mt-2 text-sm text-ink-soft">
              You have answered {counts.answered} of {questions.length} questions. {counts['not-answered']} are
              left unanswered and {counts.marked} are marked for review.
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmSubmit(false)}>
                Keep attempting
              </Button>
              <Button className="flex-1" onClick={submit}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      }
    </div>);

}