import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { FolderIcon, IndianRupeeIcon, PlusIcon, XIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell } from '../../components/ui/PageShell';
import { Badge, Button, Field, Input, Select, StatusBadge, btn } from '../../components/ui/Primitives';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';
import { fetchPaperCatalog, deletePreviousPaper, fetchAdminPreviousPapers, updatePreviousPaper } from '../../services/previous-papers/previousPapers.slice';
import { previousPapersApiService } from '../../services/previous-papers/previousPapers.api';
import type { AdminPreviousPaper } from '../../services/previous-papers/previousPapers.api';
import type { AppDispatch, RootState } from '../../store';
export function AdminPreviousPapers() {
  const [search] = useSearchParams(); const directory = search.get('directory') || ''; const [name, setName] = useState(''); const [creating, setCreating] = useState(false); const [directoryError, setDirectoryError] = useState('');
  const [modal, setModal] = useState<'collection' | 'price' | null>(null);
  const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate(); const { catalog, items, loading, saving, error } = useSelector((state: RootState) => state.previousPapers);
  useEffect(() => { dispatch(fetchAdminPreviousPapers()); dispatch(fetchPaperCatalog()); }, [dispatch]);
  const [access, setAccess] = useState<'free' | 'paid'>('paid');
  const [price, setPrice] = useState(''); const [priceSaving, setPriceSaving] = useState(false); const [priceMessage, setPriceMessage] = useState(''); const [priceError, setPriceError] = useState('');
  useEffect(() => { if (catalog) setPrice(String(catalog.price)); }, [catalog?.price]);
  const savePrice = async (event: React.FormEvent) => {
    event.preventDefault(); if (priceSaving) return; setPriceSaving(true); setPriceMessage(''); setPriceError('');
    try { await previousPapersApiService.updatePassPrice(access === 'free' ? 0 : Number(price), access); await dispatch(fetchPaperCatalog()).unwrap(); setPriceMessage('Pass price updated. Existing purchases remain active.'); setModal(null); }
    catch (failure) { setPriceError((failure as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Unable to update pass price.'); }
    finally { setPriceSaving(false); }
  };
  const toggle = async (paper: AdminPreviousPaper) => { const { _id, pdfUrl, createdAt, updatedAt, ...payload } = paper; await dispatch(updatePreviousPaper({ id: _id, payload: { ...payload, status: paper.status === 'published' ? 'unpublished' : 'published' } })); };
  const remove = async (id: string) => { if (window.confirm('Delete this paper, PDF and its online test?')) await dispatch(deletePreviousPaper(id)); };
  const createCollection = async (event: React.FormEvent) => {
    event.preventDefault(); if (creating) return; setCreating(true); setDirectoryError('');
    try { await previousPapersApiService.createDirectory(name.trim()); await dispatch(fetchPaperCatalog()).unwrap(); setName(''); setModal(null); }
    catch (failure) { setDirectoryError((failure as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Unable to create paper collection.'); }
    finally { setCreating(false); }
  };
  return <PageShell title={directory ? directory + ' Previous Papers' : 'Previous Year Paper Collections'} subtitle="Organize papers into collections. One shared pass unlocks all PDFs and online tests." width="max-w-[1400px]" actions={directory ? <Link to={'/admin/previous-papers/new?directory=' + encodeURIComponent(directory)} className={btn('primary', 'md')}><PlusIcon className="h-4 w-4" /> Add Previous Paper</Link> : <>
    <Button type="button" variant="secondary" disabled={!catalog} onClick={() => { setPrice(String(catalog?.price || '')); setAccess(catalog?.price === 0 ? 'free' : 'paid'); setPriceError(''); setModal('price'); }}><IndianRupeeIcon className="h-4 w-4" />Set Price</Button>
    <Button type="button" onClick={() => { setName(''); setDirectoryError(''); setModal('collection'); }}><PlusIcon className="h-4 w-4" />Create Paper Collection</Button>
  </>}>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
    {priceMessage && <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{priceMessage}</p>}
    {!directory ? <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-sm"><p className="text-ink-muted">{catalog?.directories.length ?? 0} collections</p><p className="text-ink-soft">All Papers Pass: <span className="font-semibold text-ink">{catalog ? catalog.price === 0 ? 'Free' : '₹' + catalog.price.toLocaleString('en-IN') : 'Loading...'}</span></p></div>
      {!catalog ? <p className="py-10 text-center text-sm text-ink-muted">Loading collections...</p> : !catalog.directories.length ? <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center"><FolderIcon className="mx-auto h-10 w-10 text-brand-600" /><h2 className="mt-3 font-semibold text-ink">No paper collections yet</h2><p className="mt-2 text-sm text-ink-muted">Use Create Paper Collection above to organize your SSC, PSC or other papers.</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{catalog.directories.map((item) => <Link key={item.name} to={'/admin/previous-papers?directory=' + encodeURIComponent(item.name)} className="rounded-2xl border border-line bg-white p-5 hover:border-brand-300"><FolderIcon className="h-8 w-8 text-brand-600" /><h2 className="mt-3 font-semibold text-ink">{item.name}</h2><p className="mt-1 text-sm text-ink-muted">{item.paperCount} papers</p><p className="mt-4 text-sm text-brand-700">Manage papers →</p></Link>)}</div>}
    </> : <><Link to="/admin/previous-papers" className="mb-5 inline-block text-sm text-brand-700">← All collections</Link><div className="space-y-4">{[...new Set(items.filter(paper => (paper.directory || paper.exam) === directory).map(paper => paper.subject || 'All Subjects'))].map(group => <details key={group} open className="rounded-2xl border border-line bg-white"><summary className="cursor-pointer px-5 py-4 font-semibold text-ink">{group} <span className="text-xs font-normal text-ink-muted">({items.filter(paper => (paper.directory || paper.exam) === directory && (paper.subject || 'All Subjects') === group).length})</span></summary><TableWrap footer={`${items.filter(paper => (paper.directory || paper.exam) === directory && (paper.subject || 'All Subjects') === group).length} papers`}><Table><thead><tr><Th>Paper</Th><Th>Exam</Th><Th>Year</Th><Th>Shift</Th><Th>Online test</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead><tbody>{items.filter(paper => (paper.directory || paper.exam) === directory && (paper.subject || 'All Subjects') === group).map(paper => <tr key={paper._id} className="hover:bg-canvas/60"><Td><p className="font-medium text-ink">{paper.title}</p><p className="text-xs text-ink-muted">{paper.stage} · {paper.subject}</p></Td><Td>{paper.exam}</Td><Td>{paper.year}</Td><Td>{paper.shift || '—'}</Td><Td>{paper.questions.length ? <Badge tone="brand">{paper.questions.length} Q · {paper.duration} min</Badge> : <Badge tone="slate">PDF only</Badge>}</Td><Td><StatusBadge status={paper.status} /></Td><Td><RowActions onView={paper.pdfUrl ? () => window.open(paper.pdfUrl, '_blank', 'noopener,noreferrer') : undefined} onEdit={() => navigate(`/admin/previous-papers/${paper._id}/edit`)} onDelete={() => remove(paper._id)} extra={<button type="button" disabled={saving} onClick={() => toggle(paper)} className={btn('secondary', 'sm', 'mr-1')}>{paper.status === 'published' ? 'Unpublish' : 'Publish'}</button>} /></Td></tr>)}</tbody></Table></TableWrap></details>)}{!loading && !items.some(paper => (paper.directory || paper.exam) === directory) && <div className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-ink-muted">No previous papers added yet.</div>}</div></>
    }
    {modal === 'collection' && <PaperDialog title="Create Paper Collection" busy={creating} onClose={() => setModal(null)}>
      <p className="text-sm leading-6 text-ink-muted">Name your collection, such as SSC or PSC. Open it after creation to add PDFs and online tests.</p>
      <form onSubmit={createCollection} className="mt-5 space-y-5">
        <Field label="Collection name"><Input autoFocus required maxLength={120} value={name} disabled={creating} onChange={(event) => setName(event.target.value)} placeholder="e.g. SSC or PSC" /></Field>
        {directoryError && <p role="alert" className="text-sm text-red-600">{directoryError}</p>}
        <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="secondary" disabled={creating} onClick={() => setModal(null)}>Cancel</Button><Button type="submit" disabled={creating || !name.trim()}>{creating ? 'Creating...' : 'Create Collection'}</Button></div>
      </form>
    </PaperDialog>}
    {modal === 'price' && <PaperDialog title="Set All Papers Pass Price" busy={priceSaving} onClose={() => setModal(null)}>
      <p className="text-sm leading-6 text-ink-muted">Choose free access or a one-time price for every paper collection, PDF and online test. Changes apply to new checkout orders only; existing purchases stay active.</p>
      <form onSubmit={savePrice} className="mt-5 space-y-5">
        <Field label="Access"><Select autoFocus value={access} disabled={priceSaving} onChange={(event) => setAccess(event.target.value as 'free' | 'paid')}><option value="paid">Paid</option><option value="free">Free</option></Select></Field>{access === 'free' ? <p className="rounded-xl bg-brand-50 p-3 text-sm text-brand-700">All previous paper PDFs and tests will be available without payment. Students still log in to attempt tests.</p> : <Field label="Pass price (₹)" hint="Applies to all paper collections"><Input autoFocus required type="number" min="1" max="1000000" step="0.01" value={price} disabled={!catalog || priceSaving} onChange={(event) => setPrice(event.target.value)} /></Field>}
        {priceError && <p role="alert" className="text-sm text-red-600">{priceError}</p>}
        <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="secondary" disabled={priceSaving} onClick={() => setModal(null)}>Cancel</Button><Button type="submit" disabled={!catalog || priceSaving || (access === 'free' ? catalog.price === 0 : !price || Number(price) === catalog.price)}>{priceSaving ? 'Saving...' : 'Save Price'}</Button></div>
      </form>
    </PaperDialog>}
  </PageShell>;
}

function PaperDialog({ title, busy, onClose, children }: { title: string; busy: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current; dialog?.showModal();
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog ref={ref} aria-labelledby="paper-dialog-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-0 text-ink shadow-lift backdrop:bg-slate-900/50">
    <div className="p-5 sm:p-6"><div className="mb-4 flex items-center justify-between gap-3"><h2 id="paper-dialog-title" className="text-lg font-semibold">{title}</h2><Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onClose} aria-label="Close dialog"><XIcon className="h-4 w-4" /></Button></div>{children}</div>
  </dialog>;
}
