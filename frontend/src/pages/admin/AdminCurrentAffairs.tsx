import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell } from '../../components/ui/PageShell';
import { Badge, StatusBadge, btn } from '../../components/ui/Primitives';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';
import { deleteCurrentAffairs, fetchAdminCurrentAffairs, updateCurrentAffairs } from '../../services/current-affairs/currentAffairs.slice';
import type { AdminCurrentAffairsEntry } from '../../services/current-affairs/currentAffairs.api';
import type { AppDispatch, RootState } from '../../store';

export function AdminCurrentAffairs() {
  const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate();
  const { items, loading, saving, error } = useSelector((state: RootState) => state.currentAffairs);
  useEffect(() => { dispatch(fetchAdminCurrentAffairs()); }, [dispatch]);
  const toggle = async (entry: AdminCurrentAffairsEntry) => { await dispatch(updateCurrentAffairs({ id: entry._id, payload: { date: entry.date, title: entry.title, exam: entry.exam, highlights: entry.highlights, questions: entry.questions, status: entry.status === 'published' ? 'unpublished' : 'published' } })); };
  const remove = async (id: string) => { if (window.confirm('Delete this current affairs entry, PDF and daily test?')) await dispatch(deleteCurrentAffairs(id)); };
  return <PageShell title="Current Affairs" subtitle="Publish the daily capsule, PDF and current affairs test." width="max-w-[1400px]" actions={<Link to="/admin/current-affairs/new" className={btn('primary', 'md')}><PlusIcon className="h-4 w-4" /> Add Daily Current Affairs</Link>}>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
    <TableWrap footer={loading ? 'Loading current affairs...' : `${items.length} daily entries`}><Table><thead><tr><Th>Date</Th><Th>Title</Th><Th>Exam</Th><Th>Questions</Th><Th>PDF</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead><tbody>
      {!loading && items.length === 0 && <tr><td colSpan={7} className="border-b border-line px-5 py-10 text-center text-sm text-ink-muted">No current affairs entries yet.</td></tr>}{items.map((entry) => <tr key={entry._id} className="transition-colors hover:bg-canvas/60"><Td className="whitespace-nowrap font-medium text-ink">{new Date(entry.date).toLocaleDateString('en-IN')}</Td><Td><p className="font-medium text-ink">{entry.title}</p><p className="max-w-xs truncate text-xs text-ink-muted">{entry.highlights[0] || 'Daily current affairs'}</p></Td><Td>{entry.exam}</Td><Td className="tabular-nums">{entry.questions.length}</Td><Td><Badge tone="slate">PDF</Badge></Td><Td><StatusBadge status={entry.status} /></Td><Td><RowActions onView={() => window.open(entry.pdfUrl, '_blank', 'noopener,noreferrer')} onEdit={() => navigate(`/admin/current-affairs/${entry._id}/edit`)} onDelete={() => remove(entry._id)} extra={<button type="button" disabled={saving} onClick={() => toggle(entry)} className={btn('secondary', 'sm', 'mr-1')}>{entry.status === 'published' ? 'Unpublish' : 'Publish'}</button>} /></Td></tr>)}
    </tbody></Table></TableWrap>
  </PageShell>;
}
