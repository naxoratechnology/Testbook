import { useEffect, useState } from 'react';
import { BookmarkIcon, BookmarkCheckIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Primitives';
import { bookmarkKey } from '../../services/bookmarks/bookmarks.api';
import type { BookmarkReference } from '../../services/bookmarks/bookmarks.api';
import { fetchBookmarks, removeSavedQuestion, saveQuestion } from '../../services/bookmarks/bookmarks.slice';
import type { AppDispatch, RootState } from '../../store';

export function BookmarkButton({ reference }: { reference: BookmarkReference }) {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { items, ownerId, status, pending } = useSelector((state: RootState) => state.bookmarks);
  const [error, setError] = useState('');
  const key = bookmarkKey(reference);
  useEffect(() => { setError(''); }, [key]);
  useEffect(() => { if (user && (ownerId !== user.id || status === 'idle')) void dispatch(fetchBookmarks(user.id)); }, [dispatch, user?.id, ownerId, status]);
  if (!user) return null;
  const saved = ownerId === user.id ? items.find((item) => bookmarkKey(item) === key) : undefined;
  const toggle = async () => { setError(''); try { if (saved) await dispatch(removeSavedQuestion(saved)).unwrap(); else await dispatch(saveQuestion(reference)).unwrap(); } catch (failure) { setError(String(failure)); } };
  return <div><Button type="button" variant={saved ? 'primary' : 'secondary'} size="sm" disabled={ownerId !== user.id || status === 'loading' || pending[key]} aria-pressed={Boolean(saved)} onClick={() => { void toggle(); }}>{saved ? <BookmarkCheckIcon className="h-4 w-4" /> : <BookmarkIcon className="h-4 w-4" />}{pending[key] ? 'Updating...' : saved ? 'Saved question' : 'Save question'}</Button>{error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}</div>;
}
