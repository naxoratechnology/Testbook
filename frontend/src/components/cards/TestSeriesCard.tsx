import React from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, LanguagesIcon, ListChecksIcon, SignalIcon } from 'lucide-react';
import { TestSeries } from '../../types';
import { Badge, btn } from '../ui/Primitives';

export function TestSeriesCard({ series }: {series: TestSeries;}) {
  const free = series.type === 'free';
  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition-shadow duration-200 ease-smooth hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{series.exam}</p>
        <Badge tone={free ? 'green' : 'violet'}>{free ? 'Free' : 'Premium'}</Badge>
      </div>
      <h3 className="mt-2 text-[15px] font-semibold leading-snug text-ink">
        <Link to={`/test-series/${series.id}`} className="hover:text-brand-700">
          {series.title}
        </Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">{series.description}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-[13px]">
        <div className="flex items-center gap-2 text-ink-soft">
          <ListChecksIcon className="h-4 w-4 text-ink-muted" />
          <span>{series.tests.length} tests</span>
        </div>
        <div className="flex items-center gap-2 text-ink-soft">
          <SignalIcon className="h-4 w-4 text-ink-muted" />
          <span>{series.difficulty}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-soft">
          <ClockIcon className="h-4 w-4 text-ink-muted" />
          <span>{series.tests[0]?.duration ?? 60} min / test</span>
        </div>
        <div className="flex items-center gap-2 text-ink-soft">
          <LanguagesIcon className="h-4 w-4 text-ink-muted" />
          <span>{series.languages}</span>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="text-xs text-ink-muted">{series.totalQuestions.toLocaleString('en-IN')} questions</span>
        <Link to={`/test-series/${series.id}`} className={btn('secondary', 'sm')}>
          View Tests
        </Link>
      </div>
    </article>);

}