import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DownloadIcon, FileTextIcon } from 'lucide-react';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, EmptyState, btn } from '../components/ui/Primitives';
import { useViewer } from '../contexts/ViewerContext';
import { fetchPublicSyllabus } from '../services/syllabus/syllabus.slice';
import type { AppDispatch, RootState } from '../store';

export function SyllabusPage() {
  const dispatch = useDispatch<AppDispatch>(); const { openPdf } = useViewer(); const { publicItems, loading, error } = useSelector((state: RootState) => state.syllabus);
  useEffect(() => { dispatch(fetchPublicSyllabus()); }, [dispatch]);
  return <PageShell title="Exam Syllabus" subtitle="Official syllabus PDFs available to view online or download.">
    {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {loading ? <Panel><p className="text-sm text-ink-muted">Loading syllabus...</p></Panel> : publicItems.length === 0 ? <EmptyState icon={<FileTextIcon className="h-5 w-5" />} title="No syllabus available." description="Published syllabus documents will appear here." /> : <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{publicItems.map((item) => <li key={item._id} className="flex h-full flex-col rounded-2xl border border-line bg-white p-5"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><FileTextIcon className="h-5 w-5" /></span><div className="min-w-0"><h2 className="font-semibold leading-snug text-ink">{item.name}</h2><div className="mt-1 flex gap-1.5"><Badge tone="slate">PDF</Badge><Badge tone="green">Downloadable</Badge></div></div></div><p className="mt-4 text-xs text-ink-muted">Updated: {new Date(item.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p><div className="mt-auto flex gap-2 pt-5"><button onClick={() => openPdf({ title: item.name, subtitle: 'Official syllabus', module: 'syllabus', url: item.pdfUrl, pages: [] })} className={btn('primary', 'sm', 'flex-1')}>View Syllabus</button><a href={item.pdfUrl} download className={btn('secondary', 'sm', 'flex-1')}><DownloadIcon className="h-4 w-4" /> Download</a></div></li>)}</ul>}
  </PageShell>;
}
