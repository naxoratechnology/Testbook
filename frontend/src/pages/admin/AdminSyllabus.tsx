import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DownloadIcon, PlusIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell } from '../../components/ui/PageShell';
import { Badge, StatusBadge, btn } from '../../components/ui/Primitives';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';
import { deleteSyllabus, fetchAdminSyllabus, updateSyllabus } from '../../services/syllabus/syllabus.slice';
import type { AdminSyllabusDocument } from '../../services/syllabus/syllabus.api';
import type { AppDispatch, RootState } from '../../store';

export function AdminSyllabus() {
  const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate(); const { items, loading, saving, error } = useSelector((state: RootState) => state.syllabus);
  useEffect(() => { dispatch(fetchAdminSyllabus()); }, [dispatch]);
  const toggle = async (item: AdminSyllabusDocument) => { await dispatch(updateSyllabus({ id: item._id, payload: { name: item.name, status: item.status === 'published' ? 'unpublished' : 'published' } })); };
  const remove = async (id: string) => { if (window.confirm('Delete this syllabus and its PDF?')) await dispatch(deleteSyllabus(id)); };
  return <PageShell title="Syllabus" subtitle="The only module where students are allowed to download the PDF." width="max-w-[1400px]" actions={<Link to="/admin/syllabus/new" className={btn('primary', 'md')}><PlusIcon className="h-4 w-4" /> Upload Syllabus</Link>}>
    {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}<TableWrap footer={loading ? 'Loading syllabus...' : `${items.length} syllabus documents`}><Table><thead><tr><Th>Name</Th><Th>Updated</Th><Th>Permissions</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead><tbody>{!loading && !items.length && <tr><td colSpan={5} className="border-b border-line px-5 py-10 text-center text-sm text-ink-muted">No syllabus documents uploaded yet.</td></tr>}{items.map((item) => <tr key={item._id} className="hover:bg-canvas/60"><Td className="font-medium text-ink">{item.name}</Td><Td className="whitespace-nowrap text-ink-muted">{new Date(item.updatedAt).toLocaleDateString('en-IN')}</Td><Td><Badge tone="green">View + Download</Badge></Td><Td><StatusBadge status={item.status} /></Td><Td><RowActions onView={() => window.open(item.pdfUrl, '_blank', 'noopener,noreferrer')} onEdit={() => navigate(`/admin/syllabus/${item._id}/edit`)} onDelete={() => remove(item._id)} extra={<><a href={item.pdfUrl} download target="_blank" rel="noreferrer" aria-label="Download" className="mr-1 flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-canvas hover:text-ink"><DownloadIcon className="h-4 w-4" /></a><button type="button" disabled={saving} onClick={() => toggle(item)} className={btn('secondary', 'sm', 'mr-1')}>{item.status === 'published' ? 'Unpublish' : 'Publish'}</button></>} /></Td></tr>)}</tbody></Table></TableWrap>
  </PageShell>;
}
