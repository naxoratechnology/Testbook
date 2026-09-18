import { BookmarkButton } from '../components/tests/BookmarkButton';
import { ReportQuestionButton } from '../components/tests/ReportQuestionButton';
import { useAuth } from '../contexts/AuthContext';
import { SolutionReview } from '../components/tests/SolutionReview';
import { TestAttempt } from '../components/tests/TestAttempt';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageShell } from '../components/ui/PageShell';
import { btn } from '../components/ui/Primitives';
import { fetchPublicPreviousPapers, submitPreviousPaperAttempt } from '../services/previous-papers/previousPapers.slice';
import type { AppDispatch, RootState } from '../store';

export function PreviousPaperTest() {
  const { user } = useAuth(); const { paperId = '' } = useParams(); const [search] = useSearchParams(); const [solutionIndex, setSolutionIndex] = useState(0); const [completedHereId, setCompletedHereId] = useState(''); const reattempt = search.get('reattempt') === '1'; const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate(); const { publicItems, attemptResult, loading, saving, error } = useSelector((state: RootState) => state.previousPapers);
  useEffect(() => { dispatch(fetchPublicPreviousPapers()); }, [dispatch, user?.id]);
  const paper = publicItems.find((item) => item._id === paperId); const result = attemptResult?.paper === paperId && (!reattempt || attemptResult._id === completedHereId) ? attemptResult : null;
  if (loading && !paper) return <PageShell title="Previous Paper Test"><p className="py-12 text-center text-sm text-ink-muted">Loading test...</p></PageShell>;
  if (!paper) return <PageShell title="Test not found"><p className="mb-5 text-sm text-red-600">{error || 'This paper is unavailable.'}</p><Link to="/previous-papers" className={btn('primary', 'md')}>Back to Papers</Link></PageShell>;
  if (!user && paper.unlocked) return <PageShell title="Login to Attempt Test"><Link to={'/login?redirect=' + encodeURIComponent('/previous-papers/' + paperId + '/test')} className={btn('primary', 'md')}>Login</Link></PageShell>;
  if (!user || !paper.unlocked) return <PageShell title="Previous Papers Pass Required"><p className="mb-5 text-sm text-ink-muted">Purchase the All Previous Papers Pass to unlock every paper PDF and test.</p><Link to="/previous-papers?checkout=1" className={btn('primary', 'md')}>Purchase All Papers</Link></PageShell>;
  if (!result) return <TestAttempt key={paperId} title={paper.title} questions={paper.questions} duration={paper.duration} saving={saving} error={error} onExit={() => navigate('/previous-papers')} onSubmit={async (answers) => { const submitted = await dispatch(submitPreviousPaperAttempt({ id: paperId, answers })).unwrap(); setSolutionIndex(0); setCompletedHereId(submitted._id); window.scrollTo({ top: 0 }); }} />;
  return <PageShell title={paper.title} width="max-w-4xl" actions={<div className="flex flex-wrap gap-2"><Link to={`/previous-papers/${paperId}/solutions`} className={btn('primary', 'md')}>View Solution</Link><Link to={`/previous-papers/${paperId}/test?reattempt=1`} onClick={() => setCompletedHereId('')} className={btn('secondary', 'md')}>Reattempt Test</Link></div>}><nav className="mb-5 text-sm text-ink-muted"><Link to="/previous-papers" className="hover:text-brand-700">Previous Papers</Link><span className="mx-2">/</span><span>Online Test</span></nav><p className="mt-2 text-sm text-ink-muted">{paper.questions.length} questions · {paper.duration || 'No time limit'}{paper.duration ? ' minutes' : ''}</p>
    {<><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Score', `${result.score}/${result.totalMarks}`], ['Correct', result.correct], ['Incorrect', result.incorrect], ['Skipped', result.unanswered]].map(([label, value]) => <div key={label} className="rounded-xl border border-line bg-white p-4 text-center"><p className="text-xs text-ink-muted">{label}</p><p className="mt-1 text-xl font-bold text-ink">{value}</p></div>)}</div><div className="mt-6"><SolutionReview key={result._id} result={{ ...result, questions: result.questions.map((question) => ({ ...question, _id: question._id || '' })) }} index={solutionIndex} onJump={setSolutionIndex} name={user.name} actions={<><BookmarkButton key={result.questions[solutionIndex]._id} reference={{ source: 'previous-paper', sourceId: paperId, questionId: result.questions[solutionIndex]._id || '' }} /><ReportQuestionButton key={result.questions[solutionIndex]._id} reference={{ source: 'previous-paper', sourceId: paperId, questionId: result.questions[solutionIndex]._id || '' }} /></>} navigation={<Link to="/previous-papers" className={btn('ghost', 'sm')}>Back to Papers</Link>} /></div></>}
  </PageShell>;
}
