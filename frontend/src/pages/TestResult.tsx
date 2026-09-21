import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';
import { TestAnalytics } from '../components/tests/TestAnalytics';
import { testSeriesApiService } from '../services/test-series/testSeries.api';
import type { RootState } from '../store';

export function TestResult() {
  const { seriesId = '', testId = '' } = useParams();
  const result = useSelector((state: RootState) => state.testSeries.attemptResult);
  const [attemptNumber, setAttemptNumber] = useState<number>();
  useEffect(() => {
    setAttemptNumber(undefined);
    if (!result || result.test !== testId || result.series !== seriesId) return;
    let active = true;
    void testSeriesApiService.results(seriesId).then(response => {
      if (!active) return;
      const attempts: { _id: string; test: string }[] = response.data.data.results;
      const sameTest = attempts.filter(item => item.test === testId);
      const position = sameTest.findIndex(item => item._id === result._id);
      if (position >= 0) setAttemptNumber(sameTest.length - position);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [result?._id, seriesId, testId]);
  if (!result || result.test !== testId || result.series !== seriesId) return <Navigate to={`/test-series/${seriesId}`} replace />;
  return <TestAnalytics title={result.testTitle} result={result} attemptNumber={attemptNumber} back={`/test-series/${seriesId}`} solutions={`/test-series/${seriesId}/tests/${testId}/solutions`} reattempt={`/test-series/${seriesId}/tests/${testId}?reattempt=1`} />;
}
