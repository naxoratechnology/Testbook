import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  CalendarDaysIcon,
  FileTextIcon,
  ListChecksIcon,
  NotebookTextIcon,
  ScrollTextIcon,
  SearchIcon,
  XIcon } from
'lucide-react';
import { useViewer } from '../../contexts/ViewerContext';
import { courses } from '../../data/courses';
import { testSeriesList } from '../../data/testSeries';
import { currentAffairs, notes, previousPapers, syllabusList } from '../../data/content';

interface Hit {
  group: string;
  icon: React.ReactNode;
  label: string;
  meta: string;
  href: string;
}

export function SearchDialog() {
  const { searchOpen, setSearchOpen } = useViewer();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (searchOpen) setQuery('');
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchOpen]);

  const all = useMemo<Hit[]>(() => {
    const hits: Hit[] = [];
    courses.forEach((c) =>
    hits.push({
      group: 'Courses',
      icon: <BookOpenIcon className="h-4 w-4" />,
      label: c.title,
      meta: `${c.exam} · ${c.lessons} lessons`,
      href: `/courses/${c.id}`
    })
    );
    testSeriesList.forEach((s) => {
      hits.push({
        group: 'Test Series',
        icon: <ListChecksIcon className="h-4 w-4" />,
        label: s.title,
        meta: `${s.exam} · ${s.tests.length} tests`,
        href: `/test-series/${s.id}`
      });
      s.tests.slice(0, 3).forEach((t) =>
      hits.push({
        group: 'Tests',
        icon: <ListChecksIcon className="h-4 w-4" />,
        label: `${s.title} — ${t.title}`,
        meta: `${t.questions} questions · ${t.duration} min`,
        href: `/test-series/${s.id}`
      })
      );
    });
    notes.forEach((n) =>
    hits.push({
      group: 'Notes',
      icon: <NotebookTextIcon className="h-4 w-4" />,
      label: n.title,
      meta: `${n.exam} · ${n.subject}`,
      href: '/notes'
    })
    );
    currentAffairs.forEach((c) =>
    hits.push({
      group: 'Current Affairs',
      icon: <CalendarDaysIcon className="h-4 w-4" />,
      label: c.title,
      meta: `${c.questions} questions`,
      href: '/current-affairs'
    })
    );
    previousPapers.forEach((p) =>
    hits.push({
      group: 'Previous Papers',
      icon: <FileTextIcon className="h-4 w-4" />,
      label: `${p.title} — ${p.shift}`,
      meta: `${p.exam} · ${p.year}`,
      href: '/previous-papers'
    })
    );
    syllabusList.forEach((s) =>
    hits.push({
      group: 'Syllabus',
      icon: <ScrollTextIcon className="h-4 w-4" />,
      label: s.title,
      meta: `Updated ${s.updated}`,
      href: '/syllabus'
    })
    );
    return hits;
  }, []);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ?
    all.filter((h) => (h.label + ' ' + h.meta).toLowerCase().includes(q)) :
    all.slice(0, 8);
    return filtered.reduce<Record<string, Hit[]>>((acc, hit) => {
      acc[hit.group] = [...(acc[hit.group] ?? []), hit];
      return acc;
    }, {});
  }, [all, query]);

  if (!searchOpen) return null;
  const totalResults = Object.values(grouped).reduce((a, b) => a + b.length, 0);

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/40 px-4 pt-[8vh] backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search PrepArena"
        className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-lift">
        
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchIcon className="h-[18px] w-[18px] text-ink-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, tests, notes, current affairs..."
            className="h-14 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-muted focus:outline-none" />
          
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-canvas hover:text-ink">
            
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {totalResults === 0 ?
          <p className="px-3 py-10 text-center text-sm text-ink-soft">
              No results for “{query}”. Try an exam name like SSC or Banking.
            </p> :

          Object.entries(grouped).map(([group, hits]) =>
          <div key={group} className="mb-2">
                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  {group} — {hits.length} result{hits.length === 1 ? '' : 's'}
                </p>
                {hits.map((hit) =>
            <Link
              key={hit.group + hit.label}
              to={hit.href}
              onClick={() => setSearchOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 ease-smooth hover:bg-canvas">
              
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      {hit.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{hit.label}</span>
                      <span className="block truncate text-xs text-ink-muted">{hit.meta}</span>
                    </span>
                  </Link>
            )}
              </div>
          )
          }
        </div>
      </div>
    </div>);

}