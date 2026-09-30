import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { TestAttempt } from '../components/tests/TestAttempt';
import { testSeriesApiService, type PublicTestDetail } from '../services/test-series/testSeries.api';
import { submitTestAttempt } from '../services/test-series/testSeries.slice';
import type { AppDispatch, RootState } from '../store';

export function TestInterface() {
  const { seriesId = '', testId = '' } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { saving, error } = useSelector((state: RootState) => state.testSeries);
  const [detail, setDetail] = useState<PublicTestDetail | null>(null);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    let active = true;
    setDetail(null); setLoadError('');
    testSeriesApiService.getPublicTest(seriesId, testId).then(({ data }) => { if (active) setDetail(data.data); }).catch((failure) => { if (active) setLoadError(failure?.response?.data?.message || 'Unable to load this test.'); });
    return () => { active = false; };
  }, [seriesId, testId]);
  if (!detail) return <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-ink-muted">{loadError || 'Loading test...'}</div>;
  const { series, test } = detail;
  return <TestAttempt key={test._id} title={`${series.title} — ${test.title}`} questions={test.questions} duration={test.duration} languages={series.languages} saving={saving} error={error} onExit={() => navigate(`/test-series/${seriesId}`)} onSubmit={async (answers) => {
    await dispatch(submitTestAttempt({ seriesId, testId, answers })).unwrap();
    navigate(`/test-series/${seriesId}/tests/${testId}/result`);
  }} />;
}
