import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { BookmarkIcon, CheckCircleIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Button, btn } from '../components/ui/Primitives';
import { BookmarkButton } from '../components/tests/BookmarkButton';
import { RichText } from '../components/ui/RichText';
import { fetchBookmarks } from '../services/bookmarks/bookmarks.slice';
import type { AppDispatch, RootState } from '../store';

export function SavedQuestions({ embedded = false }: { embedded?: boolean }) {
  const { user } = useAuth(); const dispatch = useDispatch<AppDispatch>();
  const { items, ownerId, status, error } = useSelector((state: RootState) => state.bookmarks);
  useEffect(() => { if (user) void dispatch(fetchBookmarks(user.id)); }, [dispatch, user?.id]);
  if (!user) return <PageShell title="Saved Questions" subtitle="Log in to view your saved questions."><Link to="/login?redirect=%2Fsaved-questions" className={btn('primary', 'md')}>Login</Link></PageShell>;
  const visible = ownerId === user.id ? items : [];
  return <SavedQuestionsLayout embedded={embedded}>
    {error && <div role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}<Button variant="secondary" size="sm" className="ml-3" onClick={() => { void dispatch(fetchBookmarks(user.id)); }}>Retry</Button></div>}
    {status === 'loading' || ownerId !== user.id ? <p className="py-12 text-center text-sm text-ink-muted">Loading saved questions...</p> : !visible.length ? <Panel><BookmarkIcon className="mx-auto h-8 w-8 text-brand-600" /><p className="mt-3 text-center text-sm text-ink-muted">No saved questions yet. Use Save question when reviewing test solutions.</p></Panel> : <div className="space-y-4">{visible.map((item, index) => { const correct = item.question.correctAnswer; return <Panel key={item._id}><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold text-brand-700">{item.title}</p><BookmarkButton reference={item} /></div><div className="mt-4 flex gap-1 font-semibold leading-6 text-ink"><span>{index + 1}.</span><RichText value={item.question.text} /></div><ol className="mt-4 space-y-2">{item.question.options.map((option, optionIndex) => <li key={optionIndex} className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${optionIndex === correct ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-line text-ink-soft'}`}>{optionIndex === correct && <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />}<span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span><RichText value={option} className="min-w-0 flex-1" /></li>)}</ol>{Number.isInteger(correct) ? <div className="mt-4 rounded-xl bg-brand-50 p-4 text-sm text-ink-soft"><p className="font-semibold text-brand-700">Correct answer: {String.fromCharCode(65 + Number(correct))}</p>{item.question.explanation && <RichText value={item.question.explanation} className="mt-2" />}</div> : <p className="mt-4 text-xs text-ink-muted">The answer is no longer available from the original question.</p>}</Panel>; })}</div>}
  </SavedQuestionsLayout>;
}

function SavedQuestionsLayout({ embedded, children }: { embedded: boolean; children: ReactNode }) {
  return embedded ? <>{children}</> : <PageShell title="Saved Questions" subtitle="Questions you bookmarked for later revision.">{children}</PageShell>;
}
