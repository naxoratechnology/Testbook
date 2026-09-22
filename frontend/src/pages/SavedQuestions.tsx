import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { BookmarkIcon, CheckCircleIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageShell, Panel } from '../components/ui/PageShell';
import { Button, btn } from '../components/ui/Primitives';
import { BookmarkButton } from '../components/tests/BookmarkButton';
import { RichText, explanationTextClass, optionTextClass, questionTextClass } from '../components/ui/RichText';
import { fetchBookmarks } from '../services/bookmarks/bookmarks.slice';
import type { AppDispatch, RootState } from '../store';

export function SavedQuestions({ embedded = false }: { embedded?: boolean }) {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { items, ownerId, status, error } = useSelector((state: RootState) => state.bookmarks);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => { if (user) void dispatch(fetchBookmarks(user.id)); }, [dispatch, user?.id]);
  useEffect(() => { setRevealed({}); }, [user?.id]);

  if (!user) return <PageShell title="Saved Questions" subtitle="Log in to view your saved questions."><Link to="/login?redirect=%2Fsaved-questions" className={btn('primary', 'md')}>Login</Link></PageShell>;

  const visible = ownerId === user.id ? items : [];
  return <SavedQuestionsLayout embedded={embedded}>
    {error && <div role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}<Button variant="secondary" size="sm" className="ml-3" onClick={() => { void dispatch(fetchBookmarks(user.id)); }}>Retry</Button></div>}
    {status === 'loading' || ownerId !== user.id
      ? <p className="py-12 text-center text-sm text-ink-muted">Loading saved questions...</p>
      : !visible.length
        ? <Panel><BookmarkIcon className="mx-auto h-8 w-8 text-brand-600" /><p className="mt-3 text-center text-sm text-ink-muted">No saved questions yet. Use Save question when reviewing test solutions.</p></Panel>
        : <div className="space-y-4">{visible.map((item, index) => {
          const correct = item.question.correctAnswer;
          const showSolution = Boolean(revealed[item._id]);
          return <Panel key={item._id}>
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold text-brand-700">{item.title}</p><BookmarkButton reference={item} /></div>
            <div className={`mt-4 flex gap-2 ${questionTextClass}`}><span>{index + 1}.</span><RichText value={item.question.text} /></div>
            <ol className="mt-4 space-y-2">{item.question.options.map((option, optionIndex) => <li key={optionIndex} className={`flex items-start gap-2 rounded-xl border p-3 ${optionTextClass} ${showSolution && optionIndex === correct ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-line text-ink-soft'}`}>
              {showSolution && optionIndex === correct && <CheckCircleIcon className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />}
              <span>{String.fromCharCode(65 + optionIndex)}.</span><RichText value={option} className="min-w-0 flex-1" />
            </li>)}</ol>
            <Button type="button" variant="secondary" size="sm" className="mt-4" aria-expanded={showSolution} aria-controls={`saved-solution-${item._id}`} onClick={() => setRevealed((current) => ({ ...current, [item._id]: !current[item._id] }))}>{showSolution ? 'Hide Solution' : 'Solution'}</Button>
            {showSolution && <div id={`saved-solution-${item._id}`} className="mt-4 rounded-xl bg-brand-50 p-4 text-ink-soft">{Number.isInteger(correct)
              ? <><p className={`${optionTextClass} font-semibold text-brand-700`}>Correct answer: {String.fromCharCode(65 + Number(correct))}</p>{item.question.explanation && <RichText value={item.question.explanation} className={`mt-2 ${explanationTextClass}`} />}</>
              : <p className={explanationTextClass}>The answer is no longer available from the original question.</p>}</div>}
          </Panel>;
        })}</div>}
  </SavedQuestionsLayout>;
}

function SavedQuestionsLayout({ embedded, children }: { embedded: boolean; children: ReactNode }) {
  return embedded ? <>{children}</> : <PageShell title="Saved Questions" subtitle="Questions you bookmarked for later revision.">{children}</PageShell>;
}
