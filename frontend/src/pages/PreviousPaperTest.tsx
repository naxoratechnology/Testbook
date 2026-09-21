import { useAuth } from '../contexts/AuthContext';
import { TestAttempt } from '../components/tests/TestAttempt';
import { TestAnalytics } from '../components/tests/TestAnalytics';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageShell } from '../components/ui/PageShell';
import { btn } from '../components/ui/Primitives';
import { fetchPublicPreviousPapers, submitPreviousPaperAttempt } from '../services/previous-papers/previousPapers.slice';
import type { AppDispatch, RootState } from '../store';

export function PreviousPaperTest() {
  const { user } = useAuth(); const { paperId = '' } = useParams(); const [search] = useSearchParams(); const [completedHereId, setCompletedHereId] = useState(''); const reattempt = search.get('reattempt') === '1'; const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate(); const { publicItems, attemptResult, loading, saving, error } = useSelector((state: RootState) => state.previousPapers);
  useEffect(() => { dispatch(fetchPublicPreviousPapers()); }, [dispatch, user?.id]);
  const paper = publicItems.find((item) => item._id === paperId); const result = attemptResult?.paper === paperId && (!reattempt || attemptResult._id === completedHereId) ? attemptResult : null;
  if (loading && !paper) return <PageShell title="Previous Paper Test"><p className="py-12 text-center text-sm text-ink-muted">Loading test...</p></PageShell>;
  if (!paper) return <PageShell title="Test not found"><p className="mb-5 text-sm text-red-600">{error || 'This paper is unavailable.'}</p><Link to="/previous-papers" className={btn('primary', 'md')}>Back to Papers</Link></PageShell>;
  if (!user && paper.unlocked) return <PageShell title="Login to Attempt Test"><Link to={'/login?redirect=' + encodeURIComponent('/previous-papers/' + paperId + '/test')} className={btn('primary', 'md')}>Login</Link></PageShell>;
  if (!user || !paper.unlocked) return <PageShell title="Previous Papers Pass Required"><p className="mb-5 text-sm text-ink-muted">Purchase the All Previous Papers Pass to unlock every paper PDF and test.</p><Link to="/previous-papers?checkout=1" className={btn('primary', 'md')}>Purchase All Papers</Link></PageShell>;
  if (!result) return <TestAttempt key={paperId} title={paper.title} questions={paper.questions} duration={paper.duration} saving={saving} error={error} onExit={() => navigate('/previous-papers')} onSubmit={async (answers) => { const submitted = await dispatch(submitPreviousPaperAttempt({ id: paperId, answers })).unwrap(); setCompletedHereId(submitted._id); window.scrollTo({ top: 0 }); }} />;
  return <TestAnalytics title={paper.title} result={{ ...result, submittedAt: (result as typeof result & { submittedAt?: string }).submittedAt }} back="/previous-papers" solutions={`/previous-papers/${paperId}/solutions`} reattempt={`/previous-papers/${paperId}/test?reattempt=1`} onReattempt={() => setCompletedHereId('')} />;
}
