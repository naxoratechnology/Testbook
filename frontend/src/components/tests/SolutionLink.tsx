import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { btn } from '../ui/Primitives';
import { fetchReviewAttempts } from '../../services/question-review/questionReview.slice';
import type { ReviewReference } from '../../services/question-review/questionReview.api';
import type { AppDispatch, RootState } from '../../store';

export function useAttemptedTests(source: ReviewReference['source']) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const { ownerId, attempts } = useSelector((state: RootState) => state.questionReview);
  useEffect(() => { if (user) void dispatch(fetchReviewAttempts({ userId: user.id, source })); }, [dispatch, user?.id, source]);
  return user && ownerId === user.id ? attempts[source] || [] : [];
}
export function SolutionLink({ reference, attempted }: { reference: ReviewReference; attempted: boolean }) {
  if (!attempted && reference.source !== 'previous-paper') return null;
  const href = reference.source === 'test-series' ? `/test-series/${reference.sourceId}/tests/${reference.testId}/solutions` : reference.source === 'current-affairs' ? `/current-affairs/${reference.sourceId}/solutions` : `/previous-papers/${reference.sourceId}/solutions`;
  return <Link to={href} className={btn('secondary', 'sm')}>Solution</Link>;
}
