import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell } from '../../components/ui/PageShell';
import { Badge, StatusBadge, btn } from '../../components/ui/Primitives';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';
import { deleteNotice, fetchAdminNotices, updateNotice } from '../../services/notices/notices.slice';
import type { Notice } from '../../services/notices/notices.api';
import type { AppDispatch, RootState } from '../../store';

export function AdminNotices() {
  const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate(); const { items, loading, saving, error } = useSelector((state: RootState) => state.notices);
  useEffect(() => { dispatch(fetchAdminNotices()); }, [dispatch]);
  const toggle = async (notice: Notice) => { const { _id, createdAt, ...payload } = notice; await dispatch(updateNotice({ id: _id, payload: { ...payload, status: notice.status === 'published' ? 'unpublished' : 'published' } })); };
  const remove = async (id: string) => { if (window.confirm('Delete this notice?')) await dispatch(deleteNotice(id)); };
  return <PageShell title="Notices" subtitle="Manage vacancies, job posts and general public notices." width="max-w-[1400px]" actions={<Link to="/admin/notices/new" className={btn('primary', 'md')}><PlusIcon className="h-4 w-4" /> Create Notice</Link>}>
    {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}<TableWrap footer={loading ? 'Loading notices...' : `${items.length} notices`}><Table><thead><tr><Th>Title</Th><Th>Type</Th><Th>Organization</Th><Th>Last date</Th><Th>Status</Th><Th>Created</Th><Th className="text-right">Actions</Th></tr></thead><tbody>{!loading && !items.length && <tr><td colSpan={7} className="border-b border-line px-5 py-10 text-center text-sm text-ink-muted">No notices created yet.</td></tr>}{items.map((notice) => <tr key={notice._id} className="hover:bg-canvas/60"><Td><p className="font-medium text-ink">{notice.title}</p><p className="max-w-xs truncate text-xs text-ink-muted">{notice.description}</p></Td><Td><Badge tone="brand">{notice.type === 'job' ? 'Job Post' : notice.type}</Badge></Td><Td>{notice.organization || '—'}</Td><Td>{notice.lastDate ? new Date(notice.lastDate).toLocaleDateString('en-IN') : '—'}</Td><Td><StatusBadge status={notice.status} /></Td><Td>{new Date(notice.createdAt).toLocaleDateString('en-IN')}</Td><Td><RowActions onView={() => navigate('/notices')} onEdit={() => navigate(`/admin/notices/${notice._id}/edit`)} onDelete={() => remove(notice._id)} extra={<button type="button" disabled={saving} onClick={() => toggle(notice)} className={btn('secondary', 'sm', 'mr-1')}>{notice.status === 'published' ? 'Unpublish' : 'Publish'}</button>} /></Td></tr>)}</tbody></Table></TableWrap>
  </PageShell>;
}
