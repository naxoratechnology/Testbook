import { SolutionLink, useAttemptedTests } from '../components/tests/SolutionLink';
import { TestSeriesThumbnail } from '../components/courses/TestSeriesThumbnail';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2Icon, ClockIcon, FileQuestionIcon, ListChecksIcon, LockIcon } from 'lucide-react';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, btn } from '../components/ui/Primitives';
import { RichText } from '../components/ui/RichText';
import { testSeriesApiService } from '../services/test-series/testSeries.api';
import { groupTestsBySubject } from '../services/test-series/testSubjects';
import { fetchPublicSeries } from '../services/test-series/testSeries.slice';
import type { AppDispatch, RootState } from '../store';

declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void }; } }
const loadRazorpay = () => new Promise<boolean>((resolve) => { if (window.Razorpay) return resolve(true); const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = () => resolve(true); script.onerror = () => resolve(false); document.body.appendChild(script); });

export function TestSeriesDetail() {
  const attemptedTests = useAttemptedTests('test-series');
  const { seriesId = '' } = useParams(); const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate(); const location = useLocation();
  const { publicCurrent, loading, error } = useSelector((state: RootState) => state.testSeries); const user = useSelector((state: RootState) => state.auth.user);
  const [paying, setPaying] = useState(false); const [checkoutError, setCheckoutError] = useState(''); const automatic = useRef(false);
  useEffect(() => { if (seriesId) dispatch(fetchPublicSeries(seriesId)); }, [dispatch, seriesId, user]);
  const series = publicCurrent?._id === seriesId ? publicCurrent : null;
  const purchase = useCallback(async () => {
    if (!series) return;
    if (!user) { navigate(`/login?redirect=${encodeURIComponent(`/test-series/${seriesId}?checkout=1`)}`); return; }
    setPaying(true); setCheckoutError('');
    try {
      const data = (await testSeriesApiService.checkout(seriesId)).data.data;
      if (data.free || data.purchased) { await dispatch(fetchPublicSeries(seriesId)); navigate(`/test-series/${seriesId}`, { replace: true }); return; }
      if (!await loadRazorpay() || !window.Razorpay) throw new Error('Unable to load Razorpay checkout.');
      new window.Razorpay({ key: data.keyId, amount: data.order.amount, currency: data.order.currency, name: 'Chandrabhaga Academy', description: series.title, order_id: data.order.id, prefill: { name: user.name, email: user.email, contact: user.mobile }, theme: { color: '#1267b1' }, handler: async (payment: Record<string, string>) => { try { await testSeriesApiService.verifyCheckout(seriesId, { razorpay_order_id: payment.razorpay_order_id, razorpay_payment_id: payment.razorpay_payment_id, razorpay_signature: payment.razorpay_signature }); await dispatch(fetchPublicSeries(seriesId)); navigate(`/test-series/${seriesId}`, { replace: true }); } catch (failure: unknown) { setCheckoutError(apiError(failure, 'Payment verification failed. Please contact support if payment was deducted.')); } finally { setPaying(false); } }, modal: { ondismiss: () => setPaying(false) } }).open();
    } catch (failure: unknown) { setCheckoutError(apiError(failure, 'Unable to start checkout.')); setPaying(false); }
  }, [series, user, navigate, seriesId, dispatch]);
  useEffect(() => { if (series && user && !series.purchased && new URLSearchParams(location.search).get('checkout') === '1' && !automatic.current) { automatic.current = true; purchase(); } }, [series, user, location.search, purchase]);
  if (loading && !series) return <PageShell title="Test Series"><p className="py-12 text-center text-sm text-ink-muted">Loading tests...</p></PageShell>;
  if (!series) return <PageShell title="Test series not found"><p className="mb-4 text-sm text-red-600">{error}</p><Link to="/test-series" className={btn('primary', 'md')}>Back</Link></PageShell>;
  const questions = series.tests.reduce((sum, test) => sum + test.questions.length, 0); const unlocked = series.access === 'free' || series.purchased;
  return <PageShell><Link to="/test-series" className="text-sm text-brand-700">&larr; Test Series</Link><section className="mt-5 grid overflow-hidden rounded-2xl border border-line bg-white shadow-soft lg:grid-cols-2"><div className="relative min-h-56 overflow-hidden bg-canvas sm:min-h-72 lg:min-h-[390px]"><TestSeriesThumbnail src={series.thumbnail} alt={series.title} className="absolute inset-0 h-full w-full object-cover" /></div><div className="flex min-w-0 flex-col p-5 sm:p-7 lg:p-8"><div className="flex flex-wrap gap-2"><Badge tone="brand">{series.exam}</Badge><Badge tone={series.access === 'free' ? 'green' : 'violet'}>{series.access === 'free' ? 'Free' : `₹${series.price}`}</Badge>{series.purchased && series.access === 'paid' && <Badge tone="green">Purchased</Badge>}</div><h1 className="mt-4 text-2xl font-bold text-ink sm:text-3xl">{series.title}</h1><RichText value={series.description} className="mt-3 text-sm leading-6 text-ink-soft" /><div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3"><CompactStat label="Tests" value={String(series.tests.length)} icon={<ListChecksIcon className="h-4 w-4" />} /><CompactStat label="Questions" value={String(questions)} icon={<FileQuestionIcon className="h-4 w-4" />} /><CompactStat label="Difficulty" value={series.difficulty} icon={<ClockIcon className="h-4 w-4" />} /></div><div className="mt-auto border-t border-line pt-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-2xl font-bold text-ink">{series.access === 'free' ? 'Free' : `₹${series.price.toLocaleString('en-IN')}`}</p><p className="mt-1 text-sm text-ink-muted">{unlocked ? 'All tests are unlocked.' : 'One-time payment for complete access.'}</p></div>{unlocked ? <span className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2Icon className="h-5 w-5" />Access active</span> : <button disabled={paying} onClick={purchase} className={btn('primary', 'md')}>{paying ? 'Opening checkout...' : user ? 'Purchase Test Series' : 'Login to Purchase'}</button>}</div>{checkoutError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{checkoutError}</p>}</div></div></section>
{error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}<Panel className="mt-6" padded={false}><div className="border-b border-line px-5 py-4"><h2 className="font-semibold text-ink">All Tests</h2></div><div className="space-y-3 p-3">{groupTestsBySubject(series.subjects, series.tests).map(group => <details key={group.name || "all"} open={group.tests.some(test => !attemptedTests.some(item => item.sourceId === series._id && item.testId === test._id)) || undefined} className="overflow-hidden rounded-xl border border-line"><summary className="cursor-pointer bg-canvas px-4 py-3 text-sm font-semibold text-ink">{group.name || "All tests"} <span className="text-xs font-normal text-ink-muted">({group.tests.length})</span></summary><ul className="divide-y divide-line">{group.tests.map((test) => <li key={test._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-ink">{test.title}{test.isPreview && series.access === 'paid' && <Badge tone="green" className="ml-2 align-middle !rounded-lg !px-2.5 !py-1 text-[10px] uppercase tracking-wide shadow-sm">Free demo</Badge>}</p><p className="mt-1 text-xs text-ink-muted">{test.questions.length} questions · {test.duration} minutes</p></div>{(unlocked || test.isPreview) ? <div className="flex flex-wrap gap-2"><button onClick={() => navigate(user ? `/test-series/${series._id}/tests/${test._id}${attemptedTests.some((item) => item.sourceId === series._id && item.testId === test._id) ? '?reattempt=1' : ''}` : `/login?redirect=${encodeURIComponent(`/test-series/${series._id}/tests/${test._id}`)}`)} className={btn('primary', 'sm')}>{attemptedTests.some((item) => item.sourceId === series._id && item.testId === test._id) ? 'Reattempt Test' : 'Start Test'}</button><SolutionLink reference={{ source: 'test-series', sourceId: series._id, testId: test._id }} attempted={attemptedTests.some((item) => item.sourceId === series._id && item.testId === test._id)} /></div> : <button disabled={paying} onClick={purchase} className={btn('secondary', 'sm')}><LockIcon className="mr-1 h-3.5 w-3.5" />Purchase required</button>}</li>)}</ul></details>)}</div></Panel>
  </PageShell>;
}

function apiError(error: unknown, fallback: string) { return (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error instanceof Error ? error.message : fallback); }

function CompactStat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return <div className="min-w-0 rounded-xl border border-line bg-canvas/60 p-3"><div className="flex items-center gap-1.5 text-ink-muted">{icon}<span className="truncate text-[11px] font-medium sm:text-xs">{label}</span></div><p className="mt-2 truncate text-sm font-bold text-ink sm:text-lg">{value}</p></div>;
}
