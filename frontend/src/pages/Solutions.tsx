import { SolutionReview } from '../components/tests/SolutionReview';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';
import { BookmarkButton } from '../components/tests/BookmarkButton';
import { ReportQuestionButton } from '../components/tests/ReportQuestionButton';
import { PageShell } from '../components/ui/PageShell';
import { btn } from '../components/ui/Primitives';
import { useAuth } from '../contexts/AuthContext';
import { fetchReviewSolution } from '../services/question-review/questionReview.slice';
import type { ReviewResult } from '../services/question-review/questionReview.api';
import type { QuestionSource } from '../services/bookmarks/bookmarks.api';
import type { AppDispatch, RootState } from '../store';

export function Solutions({ source = 'test-series' }: { source?: QuestionSource }) {
  const { seriesId = '', testId = '', entryId = '', paperId = '' } = useParams();
  const location = useLocation();
  const sourceId = source === 'test-series' ? seriesId : source === 'current-affairs' ? entryId : paperId;
  const { user } = useAuth(); const dispatch = useDispatch<AppDispatch>();
  const currentAttempt = useSelector((state: RootState) => state.testSeries.attemptResult);
  const [loaded, setLoaded] = useState<{ owner: string; key: string; result: ReviewResult } | null>(null);
  const [index, setIndex] = useState(0); const [error, setError] = useState('');
  const key = `${source}:${sourceId}:${testId}`;
  useEffect(() => {
    let active = true; setLoaded(null); setError(''); setIndex(0);
    if (user) void dispatch(fetchReviewSolution({ source, sourceId, ...(source === 'test-series' ? { testId } : {}) })).unwrap().then((result) => { if (active) setLoaded({ owner: user.id, key, result }); }).catch((failure) => { if (active) setError(String(failure)); });
    return () => { active = false; };
  }, [dispatch, user?.id, source, sourceId, testId, key]);
  const back = source === 'test-series' ? `/test-series/${seriesId}` : source === 'current-affairs' ? '/current-affairs' : '/previous-papers';
  const result = loaded?.owner === user?.id && loaded?.key === key ? loaded.result : null;
  useEffect(() => {
    if (!result) return;
    const original = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [Boolean(result)]);
  if (!user) return <PageShell title="Solutions" subtitle={source === 'previous-paper' ? 'Log in to view paper answers and explanations.' : 'Log in to view your attempted test solutions.'}><Link to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} className={btn('primary', 'md')}>Login</Link></PageShell>;
  if (!result) return <PageShell title="Solutions"><p role={error ? 'alert' : undefined} className={error ? 'text-sm text-red-600' : 'text-sm text-ink-muted'}>{error || 'Loading solutions...'}</p>{error && <Link to={back} className={btn('secondary', 'md', 'mt-4')}>Back to Tests</Link>}</PageShell>;
  const question = result.questions[index];
  if (!question) return <PageShell title="Solutions"><Link to={back} className={btn('secondary', 'md')}>Back to Tests</Link></PageShell>;
  const hasResult = source === 'test-series' && currentAttempt?.series === seriesId && currentAttempt?.test === testId;
  const reference = { source, sourceId, ...(source === 'test-series' ? { testId } : {}), questionId: question._id };
  return <div className="fixed inset-0 z-50 h-[100dvh] w-full overflow-y-auto bg-canvas text-ink">
    <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center gap-3 border-b border-line bg-white px-4 py-3 sm:px-6">
      <Link to={back} className={btn('danger', 'sm', 'shrink-0 font-semibold')}>Back to Tests</Link>
      <h1 className="order-last w-full min-w-0 text-sm font-semibold sm:order-none sm:w-auto sm:flex-1 sm:text-base">{result.title}</h1>
    </header>
    <main className="w-full p-4 sm:p-6"><p className="mb-4 text-sm text-ink-muted">{result.preview ? 'Read correct answers and explanations before attempting the paper.' : 'Review your answers and explanations.'}</p>
    <SolutionReview key={result._id} result={result} index={index} onJump={setIndex} name={user.name} actions={<><BookmarkButton reference={reference} /><ReportQuestionButton reference={reference} /></>} navigation={<Link to={hasResult ? `/test-series/${seriesId}/tests/${testId}/result` : back} className={btn('ghost', 'sm')}>{hasResult ? 'Result' : 'Back to Tests'}</Link>} />
    </main>
  </div>;
}
