import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClockIcon, FileQuestionIcon, LanguagesIcon, ListChecksIcon } from 'lucide-react';
import { getSeries } from '../data/testSeries';
import { PageShell, Panel, StatCard } from '../components/ui/PageShell';
import { Badge, StatusBadge, btn } from '../components/ui/Primitives';

export function TestSeriesDetail() {
  const { seriesId = '' } = useParams();
  const series = getSeries(seriesId);

  if (!series) {
    return (
      <PageShell title="Test series not found">
        <Link to="/test-series" className={btn('primary', 'md')}>
          Back to test series
        </Link>
      </PageShell>);

  }

  const free = series.type === 'free';

  return (
    <PageShell>
      <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-ink-muted">
        <Link to="/test-series" className="hover:text-ink">
          Test Series
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-soft">{series.title}</span>
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{series.exam}</Badge>
        <Badge tone={free ? 'green' : 'violet'}>{free ? 'Free' : 'Premium'}</Badge>
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-[32px]">{series.title}</h1>
      <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-soft">{series.description}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tests" value={String(series.tests.length)} icon={<ListChecksIcon className="h-4 w-4" />} />
        <StatCard
          label="Questions"
          value={series.totalQuestions.toLocaleString('en-IN')}
          icon={<FileQuestionIcon className="h-4 w-4" />} />
        
        <StatCard
          label="Duration"
          value={`${series.tests[0]?.duration ?? 60} min`}
          hint="per test"
          icon={<ClockIcon className="h-4 w-4" />} />
        
        <StatCard label="Languages" value={series.languages} icon={<LanguagesIcon className="h-4 w-4" />} />
      </div>

      <Panel className="mt-6" padded={false}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-ink">All tests</h2>
          <p className="text-[13px] text-ink-muted">
            {series.tests.filter((t) => t.status === 'completed').length} completed
          </p>
        </div>
        <ul className="divide-y divide-line">
          {series.tests.map((test) => {
            const done = test.status === 'completed';
            return (
              <li
                key={test.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{test.title}</p>
                    <StatusBadge status={test.status} />
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
                    <span>{test.questions} questions</span>
                    <span>{test.duration} minutes</span>
                    <span>{test.marks} marks</span>
                    {done &&
                    <span className="font-semibold text-ink">
                        Score: {test.score} / {test.marks}
                      </span>
                    }
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {done ?
                  <>
                      <Link to={`/test/${test.id}/result`} className={btn('secondary', 'sm')}>
                        View Result
                      </Link>
                      <Link to={`/test/${test.id}`} className={btn('ghost', 'sm')}>
                        Re-attempt
                      </Link>
                    </> :

                  <Link to={`/test/${test.id}`} className={btn('primary', 'sm')}>
                      Start Test
                    </Link>
                  }
                </div>
              </li>);

          })}
        </ul>
      </Panel>
    </PageShell>);

}