import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, FileTextIcon, ListChecksIcon } from 'lucide-react';
import { previousPapers } from '../data/content';
import { PageShell } from '../components/ui/PageShell';
import { Badge, EmptyState, Select, btn } from '../components/ui/Primitives';
import { buildPdf, useViewer } from '../contexts/ViewerContext';

export function PreviousPapers() {
  const { openPdf } = useViewer();
  const [exam, setExam] = useState('All exams');
  const [year, setYear] = useState('All years');
  const [subject, setSubject] = useState('All subjects');
  const [shift, setShift] = useState('All shifts');

  const options = {
    exams: ['All exams', ...Array.from(new Set(previousPapers.map((p) => p.exam)))],
    years: ['All years', ...Array.from(new Set(previousPapers.map((p) => String(p.year))))],
    subjects: ['All subjects', ...Array.from(new Set(previousPapers.map((p) => p.subject)))],
    shifts: ['All shifts', ...Array.from(new Set(previousPapers.map((p) => p.shift)))]
  };

  const filtered = useMemo(
    () =>
    previousPapers.
    filter((p) => p.status === 'published').
    filter((p) => exam === 'All exams' ? true : p.exam === exam).
    filter((p) => year === 'All years' ? true : String(p.year) === year).
    filter((p) => subject === 'All subjects' ? true : p.subject === subject).
    filter((p) => shift === 'All shifts' ? true : p.shift === shift),
    [exam, year, subject, shift]
  );

  return (
    <PageShell
      title="Previous Year Question Papers"
      subtitle="Read the original paper, or attempt it as a live online test where available.">
      
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={exam} onChange={(e) => setExam(e.target.value)} aria-label="Filter by exam">
          {options.exams.map((o) =>
          <option key={o}>{o}</option>
          )}
        </Select>
        <Select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Filter by year">
          {options.years.map((o) =>
          <option key={o}>{o}</option>
          )}
        </Select>
        <Select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Filter by subject">
          {options.subjects.map((o) =>
          <option key={o}>{o}</option>
          )}
        </Select>
        <Select value={shift} onChange={(e) => setShift(e.target.value)} aria-label="Filter by shift">
          {options.shifts.map((o) =>
          <option key={o}>{o}</option>
          )}
        </Select>
      </div>

      {filtered.length === 0 ?
      <EmptyState
        icon={<FileTextIcon className="h-5 w-5" />}
        title="No papers match these filters."
        description="Try a different year or exam to find an available paper."
        action={
        <Link to="/test-series" className={btn('primary', 'md')}>
              Explore Test Series
            </Link>
        } /> :


      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((paper) =>
        <li key={paper.id} className="flex h-full flex-col rounded-2xl border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
                    {paper.exam} · {paper.year}
                  </p>
                  <h2 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink">{paper.title}</h2>
                  <p className="mt-1 text-xs text-ink-muted">
                    {paper.stage} · {paper.shift} · {paper.subject}
                  </p>
                </div>
                <Badge tone="slate">PDF</Badge>
              </div>

              {paper.onlineTest &&
          <p className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-brand-50 px-3.5 py-2.5 text-xs text-brand-800">
                  <span className="inline-flex items-center gap-1.5">
                    <ListChecksIcon className="h-3.5 w-3.5" /> {paper.onlineTest.questions} questions
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon className="h-3.5 w-3.5" /> {paper.onlineTest.duration} minutes
                  </span>
                </p>
          }

              <div className="mt-5 flex gap-2 pt-0">
                <button
              type="button"
              onClick={() =>
              openPdf(
                buildPdf(
                  `${paper.title} — ${paper.shift}`,
                  `${paper.exam} ${paper.year} · Previous year paper`,
                  'previous-paper',
                  ['General Intelligence', 'General Awareness', 'Quantitative Aptitude', 'English Comprehension', 'Answer key']
                )
              )
              }
              className={btn('secondary', 'sm', 'flex-1')}>
              
                  View Paper
                </button>
                {paper.onlineTest &&
            <Link to={`/test/${paper.onlineTest.id}`} className={btn('primary', 'sm', 'flex-1')}>
                    Attempt Online
                  </Link>
            }
              </div>
            </li>
        )}
        </ul>
      }
    </PageShell>);

}