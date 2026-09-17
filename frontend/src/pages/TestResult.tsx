import React from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, btn } from '../components/ui/Primitives';
import type { RootState } from '../store';

export function TestResult() {
  const { seriesId = '', testId = '' } = useParams(); const result = useSelector((state: RootState) => state.testSeries.attemptResult);
  if (!result || result.test !== testId) return <Navigate to={`/test-series/${seriesId}`} replace />;
  const percent = result.totalMarks ? Math.max(0, Math.round((result.score / result.totalMarks) * 100)) : 0;
  return <PageShell><Panel><Badge tone="green">Test Completed</Badge><h1 className="mt-3 text-2xl font-bold text-ink">{result.testTitle}</h1><p className="mt-6 text-5xl font-extrabold text-ink">{result.score}<span className="text-xl text-ink-muted"> / {result.totalMarks}</span></p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Score', `${percent}%`], ['Accuracy', `${result.accuracy}%`], ['Correct', result.correct], ['Incorrect', result.incorrect]].map(([label, value]) => <div key={label} className="rounded-xl border border-line p-4 text-center"><p className="text-xs text-ink-muted">{label}</p><p className="mt-1 text-xl font-bold text-ink">{value}</p></div>)}</div><div className="mt-6 flex flex-wrap gap-3"><Link to={`/test-series/${seriesId}/tests/${testId}/solutions`} className={btn('primary', 'md')}>View Solutions</Link><Link to={`/test-series/${seriesId}/tests/${testId}?reattempt=1`} className={btn('secondary', 'md')}>Reattempt Test</Link><Link to={`/test-series/${seriesId}`} className={btn('secondary', 'md')}>Back to Series</Link></div></Panel></PageShell>;
}
