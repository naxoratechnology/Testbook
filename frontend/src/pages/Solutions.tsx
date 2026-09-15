import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PageShell, Panel } from '../components/ui/PageShell';
import { btn } from '../components/ui/Primitives';
import type { RootState } from '../store';

export function Solutions() {
  const { seriesId = '', testId = '' } = useParams(); const result = useSelector((state: RootState) => state.testSeries.attemptResult); const [index, setIndex] = useState(0);
  if (!result || result.test !== testId) return <Navigate to={`/test-series/${seriesId}`} replace />;
  const question = result.questions[index]; const answer = result.answers[question._id || ''];
  return <PageShell width="max-w-4xl"><Panel><p className="text-xs font-semibold text-brand-700">Question {index + 1} of {result.questions.length}</p><h1 className="mt-3 text-lg font-semibold text-ink">{question.text}</h1><div className="mt-5 space-y-2">{question.options.map((option, optionIndex) => <div key={optionIndex} className={`rounded-xl border p-4 text-sm ${optionIndex === question.correctAnswer ? 'border-emerald-300 bg-emerald-50' : optionIndex === answer ? 'border-red-300 bg-red-50' : 'border-line'}`}>{String.fromCharCode(65 + optionIndex)}. {option}</div>)}</div>{question.explanation && <div className="mt-5 rounded-xl bg-canvas p-4 text-sm text-ink-soft"><strong className="text-ink">Explanation: </strong>{question.explanation}</div>}<div className="mt-6 flex items-center justify-between"><button disabled={index === 0} onClick={() => setIndex((value) => value - 1)} className={btn('secondary', 'sm')}>Previous</button><Link to={`/test-series/${seriesId}/tests/${testId}/result`} className={btn('ghost', 'sm')}>Result</Link><button disabled={index === result.questions.length - 1} onClick={() => setIndex((value) => value + 1)} className={btn('primary', 'sm')}>Next</button></div></Panel></PageShell>;
}
