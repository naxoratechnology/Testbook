import React, { useMemo, useState } from 'react';
import { ListChecksIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { testSeriesList } from '../data/testSeries';
import { TestSeriesCard } from '../components/cards/TestSeriesCard';
import { PageShell } from '../components/ui/PageShell';
import { EmptyState, FilterChips, Select, btn } from '../components/ui/Primitives';

const kindFilters = [
{ label: 'All', value: 'all' },
{ label: 'Full Test', value: 'full' },
{ label: 'Sectional Test', value: 'sectional' },
{ label: 'Current Affairs', value: 'current-affairs' },
{ label: 'Previous Year', value: 'previous-year' }];


export function TestSeriesPage() {
  const [kind, setKind] = useState('All');
  const [price, setPrice] = useState('All');
  const [exam, setExam] = useState('All exams');

  const exams = ['All exams', ...Array.from(new Set(testSeriesList.map((s) => s.exam)))];

  const filtered = useMemo(() => {
    const kindValue = kindFilters.find((k) => k.label === kind)?.value ?? 'all';
    return testSeriesList.
    filter((s) => kindValue === 'all' ? true : s.kind === kindValue).
    filter((s) => price === 'All' ? true : s.type === price.toLowerCase()).
    filter((s) => exam === 'All exams' ? true : s.exam === exam);
  }, [kind, price, exam]);

  return (
    <PageShell title="Test Series" subtitle="Attempt real exam-pattern mocks and review every solution.">
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={exam} onChange={(e) => setExam(e.target.value)} className="sm:w-44" aria-label="Filter by exam">
            {exams.map((e) =>
            <option key={e}>{e}</option>
            )}
          </Select>
          <FilterChips options={['All', 'Free', 'Paid']} value={price} onChange={setPrice} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <FilterChips options={kindFilters.map((k) => k.label)} value={kind} onChange={setKind} />
          <p className="shrink-0 text-[13px] text-ink-muted">{filtered.length} series</p>
        </div>
      </div>

      {filtered.length === 0 ?
      <EmptyState
        icon={<ListChecksIcon className="h-5 w-5" />}
        title="No test series match these filters."
        description="Reset the filters or browse free sectional tests to get started."
        action={
        <Link to="/courses" className={btn('primary', 'md')}>
              Explore Courses
            </Link>
        } /> :


      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((series) =>
        <TestSeriesCard key={series.id} series={series} />
        )}
        </div>
      }
    </PageShell>);

}