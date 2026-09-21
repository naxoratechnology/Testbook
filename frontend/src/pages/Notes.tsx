import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeftIcon, FileTextIcon, FolderOpenIcon, NotebookTextIcon, SearchIcon } from 'lucide-react';
import { PageShell } from '../components/ui/PageShell';
import { Badge, EmptyState, btn, inputClass } from '../components/ui/Primitives';
import { Table, TableWrap, Td, Th } from '../components/admin/DataTable';
import { useViewer } from '../contexts/ViewerContext';
import { fetchPublicNotes } from '../services/notes/notes.slice';
import type { AdminNote } from '../services/notes/notes.api';
import type { AppDispatch, RootState } from '../store';

const collectionName = (note: AdminNote) => note.subject?.trim() || 'General notes';

export function Notes() {
  const { collectionName: routeCollection } = useParams();
  const selectedCollection = routeCollection ? decodeURIComponent(routeCollection) : '';
  const dispatch = useDispatch<AppDispatch>();
  const { openPdf } = useViewer();
  const { publicItems, loading, error } = useSelector((state: RootState) => state.notes);
  const [query, setQuery] = useState('');

  useEffect(() => { dispatch(fetchPublicNotes()); }, [dispatch]);

  const collections = useMemo(() => {
    const grouped = new Map<string, AdminNote[]>();
    publicItems.forEach((note) => {
      const name = collectionName(note);
      grouped.set(name, [...(grouped.get(name) || []), note]);
    });
    return [...grouped.entries()].map(([name, notes]) => ({
      name,
      notes,
      thumbnail: notes.find((note) => note.thumbnail)?.thumbnail,
      exams: [...new Set(notes.map((note) => note.exam).filter(Boolean))],
    }));
  }, [publicItems]);

  const visibleCollections = useMemo(() => collections.filter((collection) => {
    const term = query.trim().toLowerCase();
    return !term || `${collection.name} ${collection.exams.join(' ')} ${collection.notes.map((note) => note.name).join(' ')}`.toLowerCase().includes(term);
  }), [collections, query]);

  const notes = useMemo(() => publicItems.filter((note) => collectionName(note) === selectedCollection && (!query.trim() || `${note.name} ${note.exam} ${note.description}`.toLowerCase().includes(query.trim().toLowerCase()))), [publicItems, query, selectedCollection]);

  const read = (note: AdminNote) => openPdf({
    title: note.name,
    subtitle: [note.exam, collectionName(note)].filter(Boolean).join(' · '),
    module: 'notes',
    url: note.pdfUrl,
    pages: [],
  });

  if (selectedCollection) {
    return <PageShell title={selectedCollection} subtitle="Choose a document to open it in the secure PDF reader.">
      <Link to="/notes" className={btn('secondary', 'sm', 'mb-5')}><ArrowLeftIcon className="h-4 w-4" />All note collections</Link>
      <div className="mb-6 max-w-sm"><div className="relative"><SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search in this collection..." className={`${inputClass} pl-10`} /></div></div>
      {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? <p className="py-12 text-center text-sm text-ink-muted">Loading notes...</p> : !notes.length ? <EmptyState icon={<NotebookTextIcon className="h-5 w-5" />} title="No notes available." description="Published notes in this collection will appear here." /> : <TableWrap footer={`${notes.length} note document${notes.length === 1 ? '' : 's'}`}><Table><thead><tr><Th>Notes</Th><Th>Exam</Th><Th>Pages</Th><Th>Added</Th><Th className="text-right">Action</Th></tr></thead><tbody>{notes.map((note) => <tr key={note._id} className="hover:bg-canvas/60"><Td><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500"><FileTextIcon className="h-5 w-5" /></span><div className="min-w-0"><p className="font-medium text-ink">{note.name}</p><p className="max-w-md truncate text-xs text-ink-muted">{note.description || 'PDF notes'}</p></div></div></Td><Td><Badge tone="brand">{note.exam}</Badge></Td><Td>{note.pages || '—'}</Td><Td className="whitespace-nowrap">{new Date(note.createdAt).toLocaleDateString('en-IN')}</Td><Td><div className="flex justify-end"><button type="button" onClick={() => read(note)} className={btn('secondary', 'sm')}><FileTextIcon className="h-4 w-4" />Read Notes</button></div></Td></tr>)}</tbody></Table></TableWrap>}
    </PageShell>;
  }

  return <PageShell title="Study Notes" subtitle="Browse subject collections and open published PDFs in the secure reader.">
    <div className="mb-6 max-w-sm"><div className="relative"><SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search collections..." className={`${inputClass} pl-10`} /></div></div>
    {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {loading ? <p className="py-12 text-center text-sm text-ink-muted">Loading note collections...</p> : !visibleCollections.length ? <EmptyState icon={<NotebookTextIcon className="h-5 w-5" />} title="No note collections available." description="Published notes will appear here." /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{visibleCollections.map((collection) => <Link key={collection.name} to={`/notes/${encodeURIComponent(collection.name)}`} className="group overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft"><div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-50 to-sky-100">{collection.thumbnail ? <img src={collection.thumbnail} alt={collection.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center"><FolderOpenIcon className="h-12 w-12 text-brand-600" /></div>}</div><div className="p-4"><div className="flex items-start justify-between gap-3"><h2 className="font-semibold text-ink">{collection.name}</h2><Badge tone="brand">{collection.notes.length}</Badge></div><p className="mt-2 truncate text-xs text-ink-muted">{collection.exams.join(' · ') || 'Study notes'}</p><p className="mt-4 text-sm font-medium text-brand-700">View all notes →</p></div></Link>)}</div>}
  </PageShell>;
}
