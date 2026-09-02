import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, ClockIcon, FileTextIcon, ListChecksIcon } from 'lucide-react';
import { currentAffairs } from '../data/content';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, btn } from '../components/ui/Primitives';
import { buildPdf, useViewer } from '../contexts/ViewerContext';

const pdfTopics = [
'National Affairs',
'International Affairs',
'Economy & Banking',
'Science & Technology',
'Sports & Awards',
'Appointments & Obituaries'];


export function CurrentAffairs() {
  const { openPdf } = useViewer();
  const [today, ...previous] = currentAffairs;

  return (
    <PageShell title="Today's Current Affairs" subtitle={today.date}>
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <Panel>
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="h-4 w-4 text-brand-600" />
            <h2 className="text-base font-semibold text-ink">Highlights</h2>
            <Badge tone="green" className="ml-auto">
              Free
            </Badge>
          </div>
          <ul className="mt-4 space-y-3">
            {today.highlights.map((item) =>
            <li key={item} className="flex gap-3 text-[14px] leading-relaxed text-ink-soft">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                {item}
              </li>
            )}
          </ul>
        </Panel>

        <div className="space-y-5">
          <Panel>
            <h2 className="text-base font-semibold text-ink">Today's Current Affairs Test</h2>
            <p className="mt-2 flex flex-wrap items-center gap-4 text-[13px] text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <ListChecksIcon className="h-4 w-4 text-ink-muted" /> {today.questions} questions
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 text-ink-muted" /> {today.minutes} minutes
              </span>
            </p>
            <Link to="/test/daily-ca-series-01" className={btn('primary', 'md', 'mt-4 w-full')}>
              Start Test
            </Link>
          </Panel>

          <Panel>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <FileTextIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-[15px] font-semibold text-ink">{today.title}</h2>
                <p className="text-xs text-ink-muted">12 pages · view only</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 rounded-xl border border-line bg-canvas p-4">
              {[92, 74, 84, 62, 78, 70].map((w, i) =>
              <div key={i} className="h-2 rounded bg-slate-200/70" style={{ width: `${w}%` }} />
              )}
            </div>
            <button
              type="button"
              onClick={() => openPdf(buildPdf(today.title, 'Current Affairs', 'current-affairs', pdfTopics))}
              className={btn('secondary', 'md', 'mt-4 w-full')}>
              
              Read PDF
            </button>
          </Panel>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink">Previous current affairs</h2>
        <p className="mt-1 text-[13px] text-ink-muted">Open any earlier day's capsule or test.</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previous.map((day) =>
          <li key={day.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{day.date}</p>
                {day.attempted ?
              <Badge tone="green">Score {day.score}/10</Badge> :

              <Badge tone="slate">Not started</Badge>
              }
              </div>
              <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">{day.highlights[0]}</p>
              <div className="mt-4 flex gap-2">
                <button
                type="button"
                onClick={() => openPdf(buildPdf(day.title, 'Current Affairs', 'current-affairs', pdfTopics))}
                className={btn('secondary', 'sm', 'flex-1')}>
                
                  Read PDF
                </button>
                {day.attempted ?
              <Link to="/test/daily-ca-series-01/result" className={btn('ghost', 'sm', 'flex-1')}>
                    View Result
                  </Link> :

              <Link to="/test/daily-ca-series-02" className={btn('primary', 'sm', 'flex-1')}>
                    Start Test
                  </Link>
              }
              </div>
            </li>
          )}
        </ul>
      </section>
    </PageShell>);

}