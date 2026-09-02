import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2Icon, CircleSlashIcon, XCircleIcon } from 'lucide-react';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, FilterChips, Progress, btn } from '../components/ui/Primitives';
import { useViewer } from '../contexts/ViewerContext';
import { buildQuestions } from '../data/questions';
import { AttemptResult } from '../types';
import { findTest } from '../data/testSeries';

function demoResult(testId: string): AttemptResult {
  const questions = buildQuestions(100);
  const answers: Record<string, number | null> = {};
  questions.forEach((q, i) => {
    if (i % 6 === 5) return;
    answers[q.id] = i % 5 === 4 ? (q.correct + 1) % 4 : q.correct;
  });
  const found = findTest(testId);
  return {
    testId,
    testTitle: found ? `${found.series.exam} — ${found.test.title}` : 'SSC CGL Mock Test 01',
    total: 200,
    score: 156,
    attempted: 82,
    unanswered: 18,
    correct: 66,
    incorrect: 16,
    accuracy: 86,
    percent: 78,
    sections: [
    { name: 'Quantitative', percent: 82 },
    { name: 'Reasoning', percent: 91 },
    { name: 'English', percent: 76 },
    { name: 'GK', percent: 64 }],

    answers,
    questions,
    date: '29 Aug 2026'
  };
}

const tabs = ['All', 'Correct', 'Incorrect', 'Skipped'];

export function TestResult() {
  const { testId = '' } = useParams();
  const { lastResult } = useViewer();
  const [tab, setTab] = useState('All');

  const result = useMemo(
    () => lastResult && lastResult.testId === testId ? lastResult : demoResult(testId),
    [lastResult, testId]
  );

  const rows = useMemo(() => {
    const list = result.questions.map((q, i) => {
      const answer = result.answers[q.id];
      const state = answer === null || answer === undefined ? 'Skipped' : answer === q.correct ? 'Correct' : 'Incorrect';
      return { q, i, answer, state };
    });
    return tab === 'All' ? list.slice(0, 20) : list.filter((r) => r.state === tab).slice(0, 20);
  }, [result, tab]);

  return (
    <PageShell>
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge tone="green">Test Completed 🎉</Badge>
            <h1 className="mt-3 text-xl font-bold tracking-tight text-ink sm:text-2xl">{result.testTitle}</h1>
            <p className="mt-1.5 text-[13px] text-ink-muted">Attempted on {result.date}</p>
            <div className="mt-6 flex items-end gap-3">
              <p className="text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">{result.score}</p>
              <p className="pb-1.5 text-xl font-semibold text-ink-muted">/ {result.total}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={`/test/${testId}/solutions`} className={btn('primary', 'md')}>
                View Solutions
              </Link>
              <Link to="/test-series" className={btn('secondary', 'md')}>
                Back to test series
              </Link>
            </div>
          </div>

          <dl className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto lg:max-w-none">
            {[
            ['Score', `${result.percent}%`],
            ['Accuracy', `${result.accuracy}%`],
            ['Attempted', String(result.attempted)],
            ['Unanswered', String(result.unanswered)]].
            map(([label, value]) =>
            <div key={label} className="rounded-xl border border-line px-4 py-3.5 text-center">
                <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">{label}</dt>
                <dd className="mt-1.5 text-xl font-bold tabular-nums text-ink">{value}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Panel>
          <h2 className="text-base font-semibold text-ink">Section performance</h2>
          <ul className="mt-4 space-y-4">
            {result.sections.map((section) =>
            <li key={section.name}>
                <div className="mb-1.5 flex justify-between text-[13px]">
                  <span className="text-ink-soft">{section.name}</span>
                  <span className="font-semibold text-ink">{section.percent}%</span>
                </div>
                <Progress value={section.percent} />
              </li>
            )}
          </ul>
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5 text-center">
            {[
            [result.correct, 'Correct', 'text-emerald-600'],
            [result.incorrect, 'Incorrect', 'text-red-600'],
            [result.unanswered, 'Skipped', 'text-ink-muted']].
            map(([value, label, color]) =>
            <div key={label as string}>
                <p className={`text-lg font-bold tabular-nums ${color}`}>{value as number}</p>
                <p className="text-xs text-ink-muted">{label as string}</p>
              </div>
            )}
          </div>
        </Panel>

        <Panel padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-ink">Question analysis</h2>
            <FilterChips options={tabs} value={tab} onChange={setTab} />
          </div>
          <ul className="divide-y divide-line">
            {rows.length === 0 ?
            <li className="px-5 py-10 text-center text-sm text-ink-soft">No {tab.toLowerCase()} questions.</li> :

            rows.map(({ q, i, answer, state }) =>
            <li key={q.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-canvas text-[12px] font-semibold tabular-nums text-ink-soft">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-ink">Question {i + 1}</p>
                    <p className="text-xs text-ink-muted">
                      Your answer:{' '}
                      <span className="font-medium text-ink-soft">
                        {answer === null || answer === undefined ? '—' : String.fromCharCode(65 + answer)}
                      </span>{' '}
                      · Correct answer:{' '}
                      <span className="font-medium text-emerald-600">{String.fromCharCode(65 + q.correct)}</span>
                    </p>
                  </div>
                  <span className="shrink-0">
                    {state === 'Correct' && <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />}
                    {state === 'Incorrect' && <XCircleIcon className="h-4 w-4 text-red-500" />}
                    {state === 'Skipped' && <CircleSlashIcon className="h-4 w-4 text-ink-muted" />}
                  </span>
                  <Link
                to={`/test/${testId}/solutions?q=${i + 1}`}
                className="shrink-0 text-[13px] font-medium text-brand-700 hover:underline">
                
                    View Solution
                  </Link>
                </li>
            )
            }
          </ul>
        </Panel>
      </div>
    </PageShell>);

}