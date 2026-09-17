import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { BookmarkIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Button, btn } from '../components/ui/Primitives';
import { BookmarkButton } from '../components/tests/BookmarkButton';
import { fetchBookmarks } from '../services/bookmarks/bookmarks.slice';
import type { AppDispatch, RootState } from '../store';

export function SavedQuestions() {
  const { user } = useAuth(); const dispatch = useDispatch<AppDispatch>();
  const { items, ownerId, status, error } = useSelector((state: RootState) => state.bookmarks);
  useEffect(() => { if (user) void dispatch(fetchBookmarks(user.id)); }, [dispatch, user?.id]);
  if (!user) return <PageShell title="Saved Questions" subtitle="Log in to view your saved questions."><Link to="/login?redirect=%2Fsaved-questions" className={btn('primary', 'md')}>Login</Link></PageShell>;
  const visible = ownerId === user.id ? items : [];
  return <PageShell title="Saved Questions" subtitle="Questions you bookmarked for later revision.">
    {error && <div role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}<Button variant="secondary" size="sm" className="ml-3" onClick={() => { void dispatch(fetchBookmarks(user.id)); }}>Retry</Button></div>}
    {status === 'loading' || ownerId !== user.id ? <p className="py-12 text-center text-sm text-ink-muted">Loading saved questions...</p> : !visible.length ? <Panel><BookmarkIcon className="mx-auto h-8 w-8 text-brand-600" /><p className="mt-3 text-center text-sm text-ink-muted">No saved questions yet. Use Save question when reviewing test solutions.</p></Panel> : <div className="space-y-4">{visible.map((item, index) => <Panel key={item._id}><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold text-brand-700">{item.title}</p><BookmarkButton reference={item} /></div><h2 className="mt-4 whitespace-pre-wrap font-semibold leading-6 text-ink">{index + 1}. {item.question.text}</h2><ol className="mt-4 space-y-2">{item.question.options.map((option, optionIndex) => <li key={optionIndex} className="whitespace-pre-wrap rounded-xl border border-line p-3 text-sm text-ink-soft">{String.fromCharCode(65 + optionIndex)}. {option}</li>)}</ol></Panel>)}</div>}
  </PageShell>;
}
