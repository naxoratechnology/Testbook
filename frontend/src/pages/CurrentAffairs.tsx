import { SolutionLink, useAttemptedTests } from '../components/tests/SolutionLink';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, FileTextIcon, ListChecksIcon } from 'lucide-react';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, EmptyState, btn } from '../components/ui/Primitives';
import { useViewer } from '../contexts/ViewerContext';
import { fetchPublicCurrentAffairs } from '../services/current-affairs/currentAffairs.slice';
import type { PublicCurrentAffairsEntry } from '../services/current-affairs/currentAffairs.api';
import type { AppDispatch, RootState } from '../store';

export function CurrentAffairs() {
  const attemptedTests = useAttemptedTests('current-affairs');
  const dispatch = useDispatch<AppDispatch>(); const { openPdf } = useViewer(); const { publicItems, loading, error } = useSelector((state: RootState) => state.currentAffairs);
  useEffect(() => { dispatch(fetchPublicCurrentAffairs()); }, [dispatch]);
  const openDocument = (entry: PublicCurrentAffairsEntry) => openPdf({ title: entry.title, subtitle: `${entry.exam} · Current Affairs`, module: 'current-affairs', url: entry.pdfUrl, pages: [] });
  if (loading) return <PageShell title="Current Affairs"><p className="py-12 text-center text-sm text-ink-muted">Loading current affairs...</p></PageShell>;
  if (!publicItems.length) return <PageShell title="Current Affairs">{error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : <EmptyState icon={<CalendarDaysIcon className="h-5 w-5" />} title="No current affairs available." description="Published daily updates will appear here." />}</PageShell>;
  const [today, ...previous] = publicItems;
  const card = (entry: PublicCurrentAffairsEntry) => <Panel><div className="flex items-start gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500"><FileTextIcon className="h-5 w-5" /></span><div><h2 className="font-semibold text-ink">{entry.title}</h2><p className="mt-1 text-xs text-ink-muted">{new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {entry.exam}</p></div></div><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => openDocument(entry)} className={btn('secondary', 'sm', 'flex-1')}>Read PDF</button>{entry.questions.length ? <Link to={`/current-affairs/${entry._id}/test${attemptedTests.some((item) => item.sourceId === entry._id) ? '?reattempt=1' : ''}`} className={btn('primary', 'sm', 'flex-1')}><ListChecksIcon className="h-4 w-4" /> {attemptedTests.some((item) => item.sourceId === entry._id) ? 'Reattempt Test' : 'Daily Test'}</Link> : <button disabled className={btn('primary', 'sm', 'flex-1')}>No Test</button>}{entry.questions.length > 0 && <SolutionLink reference={{ source: 'current-affairs', sourceId: entry._id }} attempted={attemptedTests.some((item) => item.sourceId === entry._id)} />}</div></Panel>;
  return <PageShell title="Today's Current Affairs" subtitle={new Date(today.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}><div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]"><Panel><div className="flex items-center gap-2"><CalendarDaysIcon className="h-4 w-4 text-brand-600" /><h2 className="font-semibold text-ink">Highlights</h2><Badge tone="green" className="ml-auto">Free</Badge></div><ul className="mt-4 space-y-3">{today.highlights.map((highlight, index) => <li key={index} className="flex gap-3 text-sm leading-6 text-ink-soft"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />{highlight}</li>)}</ul></Panel>{card(today)}</div>{previous.length > 0 && <section className="mt-8"><h2 className="text-lg font-semibold text-ink">Previous current affairs</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{previous.map((entry) => <React.Fragment key={entry._id}>{card(entry)}</React.Fragment>)}</div></section>}</PageShell>;
}
