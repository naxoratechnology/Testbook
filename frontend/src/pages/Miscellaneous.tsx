import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { BookmarkIcon, FlagIcon, LockIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Badge, Button, btn } from '../components/ui/Primitives';
import { SavedQuestions } from './SavedQuestions';
import { fetchMyQuestionReports } from '../services/question-review/questionReview.slice';
import type { UserQuestionReport } from '../services/question-review/questionReview.api';
import type { AppDispatch } from '../store';

export function Miscellaneous() {
  const { user } = useAuth();
  const [search, setSearch] = useSearchParams();
  const reported = search.get('tab') === 'reported';
  return <PageShell title="Miscellaneous" subtitle="Your saved questions and reported question feedback in one place.">
    {!user ? <Panel><LockIcon className="mx-auto h-8 w-8 text-brand-600" /><div className="mt-3 text-center"><h2 className="font-semibold">Login required</h2><p className="mt-2 text-sm text-ink-muted">Please log in to view your saved and reported questions.</p><Link to={'/login?redirect=' + encodeURIComponent('/miscellaneous' + (reported ? '?tab=reported' : ''))} className={btn('primary', 'md', 'mt-4')}>Login</Link></div></Panel> : <>
      <nav aria-label="Question collections" className="mb-6 flex flex-wrap gap-3">
        <Button variant={reported ? 'secondary' : 'primary'} aria-current={!reported ? 'page' : undefined} onClick={() => setSearch({})}><BookmarkIcon className="h-4 w-4" />Saved Questions</Button>
        <Button variant={reported ? 'primary' : 'secondary'} aria-current={reported ? 'page' : undefined} onClick={() => setSearch({ tab: 'reported' })}><FlagIcon className="h-4 w-4" />Reported Questions</Button>
      </nav>
      {reported ? <ReportedQuestions key={user.id} userId={user.id} /> : <SavedQuestions embedded />}
    </>}
  </PageShell>;
}

const reasons = { 'wrong-answer': 'Incorrect answer or explanation', 'question-error': 'Question or options error', translation: 'Language or translation issue', other: 'Other' };

function ReportedQuestions({ userId }: { userId: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const [items, setItems] = useState<UserQuestionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    void dispatch(fetchMyQuestionReports()).unwrap()
      .then(reports => { if (active) setItems(reports); })
      .catch(failure => { if (active) setError(String(failure)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [dispatch, userId, retry]);
  if (error) return <Panel><p role="alert" className="text-sm text-red-600">{error}</p><Button variant="secondary" className="mt-3" onClick={() => setRetry(value => value + 1)}>Retry</Button></Panel>;
  if (loading) return <p className="py-12 text-center text-sm text-ink-muted">Loading reported questions...</p>;
  if (!items.length) return <Panel><FlagIcon className="mx-auto h-8 w-8 text-brand-600" /><p className="mt-3 text-center text-sm text-ink-muted">No reported questions yet. Use Report when reviewing test solutions.</p></Panel>;
  return <div className="space-y-4">{items.map((item, index) => <Panel key={item._id}>
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold text-brand-700">{item.title}</p><Badge tone={item.status === 'resolved' ? 'green' : 'slate'}>{item.status === 'resolved' ? 'Resolved' : 'Pending review'}</Badge></div>
    <h2 className="mt-4 whitespace-pre-wrap font-semibold leading-6 text-ink">{index + 1}. {item.questionText}</h2>
    <p className="mt-3 text-sm text-ink-soft">{reasons[item.reason]}</p>
    {item.details && <p className="mt-2 whitespace-pre-wrap text-sm text-ink-muted">{item.details}</p>}
    <p className="mt-4 text-xs text-ink-muted">Reported {new Date(item.createdAt).toLocaleDateString('en-IN')}</p>
  </Panel>)}</div>;
}
