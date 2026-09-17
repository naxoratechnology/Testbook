import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { TestAttempt } from '../components/tests/TestAttempt';
import { fetchPublicSeries, submitTestAttempt } from '../services/test-series/testSeries.slice';
import type { AppDispatch, RootState } from '../store';

export function TestInterface() {
  const { seriesId = '', testId = '' } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { publicCurrent: series, loading, saving, error } = useSelector((state: RootState) => state.testSeries);
  const test = series?._id === seriesId ? series.tests.find((item) => item._id === testId) : undefined;
  useEffect(() => { if (!series || series._id !== seriesId) dispatch(fetchPublicSeries(seriesId)); }, [dispatch, series, seriesId]);
  if (loading || !test || !series) return <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-ink-muted">{error || 'Loading test...'}</div>;
  return <TestAttempt key={test._id} title={`${series.title} — ${test.title}`} questions={test.questions} duration={test.duration} languages={series.languages} saving={saving} error={error} onExit={() => navigate(`/test-series/${seriesId}`)} onSubmit={async (answers) => {
    await dispatch(submitTestAttempt({ seriesId, testId, answers })).unwrap();
    navigate(`/test-series/${seriesId}/tests/${testId}/result`);
  }} />;
}
