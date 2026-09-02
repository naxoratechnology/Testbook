import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileTextIcon, NotebookTextIcon, SearchIcon } from 'lucide-react';
import { notes } from '../data/content';
import { PageShell } from '../components/ui/PageShell';
import { Badge, EmptyState, FilterChips, btn, inputClass } from '../components/ui/Primitives';
import { buildPdf, useViewer } from '../contexts/ViewerContext';

export function Notes() {
  const { openPdf } = useViewer();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('All');

  const subjects = ['All', ...Array.from(new Set(notes.map((n) => n.subject)))];

  const filtered = useMemo(
    () =>
    notes.
    filter((n) => n.status === 'published').
    filter((n) => subject === 'All' ? true : n.subject === subject).
    filter((n) =>
    query.trim() ? (n.title + n.exam + n.topic).toLowerCase().includes(query.toLowerCase()) : true
    ),
    [query, subject]
  );

  return (
    <PageShell title="Study Notes" subtitle="Curated PDF notes for quick revision. Open in the reader — view only.">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-72">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            aria-label="Search notes"
            className={`${inputClass} pl-10`} />
          
        </div>
        <FilterChips options={subjects} value={subject} onChange={setSubject} />
      </div>

      {filtered.length === 0 ?
      <EmptyState
        icon={<NotebookTextIcon className="h-5 w-5" />}
        title="No notes available."
        description="Notes for this subject are being prepared. Meanwhile, start a course."
        action={
        <Link to="/courses" className={btn('primary', 'md')}>
              Explore Courses
            </Link>
        } /> :


      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) =>
        <li
          key={note.id}
          className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition-shadow duration-200 ease-smooth hover:shadow-soft">
          
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <FileTextIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold leading-snug text-ink">{note.title}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone="slate">PDF</Badge>
                    <Badge tone="brand">{note.exam}</Badge>
                  </p>
                </div>
              </div>
              <p className="mt-3.5 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">{note.description}</p>
              <p className="mt-3 text-xs text-ink-muted">
                {note.topic} · {note.pages} pages
              </p>
              <button
            type="button"
            onClick={() =>
            openPdf(
              buildPdf(note.title, `${note.exam} · ${note.subject}`, 'notes', [
              'Chapter overview',
              'Formula and rule sheet',
              'Solved examples',
              'Practice questions',
              'Revision summary']
              )
            )
            }
            className={btn('secondary', 'md', 'mt-5 w-full')}>
            
                Read Notes
              </button>
            </li>
        )}
        </ul>
      }
    </PageShell>);

}