import { Link } from 'react-router-dom';
import { AwardIcon, CheckCircle2Icon, CircleHelpIcon, RotateCcwIcon, TargetIcon, XCircleIcon } from 'lucide-react';
import { Badge, btn } from '../ui/Primitives';

export interface AnalyticsResult {
  score: number;
  totalMarks: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  submittedAt?: string;
}

export function analyticsFor(result: AnalyticsResult) {
  const attempted = result.correct + result.incorrect;
  const total = attempted + result.unanswered;
  const accuracy = attempted ? Math.round((result.correct / attempted) * 100) : 0;
  return { attempted, total, accuracy };
}

export function TestAnalytics({ title, result, back, solutions, reattempt, attemptNumber, onReattempt }: { title: string; result: AnalyticsResult; back: string; solutions: string; reattempt: string; attemptNumber?: number; onReattempt?: () => void }) {
  const { attempted, total, accuracy } = analyticsFor(result);
  const marks = (value: number) => Number(value.toFixed(2)).toLocaleString('en-IN');
  const cards = [
    { label: 'Score', value: `${marks(result.score)} / ${marks(result.totalMarks)}`, Icon: AwardIcon, color: 'text-violet-600 bg-violet-50' },
    { label: 'Attempted', value: `${attempted} / ${total}`, Icon: CircleHelpIcon, color: 'text-sky-600 bg-sky-50' },
    { label: 'Accuracy', value: `${accuracy}%`, Icon: TargetIcon, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Correct', value: result.correct, Icon: CheckCircle2Icon, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Incorrect', value: result.incorrect, Icon: XCircleIcon, color: 'text-red-600 bg-red-50' },
    { label: 'Unanswered', value: result.unanswered, Icon: RotateCcwIcon, color: 'text-slate-600 bg-slate-100' },
  ];
  return <div className="min-h-screen bg-canvas">
    <header className="border-b border-line bg-white"><div className="mx-auto flex w-full flex-wrap items-center gap-3 px-4 py-4 sm:px-6"><h1 className="min-w-0 flex-1 truncate text-lg font-bold text-ink">{title}</h1><Link to={reattempt} onClick={onReattempt} className={btn('secondary', 'sm')}>Reattempt Test</Link><Link to={back} className={btn('ghost', 'sm')}>Go to Tests</Link><Link to={solutions} className={btn('primary', 'sm')}>Solutions</Link></div></header>
    <main className="mx-auto w-full max-w-6xl space-y-7 px-4 py-8 sm:px-6 sm:py-12">
      <div><Badge tone="green">Test completed</Badge><h2 className="mt-3 text-2xl font-bold text-ink">Overall Performance Summary</h2><p className="mt-2 text-sm text-ink-muted">{attemptNumber ? `Attempt ${attemptNumber}` : 'Your latest attempt'}{result.submittedAt && !Number.isNaN(Date.parse(result.submittedAt)) ? ` · Submitted ${new Date(result.submittedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(({ label, value, Icon, color }) => <div key={label} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${color}`}><Icon className="h-5 w-5" /></div><div><p className="text-xl font-bold text-ink">{value}</p><p className="text-sm text-ink-muted">{label}</p></div></div>)}</div>
      <div className="rounded-2xl border border-line bg-white p-6"><h3 className="font-semibold text-ink">Question breakdown</h3><p className="mt-2 text-sm text-ink-soft">You attempted {attempted} of {total} questions: {result.correct} correct, {result.incorrect} incorrect, and {result.unanswered} unanswered. Accuracy is based on attempted questions.</p><div className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`${result.correct} correct, ${result.incorrect} incorrect, ${result.unanswered} unanswered`}>{total > 0 && <><span className="bg-emerald-500" style={{ width: `${result.correct / total * 100}%` }} /><span className="bg-red-500" style={{ width: `${result.incorrect / total * 100}%` }} /></>}</div></div>
    </main>
  </div>;
}
