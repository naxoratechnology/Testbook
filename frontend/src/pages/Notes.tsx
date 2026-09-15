import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileTextIcon, NotebookTextIcon, SearchIcon } from 'lucide-react';
import { PageShell } from '../components/ui/PageShell';
import { Badge, EmptyState, FilterChips, btn, inputClass } from '../components/ui/Primitives';
import { useViewer } from '../contexts/ViewerContext';
import { fetchPublicNotes } from '../services/notes/notes.slice';
import type { AppDispatch, RootState } from '../store';

export function Notes() {
  const dispatch = useDispatch<AppDispatch>(); const { openPdf } = useViewer();
  const { publicItems, loading, error } = useSelector((state: RootState) => state.notes);
  const [query, setQuery] = useState(''); const [subject, setSubject] = useState('All');
  useEffect(() => { dispatch(fetchPublicNotes()); }, [dispatch]);
  const subjects = ['All', ...new Set(publicItems.map((note) => note.subject).filter(Boolean))];
  const filtered = useMemo(() => publicItems.filter((note) => (subject === 'All' || note.subject === subject) && (!query.trim() || `${note.name} ${note.exam} ${note.subject} ${note.description}`.toLowerCase().includes(query.toLowerCase()))), [publicItems, query, subject]);
  return <PageShell title="Study Notes" subtitle="Open published PDF notes in the secure, scrollable reader.">
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"><div className="relative sm:w-72"><SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes..." className={`${inputClass} pl-10`} /></div><FilterChips options={subjects} value={subject} onChange={setSubject} /></div>
    {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {loading ? <p className="py-12 text-center text-sm text-ink-muted">Loading notes...</p> : filtered.length === 0 ? <EmptyState icon={<NotebookTextIcon className="h-5 w-5" />} title="No notes available." description="Published notes will appear here." /> : <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((note) => <li key={note._id} className="flex flex-col rounded-2xl border border-line bg-white p-5 hover:shadow-soft"><div className="flex items-start gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500"><FileTextIcon className="h-5 w-5" /></span><div><h2 className="font-semibold text-ink">{note.name}</h2><div className="mt-1 flex gap-1.5"><Badge tone="slate">PDF</Badge>{note.exam && <Badge tone="brand">{note.exam}</Badge>}</div></div></div>{note.description && <p className="mt-4 line-clamp-2 text-sm text-ink-soft">{note.description}</p>}<button onClick={() => openPdf({ title: note.name, subtitle: [note.exam, note.subject].filter(Boolean).join(' · '), module: 'notes', url: note.pdfUrl, pages: [] })} className={btn('secondary', 'md', 'mt-5 w-full')}>Read Notes</button></li>)}</ul>}
  </PageShell>;
}
