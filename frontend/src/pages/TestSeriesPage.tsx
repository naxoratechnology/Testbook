import { TestSeriesThumbnail } from '../components/courses/TestSeriesThumbnail';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ListChecksIcon } from 'lucide-react';
import { PageShell } from '../components/ui/PageShell';
import { Badge, EmptyState, FilterChips, Select, btn } from '../components/ui/Primitives';
import { fetchPublicTestSeries } from '../services/test-series/testSeries.slice';
import type { AppDispatch, RootState } from '../store';

export function TestSeriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { publicItems, loading, error } = useSelector((state: RootState) => state.testSeries);
  const [access, setAccess] = useState('All'); const [exam, setExam] = useState('All exams');
  useEffect(() => { dispatch(fetchPublicTestSeries()); }, [dispatch]);
  const exams = ['All exams', ...new Set(publicItems.map((item) => item.exam))];
  const items = useMemo(() => publicItems.filter((item) => (access === 'All' || item.access === access.toLowerCase()) && (exam === 'All exams' || item.exam === exam)), [publicItems, access, exam]);
  return <PageShell title="Test Series" subtitle="Attempt exam-pattern tests and get instant results.">
    <div className="mb-6 flex flex-col gap-3 sm:flex-row"><Select value={exam} onChange={(event) => setExam(event.target.value)} className="sm:w-48">{exams.map((value) => <option key={value}>{value}</option>)}</Select><FilterChips options={['All', 'Free', 'Paid']} value={access} onChange={setAccess} /></div>
    {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {loading ? <p className="py-12 text-center text-sm text-ink-muted">Loading test series...</p> : items.length === 0 ? <EmptyState icon={<ListChecksIcon className="h-5 w-5" />} title="No test series available." description="Published test series will appear here." /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((series) => { const questions = series.tests.reduce((sum, test) => sum + test.questions.length, 0); return <article key={series._id} className="flex flex-col rounded-2xl border border-line bg-white p-4 hover:shadow-soft"><TestSeriesThumbnail src={series.thumbnail} alt={series.title} className="mb-3 h-36 w-full sm:h-40 rounded-xl object-cover" /><div className="flex justify-between gap-3"><p className="text-xs font-semibold uppercase text-brand-600">{series.exam}</p><Badge tone={series.access === 'free' ? 'green' : 'violet'}>{series.access === 'free' ? 'Free' : `₹${series.price}`}</Badge></div><h2 className="mt-2 text-[15px] font-semibold text-ink">{series.title}</h2><p className="mt-2 line-clamp-2 text-sm text-ink-soft">{series.description}</p><p className="mt-3 text-xs text-ink-muted">{series.tests.length} tests · {questions} questions · {series.difficulty}</p><Link to={`/test-series/${series._id}`} className={btn('secondary', 'sm', 'mt-4 self-end')}>View Tests</Link></article>; })}</div>}
  </PageShell>;
}
