import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FolderIcon } from 'lucide-react';
import { SolutionLink, useAttemptedTests } from '../components/tests/SolutionLink';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, Select, btn } from '../components/ui/Primitives';
import { useViewer } from '../contexts/ViewerContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchPaperCatalog, fetchPublicPreviousPapers } from '../services/previous-papers/previousPapers.slice';
import { previousPapersApiService } from '../services/previous-papers/previousPapers.api';
import type { AppDispatch, RootState } from '../store';

export function PreviousPapers() {
  const dispatch = useDispatch<AppDispatch>(); const { user } = useAuth(); const navigate = useNavigate(); const [search, setSearch] = useSearchParams(); const { openPdf } = useViewer();
  const { catalog, publicItems, loading, error } = useSelector((state: RootState) => state.previousPapers);
  const attempted = useAttemptedTests('previous-paper'); const directory = search.get('directory') || '';
  const [year, setYear] = useState(''); const [subject, setSubject] = useState(''); const [shift, setShift] = useState(''); const [paying, setPaying] = useState(false); const [paymentError, setPaymentError] = useState(''); const automatic = useRef(false);
  const refresh = useCallback(async () => { await Promise.all([dispatch(fetchPaperCatalog()).unwrap(), dispatch(fetchPublicPreviousPapers()).unwrap()]); }, [dispatch]);
  useEffect(() => { void refresh().catch(() => undefined); }, [refresh, user?.id]);
  const unlocked = Boolean(catalog?.price === 0 || (user && catalog?.purchased));
  const purchase = useCallback(async () => {
    if (!user) { navigate('/login?redirect=' + encodeURIComponent('/previous-papers?' + (directory ? 'directory=' + encodeURIComponent(directory) + '&' : '') + 'checkout=1')); return; }
    setPaying(true); setPaymentError('');
    try {
      const data = (await previousPapersApiService.checkout()).data.data;
      if (data.purchased) { await refresh(); setPaying(false); return; }
      if (!window.Razorpay) await new Promise<void>((resolve, reject) => { const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = () => resolve(); script.onerror = () => reject(new Error('Unable to load checkout.')); document.body.appendChild(script); });
      if (!window.Razorpay) throw new Error('Unable to load checkout.');
      new window.Razorpay({ key: data.keyId, amount: data.order.amount, currency: data.order.currency, order_id: data.order.id, name: 'Chandrabhaga Academy', description: 'All Previous Year Papers', prefill: { name: user.name, email: user.email, contact: user.mobile }, handler: async (payment: Record<string, string>) => { try { await previousPapersApiService.verifyCheckout(payment); await refresh(); setSearch(directory ? { directory } : {}, { replace: true }); } catch (failure) { setPaymentError(paymentMessage(failure)); } finally { setPaying(false); } }, modal: { ondismiss: () => setPaying(false) } }).open();
    } catch (failure) { setPaymentError(paymentMessage(failure)); setPaying(false); }
  }, [user, navigate, refresh, directory, setSearch]);
  useEffect(() => { if (user && catalog && !unlocked && search.get('checkout') === '1' && !automatic.current) { automatic.current = true; void purchase(); } }, [user, catalog, unlocked, search, purchase]);
  const directoryPapers = publicItems.filter((paper) => (paper.directory || paper.exam) === directory);
  const papers = directoryPapers.filter((paper) => !year || String(paper.year) === year);
  return <PageShell title={directory ? directory + ' Previous Papers' : 'Previous Year Question Papers'} subtitle="Browse paper collections. One pass unlocks all PDFs and online tests.">
    <Panel className="mb-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-semibold text-ink">All Previous Papers Pass · {catalog ? catalog.price === 0 ? 'Free' : '₹' + catalog.price.toLocaleString('en-IN') : '…'}</p><p className="mt-1 text-sm text-ink-muted">{catalog?.price === 0 ? 'Free access to SSC, PSC and all other previous papers.' : 'Single one-time purchase for SSC, PSC and all other previous papers.'}</p></div>{unlocked ? <Badge tone="green">{catalog?.price === 0 ? 'Free access' : 'Access active'}</Badge> : <button disabled={paying || !catalog} onClick={() => void purchase()} className={btn('primary', 'md')}>{paying ? 'Opening checkout...' : user ? 'Purchase All Papers' : 'Login to Purchase'}</button>}</div>{paymentError && <p role="alert" className="mt-3 text-sm text-red-600">{paymentError}</p>}</Panel>
    {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
    {!directory ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{catalog?.directories.map((item) => <Link key={item.name} to={'/previous-papers?directory=' + encodeURIComponent(item.name)} className="rounded-2xl border border-line bg-white p-5 hover:border-brand-300"><FolderIcon className="h-8 w-8 text-brand-600" /><h2 className="mt-3 font-semibold text-ink">{item.name}</h2><p className="mt-1 text-sm text-ink-muted">{item.paperCount} papers</p><p className="mt-4 text-sm font-medium text-brand-700">View papers →</p></Link>)}{catalog && !catalog.directories.length && <p className="text-sm text-ink-muted">No previous papers available yet.</p>}</div> : <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Link to="/previous-papers" className="text-sm text-brand-700">← All collections</Link><div className="grid gap-3 sm:grid-cols-3"><Select value={year} onChange={(event) => setYear(event.target.value)}><option value="">All years</option>{[...new Set(directoryPapers.map((paper) => paper.year))].map((value) => <option key={value} value={value}>{value}</option>)}</Select><Select value={subject} onChange={(event) => setSubject(event.target.value)}><option value="">All subjects</option>{[...new Set(directoryPapers.map((paper) => paper.subject))].map((value) => <option key={value} value={value}>{value}</option>)}</Select><Select value={shift} onChange={(event) => setShift(event.target.value)}><option value="">All shifts</option>{[...new Set(directoryPapers.map((paper) => paper.shift).filter(Boolean))].map((value) => <option key={value} value={value}>{value}</option>)}</Select></div></div>
      {loading ? <p className="py-8 text-center text-sm text-ink-muted">Loading papers...</p> : <div className="space-y-3">{papers.map((paper) => { const hasAttempt = attempted.some((item) => item.sourceId === paper._id); return <Panel key={paper._id}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-ink">{paper.title}</h2><p className="mt-1 text-xs text-ink-muted">{[paper.exam, paper.year, paper.stage, paper.shift, paper.subject].filter(Boolean).join(' · ')}</p><p className="mt-2 text-xs text-ink-muted">{paper.questionCount ? paper.questionCount + ' questions · ' + paper.duration + ' min' : 'PDF only'}</p></div><div className="flex flex-wrap gap-2">{unlocked && paper.unlocked ? <><button className={btn('secondary', 'sm')} onClick={() => openPdf({ title: paper.title, subtitle: paper.exam + ' ' + paper.year, module: 'previous-paper', url: paper.pdfUrl, pages: [] })}>View Paper</button>{paper.questionCount > 0 && <><Link className={btn('primary', 'sm')} to={'/previous-papers/' + paper._id + '/test' + (hasAttempt ? '?reattempt=1' : '')}>{hasAttempt ? 'Reattempt Test' : 'Attempt Online'}</Link><SolutionLink reference={{ source: 'previous-paper', sourceId: paper._id }} attempted={hasAttempt} /></>}</> : <button disabled={paying} className={btn('secondary', 'sm')} onClick={() => void purchase()}>Unlock with All Papers Pass</button>}</div></div></Panel>; })}{!papers.length && <p className="py-8 text-center text-sm text-ink-muted">No papers in this directory yet.</p>}</div>}
    </>}
  </PageShell>;
}
function paymentMessage(error: unknown) { return (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error instanceof Error ? error.message : 'Unable to complete payment. Please contact support if payment was deducted.'); }
