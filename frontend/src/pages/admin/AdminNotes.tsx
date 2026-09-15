import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell } from '../../components/ui/PageShell';
import { Badge, StatusBadge, btn } from '../../components/ui/Primitives';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';
import { deleteNote, fetchAdminNotes, updateNote } from '../../services/notes/notes.slice';
import type { AdminNote } from '../../services/notes/notes.api';
import type { AppDispatch, RootState } from '../../store';

export function AdminNotes() {
  const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate();
  const { items, loading, saving, error } = useSelector((state: RootState) => state.notes);
  useEffect(() => { dispatch(fetchAdminNotes()); }, [dispatch]);
  const toggle = async (note: AdminNote) => { await dispatch(updateNote({ id: note._id, payload: { name: note.name, description: note.description, exam: note.exam, subject: note.subject, status: note.status === 'published' ? 'unpublished' : 'published' } })); };
  const remove = async (id: string) => { if (window.confirm('Delete these notes and the uploaded PDF?')) await dispatch(deleteNote(id)); };
  const view = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  return <PageShell title="Notes" subtitle="Upload PDF notes. Students can read them in the viewer — downloads stay disabled." width="max-w-[1400px]" actions={<Link to="/admin/notes/new" className={btn('primary', 'md')}><PlusIcon className="h-4 w-4" /> Upload Notes</Link>}>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
    <TableWrap footer={loading ? 'Loading notes...' : `${items.length} note documents`}><Table><thead><tr><Th>Title</Th><Th>Exam</Th><Th>Subject</Th><Th>Pages</Th><Th>Status</Th><Th>Created</Th><Th className="text-right">Actions</Th></tr></thead><tbody>
      {!loading && items.length === 0 && <tr><td colSpan={7} className="border-b border-line px-5 py-10 text-center text-sm text-ink-muted">No notes uploaded yet.</td></tr>}{items.map((note) => <tr key={note._id} className="transition-colors hover:bg-canvas/60"><Td><p className="font-medium text-ink">{note.name}</p><p className="max-w-xs truncate text-xs text-ink-muted">{note.description || 'PDF notes'}</p></Td><Td>{note.exam}</Td><Td>{note.subject}</Td><Td className="tabular-nums">{note.pages || '—'}</Td><Td><div className="flex items-center gap-2"><StatusBadge status={note.status} /><Badge tone="slate">View only</Badge></div></Td><Td className="whitespace-nowrap text-ink-muted">{new Date(note.createdAt).toLocaleDateString('en-IN')}</Td><Td><RowActions onView={() => view(note.pdfUrl)} onEdit={() => navigate(`/admin/notes/${note._id}/edit`)} onDelete={() => remove(note._id)} extra={<button type="button" disabled={saving} onClick={() => toggle(note)} className={btn('secondary', 'sm', 'mr-1')}>{note.status === 'published' ? 'Unpublish' : 'Publish'}</button>} /></Td></tr>)}
    </tbody></Table></TableWrap>
  </PageShell>;
}
