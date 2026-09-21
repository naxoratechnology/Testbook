import { TestAttempt } from '../components/tests/TestAttempt';
import { TestAnalytics } from '../components/tests/TestAnalytics';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageShell } from '../components/ui/PageShell';
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
  return <TestAnalytics title={entry.title} result={{ ...result, totalMarks: result.questions.length, submittedAt: (result as typeof result & { submittedAt?: string }).submittedAt }} back="/current-affairs" solutions={`/current-affairs/${entryId}/solutions`} reattempt={`/current-affairs/${entryId}/test?reattempt=1`} onReattempt={() => setCompletedHereId('')} />;
}
