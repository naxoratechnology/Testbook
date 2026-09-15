import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell } from '../../components/ui/PageShell';
import { Badge, StatusBadge, btn } from '../../components/ui/Primitives';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';
import { deletePreviousPaper, fetchAdminPreviousPapers, updatePreviousPaper } from '../../services/previous-papers/previousPapers.slice';
import type { AdminPreviousPaper } from '../../services/previous-papers/previousPapers.api';
import type { AppDispatch, RootState } from '../../store';
export function AdminPreviousPapers() {
  const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate(); const { items, loading, saving, error } = useSelector((state: RootState) => state.previousPapers);
  useEffect(() => { dispatch(fetchAdminPreviousPapers()); }, [dispatch]);
  const toggle = async (paper: AdminPreviousPaper) => { const { _id, pdfUrl, createdAt, updatedAt, ...payload } = paper; await dispatch(updatePreviousPaper({ id: _id, payload: { ...payload, status: paper.status === 'published' ? 'unpublished' : 'published' } })); };
  const remove = async (id: string) => { if (window.confirm('Delete this paper, PDF and its online test?')) await dispatch(deletePreviousPaper(id)); };
  return <PageShell title="Previous Year Papers" subtitle="Upload paper PDFs and optionally create online tests." width="max-w-[1400px]" actions={<Link to="/admin/previous-papers/new" className={btn('primary', 'md')}><PlusIcon className="h-4 w-4" /> Add Previous Paper</Link>}>
    {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}<TableWrap footer={loading ? 'Loading papers...' : `${items.length} papers`}><Table><thead><tr><Th>Paper</Th><Th>Exam</Th><Th>Year</Th><Th>Shift</Th><Th>Online test</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead><tbody>{!loading && !items.length && <tr><td colSpan={7} className="border-b border-line px-5 py-10 text-center text-sm text-ink-muted">No previous papers uploaded yet.</td></tr>}{items.map((paper) => <tr key={paper._id} className="hover:bg-canvas/60"><Td><p className="font-medium text-ink">{paper.title}</p><p className="text-xs text-ink-muted">{paper.stage} · {paper.subject}</p></Td><Td>{paper.exam}</Td><Td>{paper.year}</Td><Td>{paper.shift || '—'}</Td><Td>{paper.questions.length ? <Badge tone="brand">{paper.questions.length} Q · {paper.duration} min</Badge> : <Badge tone="slate">PDF only</Badge>}</Td><Td><StatusBadge status={paper.status} /></Td><Td><RowActions onView={() => window.open(paper.pdfUrl, '_blank', 'noopener,noreferrer')} onEdit={() => navigate(`/admin/previous-papers/${paper._id}/edit`)} onDelete={() => remove(paper._id)} extra={<button type="button" disabled={saving} onClick={() => toggle(paper)} className={btn('secondary', 'sm', 'mr-1')}>{paper.status === 'published' ? 'Unpublish' : 'Publish'}</button>} /></Td></tr>)}</tbody></Table></TableWrap>
  </PageShell>;
}
