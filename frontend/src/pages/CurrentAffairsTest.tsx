import { BookmarkButton } from '../components/tests/BookmarkButton';
import { ReportQuestionButton } from '../components/tests/ReportQuestionButton';
import { TestAttempt } from '../components/tests/TestAttempt';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageShell, Panel } from '../components/ui/PageShell';
import { btn } from '../components/ui/Primitives';
import { fetchPublicCurrentAffairs, submitCurrentAffairsAttempt } from '../services/current-affairs/currentAffairs.slice';
import type { AppDispatch, RootState } from '../store';

export function CurrentAffairsTest() {
  const { entryId = '' } = useParams(); const [search] = useSearchParams(); const [completedHereId, setCompletedHereId] = useState(''); const reattempt = search.get('reattempt') === '1'; const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate();
  const { publicItems, loading, saving, error, attemptResult } = useSelector((state: RootState) => state.currentAffairs);

  useEffect(() => { if (!publicItems.length) dispatch(fetchPublicCurrentAffairs()); }, [dispatch, publicItems.length]);
  const entry = publicItems.find((item) => item._id === entryId); const result = attemptResult?.currentAffairs === entryId && (!reattempt || attemptResult._id === completedHereId) ? attemptResult : null;
  if (loading && !entry) return <PageShell title="Daily Test"><p className="py-12 text-center text-sm text-ink-muted">Loading test...</p></PageShell>;
  if (!entry) return <PageShell title="Test not found"><p className="mb-5 text-sm text-red-600">{error || 'This current affairs test is unavailable.'}</p><Link to="/current-affairs" className={btn('primary', 'md')}>Back to Current Affairs</Link></PageShell>;
  if (!result) return <TestAttempt key={entryId} title={entry.title} questions={entry.questions} saving={saving} error={error} onExit={() => navigate('/current-affairs')} onSubmit={async (answers) => { const submitted = await dispatch(submitCurrentAffairsAttempt({ id: entryId, answers })).unwrap(); setCompletedHereId(submitted._id); window.scrollTo({ top: 0 }); }} />;
  return <PageShell width="max-w-4xl" actions={<div className="flex flex-wrap gap-2"><Link to={`/current-affairs/${entryId}/solutions`} className={btn('primary', 'md')}>View Solution</Link><Link to={`/current-affairs/${entryId}/test?reattempt=1`} onClick={() => setCompletedHereId('')} className={btn('secondary', 'md')}>Reattempt Test</Link></div>}><nav className="mb-5 text-sm text-ink-muted"><Link to="/current-affairs" className="hover:text-brand-700">Current Affairs</Link><span className="mx-2">/</span><span>Daily Test</span></nav>
    <div className="mb-6"><p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Daily current affairs test</p><h1 className="mt-2 text-2xl font-bold text-ink">{entry.title}</h1><p className="mt-1 text-sm text-ink-muted">{entry.questions.length} questions · {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
    {<><div className="grid grid-cols-3 gap-3">{[['Score', `${result.score}/${result.questions.length}`], ['Correct', result.correct], ['Incorrect', result.incorrect]].map(([label, value]) => <div key={label} className="rounded-xl border border-line bg-white p-4 text-center"><p className="text-xs text-ink-muted">{label}</p><p className="mt-1 text-xl font-bold text-ink">{value}</p></div>)}</div><div className="mt-6 space-y-4">{result.questions.map((question, index) => { const chosen = result.answers[question._id || '']; return <Panel key={question._id}>{question._id && <div className="mb-3 flex flex-wrap justify-end gap-2"><BookmarkButton reference={{ source: 'current-affairs', sourceId: entryId, questionId: question._id }} /><ReportQuestionButton reference={{ source: 'current-affairs', sourceId: entryId, questionId: question._id }} /></div>}<p className="font-medium text-ink">{index + 1}. {question.text}</p><div className="mt-3 space-y-2">{question.options.map((option, optionIndex) => <div key={optionIndex} className={`rounded-lg border p-3 text-sm ${optionIndex === question.correctAnswer ? 'border-emerald-300 bg-emerald-50' : optionIndex === chosen ? 'border-red-300 bg-red-50' : 'border-line'}`}>{String.fromCharCode(65 + optionIndex)}. {option}</div>)}</div>{question.explanation && <p className="mt-3 text-sm text-ink-soft"><strong className="text-ink">Explanation:</strong> {question.explanation}</p>}</Panel>; })}</div></>}
  </PageShell>;
}
