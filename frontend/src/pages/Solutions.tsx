import React, { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2Icon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, btn } from '../components/ui/Primitives';
import { useViewer } from '../contexts/ViewerContext';
import { buildQuestions } from '../data/questions';

export function Solutions() {
  const { testId = '' } = useParams();
  const [params] = useSearchParams();
  const { lastResult } = useViewer();

  const questions = useMemo(
    () => lastResult && lastResult.testId === testId ? lastResult.questions : buildQuestions(100),
    [lastResult, testId]
  );
  const answers = lastResult && lastResult.testId === testId ? lastResult.answers : {};

  const start = Math.min(Math.max(1, Number(params.get('q') ?? 12)), questions.length) - 1;
  const [index, setIndex] = useState(start);
  const question = questions[index];
  const given = answers[question.id];
  const isCorrect = given === question.correct;

  return (
    <PageShell width="max-w-4xl">
      <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-ink-muted">
        <Link to={`/test/${testId}/result`} className="hover:text-ink">
          Result
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-soft">Solutions</span>
      </nav>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-ink">Question {index + 1}</h1>
            <Badge tone="brand">{question.section}</Badge>
          </div>
          <p className="text-xs text-ink-muted">
            {index + 1} of {questions.length}
          </p>
        </div>

        <p className="mt-4 text-[16px] font-medium leading-relaxed text-ink">{question.text}</p>

        <ul className="mt-5 space-y-2.5">
          {question.options.map((option, i) => {
            const correct = i === question.correct;
            const chosen = given === i;
            return (
              <li
                key={option}
                className={`flex items-center gap-3.5 rounded-xl border p-3.5 ${
                correct ?
                'border-emerald-300 bg-emerald-50' :
                chosen ?
                'border-red-200 bg-red-50' :
                'border-line bg-white'}`
                }>
                
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[13px] font-semibold ${
                  correct ?
                  'border-emerald-500 bg-emerald-500 text-white' :
                  chosen ?
                  'border-red-400 bg-red-400 text-white' :
                  'border-line text-ink-soft'}`
                  }>
                  
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-[15px] text-ink">{option}</span>
                {correct && <CheckCircle2Icon className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />}
                {chosen && !correct &&
                <span className="ml-auto shrink-0 text-[11px] font-semibold text-red-600">Your answer</span>
                }
              </li>);

          })}
        </ul>

        <div className="mt-6 rounded-xl border border-line bg-canvas p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            <p className="text-ink-soft">
              Correct answer:{' '}
              <span className="font-semibold text-emerald-600">
                {String.fromCharCode(65 + question.correct)}
              </span>
            </p>
            <p className="text-ink-soft">
              Your answer:{' '}
              <span className={`font-semibold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                {given === null || given === undefined ? 'Not attempted' : String.fromCharCode(65 + given)}
              </span>
            </p>
            <p className="text-ink-muted">
              +{question.marks} / −{question.negative}
            </p>
          </div>
          <p className="mt-3.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Explanation</p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{question.explanation}</p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className={btn('secondary', 'md')}>
            
            <ChevronLeftIcon className="h-4 w-4" /> Previous
          </button>
          <Link to={`/test/${testId}/result`} className={btn('ghost', 'md')}>
            Back to result
          </Link>
          <button
            type="button"
            disabled={index === questions.length - 1}
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            className={btn('primary', 'md')}>
            
            Next <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </Panel>
    </PageShell>);

}