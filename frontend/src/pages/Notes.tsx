import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, FileTextIcon, FolderOpenIcon, LockKeyholeIcon, NotebookTextIcon, SearchIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, Button, EmptyState, btn, inputClass } from '../components/ui/Primitives';
import { Table, TableWrap, Td, Th } from '../components/admin/DataTable';
import { useViewer } from '../contexts/ViewerContext';
import { fetchPublicNotes } from '../services/notes/notes.slice';
import { notesApiService } from '../services/notes/notes.api';
import type { AdminNote } from '../services/notes/notes.api';
import type { AppDispatch, RootState } from '../store';
import { useAuth } from '../contexts/AuthContext';

declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void }; } }

const loadRazorpay = () => new Promise<boolean>((resolve) => { if (window.Razorpay) return resolve(true); const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = () => resolve(true); script.onerror = () => resolve(false); document.body.appendChild(script); });
const decode = (value: string) => decodeURIComponent(value || '');
const subjectName = (note: AdminNote) => note.subject?.trim() || 'General notes';
type ExamCollection = { exam: string; notes: AdminNote[]; thumbnail?: string; subjects: string[]; access: 'free' | 'paid'; price: number; hasAccess: boolean; purchaseNote: AdminNote };

export function Notes() {
  const { exam: routeExam, subject: routeSubject } = useParams();
  const exam = routeExam ? decode(routeExam) : '';
  const subject = routeSubject ? decode(routeSubject) : '';
  const dispatch = useDispatch<AppDispatch>();
  const { openPdf } = useViewer();
  const { user } = useAuth();
  const { publicItems, loading, error } = useSelector((state: RootState) => state.notes);
  const [query, setQuery] = useState('');

  useEffect(() => { dispatch(fetchPublicNotes()); }, [dispatch]);
  const exams = useMemo<ExamCollection[]>(() => {
    const grouped = new Map<string, AdminNote[]>();
    publicItems.forEach((note) => grouped.set(note.exam, [...(grouped.get(note.exam) || []), note]));
    return [...grouped.entries()].map(([examName, notes]) => {
      const paidNote = notes.find((note) => note.access === 'paid');
      const purchaseNote = paidNote || notes[0];
      return { exam: examName, notes, thumbnail: notes.find((note) => note.thumbnail)?.thumbnail, subjects: [...new Set(notes.map(subjectName))], access: paidNote ? 'paid' : 'free', price: paidNote?.price || 0, hasAccess: !paidNote || Boolean(paidNote.hasAccess), purchaseNote };
    }).sort((a, b) => a.exam.localeCompare(b.exam));
  }, [publicItems]);
  const selectedExam = useMemo(() => exams.find((item) => item.exam === exam), [exams, exam]);
  const selectedNotes = useMemo(() => (selectedExam?.notes || []).filter((note) => subjectName(note) === subject && (!query.trim() || `${note.name} ${note.description}`.toLowerCase().includes(query.trim().toLowerCase()))), [query, selectedExam, subject]);
  const visibleExams = useMemo(() => exams.filter((item) => !query.trim() || `${item.exam} ${item.subjects.join(' ')} ${item.notes.map((note) => note.name).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())), [exams, query]);

  const purchase = async (collection: ExamCollection) => {
    if (collection.access !== 'paid' || collection.hasAccess) return;
    if (!user) { window.location.href = `/login?redirect=${encodeURIComponent(`/notes/${encodeURIComponent(collection.exam)}`)}`; return; }
    try {
      const data = (await notesApiService.checkout(collection.purchaseNote._id)).data.data;
      if (data.purchased || data.free) { await dispatch(fetchPublicNotes()); return; }
      if (!await loadRazorpay() || !window.Razorpay) throw new Error('Unable to load payment checkout.');
      new window.Razorpay({ key: data.keyId, amount: data.order.amount, currency: data.order.currency, name: 'Chandrabhaga Academy', description: data.title || `${collection.exam} Notes`, order_id: data.order.id, prefill: { name: user.name, email: user.email, contact: user.mobile }, theme: { color: '#f75c01' }, handler: async (payment: Record<string, string>) => { await notesApiService.verifyCheckout(collection.purchaseNote._id, payment); await dispatch(fetchPublicNotes()); } }).open();
    } catch (failure) { window.alert((failure as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Unable to purchase notes.'); }
  };
  const read = (note: AdminNote) => { if (!note.hasAccess) { if (selectedExam) void purchase(selectedExam); return; } openPdf({ title: note.name, subtitle: [note.exam, subjectName(note)].filter(Boolean).join(' · '), module: 'notes', url: note.pdfUrl, pages: [] }); };
  if (exam && !selectedExam && !loading) return <PageShell title="Notes not found"><EmptyState icon={<NotebookTextIcon className="h-5 w-5" />} title="This notes directory is unavailable." description="Choose an available exam notes directory." action={<Link to="/notes" className={btn('secondary', 'md')}>All notes</Link>} /></PageShell>;

  if (exam && !subject && selectedExam) return <PageShell title={`${selectedExam.exam} Notes`} subtitle="Choose a subject directory to view its note documents.">
    <Link to="/notes" className={btn('secondary', 'sm', 'mb-5')}><ArrowLeftIcon className="h-4 w-4" />All exam notes</Link>
    <Panel className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><h2 className="text-lg font-semibold text-ink">Complete {selectedExam.exam} notes</h2>{selectedExam.access === 'paid' ? <Badge tone="brand">₹{selectedExam.price}</Badge> : <Badge tone="green">Free</Badge>}</div><p className="mt-1 text-sm text-ink-muted">One purchase unlocks every note in every subject for this exam.</p></div>{selectedExam.access === 'paid' && (selectedExam.hasAccess ? <Badge tone="green">Access active</Badge> : <Button onClick={() => void purchase(selectedExam)}>Purchase all notes · ₹{selectedExam.price}</Button>)}</Panel>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{selectedExam.subjects.map((item) => { const count = selectedExam.notes.filter((note) => subjectName(note) === item).length; return <Link key={item} to={`/notes/${encodeURIComponent(selectedExam.exam)}/${encodeURIComponent(item)}`} className="group rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft"><div className="flex items-start justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><FolderOpenIcon className="h-5 w-5" /></span><Badge tone="slate">{count}</Badge></div><h2 className="mt-5 font-semibold text-ink">{item}</h2><p className="mt-2 text-sm text-ink-muted">{count} note document{count === 1 ? '' : 's'}</p><p className="mt-4 text-sm font-medium text-brand-700">Open subject →</p></Link>; })}</div>
  </PageShell>;

  if (exam && subject && selectedExam) return <PageShell title={subject} subtitle={`${selectedExam.exam} notes · Open documents in the secure PDF reader.`}>
    <Link to={`/notes/${encodeURIComponent(selectedExam.exam)}`} className={btn('secondary', 'sm', 'mb-5')}><ArrowLeftIcon className="h-4 w-4" />All {selectedExam.exam} subjects</Link>
    {selectedExam.access === 'paid' && !selectedExam.hasAccess && <Panel className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><b>Unlock all {selectedExam.exam} notes</b><p className="mt-1 text-sm text-ink-muted">This includes every subject and every note in this exam directory.</p></div><Button onClick={() => void purchase(selectedExam)}>Purchase all notes · ₹{selectedExam.price}</Button></Panel>}
    <div className="mb-6 max-w-sm"><div className="relative"><SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search in this subject..." className={`${inputClass} pl-10`} /></div></div>
    {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {loading ? <p className="py-12 text-center text-sm text-ink-muted">Loading notes...</p> : !selectedNotes.length ? <EmptyState icon={<NotebookTextIcon className="h-5 w-5" />} title="No notes available." description="Published notes in this subject will appear here." /> : <TableWrap footer={`${selectedNotes.length} note document${selectedNotes.length === 1 ? '' : 's'}`}><Table><thead><tr><Th>Notes</Th><Th>Pages</Th><Th>Added</Th><Th className="text-right">Action</Th></tr></thead><tbody>{selectedNotes.map((note) => <tr key={note._id} className="hover:bg-canvas/60"><Td><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500"><FileTextIcon className="h-5 w-5" /></span><div className="min-w-0"><p className="font-medium text-ink">{note.name}</p><p className="max-w-md truncate text-xs text-ink-muted">{note.description || 'PDF notes'}</p></div></div></Td><Td>{note.pages || '—'}</Td><Td className="whitespace-nowrap">{new Date(note.createdAt).toLocaleDateString('en-IN')}</Td><Td><div className="flex justify-end"><button type="button" onClick={() => read(note)} className={btn(note.hasAccess ? 'secondary' : 'primary', 'sm')}><FileTextIcon className="h-4 w-4" />{note.hasAccess ? 'Read notes' : 'Unlock notes'}</button></div></Td></tr>)}</tbody></Table></TableWrap>}
  </PageShell>;

  return <PageShell title="Study Notes" subtitle="Choose an exam, then a subject directory, to access complete study notes.">
    <div className="mb-6 max-w-sm"><div className="relative"><SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exam notes..." className={`${inputClass} pl-10`} /></div></div>
    {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {loading ? <p className="py-12 text-center text-sm text-ink-muted">Loading exam notes...</p> : !visibleExams.length ? <EmptyState icon={<NotebookTextIcon className="h-5 w-5" />} title="No exam notes available." description="Published notes will appear here." /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleExams.map((collection) => <div key={collection.exam} className="group overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand-300 hover:shadow-soft"><Link to={`/notes/${encodeURIComponent(collection.exam)}`} className="block"><div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-50 to-sky-100">{collection.thumbnail ? <img src={collection.thumbnail} alt={`${collection.exam} notes`} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center"><FolderOpenIcon className="h-12 w-12 text-brand-600" /></div>}</div></Link><div className="p-4"><div className="flex items-start justify-between gap-3"><Link to={`/notes/${encodeURIComponent(collection.exam)}`} className="font-semibold text-ink hover:text-brand-700">{collection.exam} Notes</Link>{collection.access === 'paid' ? <Badge tone="brand">₹{collection.price}</Badge> : <Badge tone="green">Free</Badge>}</div><p className="mt-2 text-xs text-ink-muted">{collection.subjects.length} subject{collection.subjects.length === 1 ? '' : 's'} · {collection.notes.length} note document{collection.notes.length === 1 ? '' : 's'}</p><div className="mt-4 flex items-center justify-between gap-3">{collection.hasAccess ? <span className="text-sm font-medium text-emerald-700">Access active</span> : <button type="button" onClick={() => void purchase(collection)} className={btn('primary', 'sm')}><LockKeyholeIcon className="h-4 w-4" />Buy all notes</button>}<Link to={`/notes/${encodeURIComponent(collection.exam)}`} className="text-sm font-medium text-brand-700">View details →</Link></div></div></div>)}</div>}
  </PageShell>;
}
