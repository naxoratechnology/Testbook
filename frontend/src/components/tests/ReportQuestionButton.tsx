import { useEffect, useState } from 'react';
import { FlagIcon, XIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Button, Field, Select, Textarea } from '../ui/Primitives';
import { bookmarkKey } from '../../services/bookmarks/bookmarks.api';
import type { BookmarkReference } from '../../services/bookmarks/bookmarks.api';
import type { ReportPayload } from '../../services/question-review/questionReview.api';
import { reportQuestion } from '../../services/question-review/questionReview.slice';
import type { AppDispatch } from '../../store';

export function ReportQuestionButton({ reference }: { reference: BookmarkReference }) {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false); const [saving, setSaving] = useState(false); const [sent, setSent] = useState(false); const [error, setError] = useState('');
  const [reason, setReason] = useState<ReportPayload['reason']>('wrong-answer'); const [details, setDetails] = useState('');
  const key = bookmarkKey(reference);
  useEffect(() => { setOpen(false); setSent(false); setError(''); setReason('wrong-answer'); setDetails(''); }, [key]);
  return <><Button type="button" variant="secondary" size="sm" disabled={sent} onClick={() => setOpen(true)}><FlagIcon className="h-4 w-4" />{sent ? 'Reported' : 'Report'}</Button>{open && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"><section role="dialog" aria-modal="true" aria-labelledby="report-question-title" className="w-full max-w-md rounded-2xl bg-white p-5"><div className="flex items-center justify-between"><h2 id="report-question-title" className="font-semibold text-ink">Report this question</h2><Button type="button" variant="ghost" size="sm" disabled={saving} onClick={() => setOpen(false)} aria-label="Close report"><XIcon className="h-4 w-4" /></Button></div><form className="mt-4 space-y-4" onSubmit={async (event) => { event.preventDefault(); if (saving) return; setSaving(true); setError(''); try { await dispatch(reportQuestion({ ...reference, reason, details })).unwrap(); setSent(true); setOpen(false); } catch (failure) { setError(String(failure)); } finally { setSaving(false); } }}><Field label="Reason"><Select value={reason} onChange={(event) => setReason(event.target.value as ReportPayload['reason'])}><option value="wrong-answer">Incorrect answer or explanation</option><option value="question-error">Question or options have an error</option><option value="translation">Language or translation issue</option><option value="other">Other</option></Select></Field><Field label="Details"><Textarea rows={4} maxLength={2000} required={reason === 'other'} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Tell us what needs to be corrected." /></Field>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="secondary" disabled={saving} onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Sending...' : 'Send report'}</Button></div></form></section></div>}</>;
}
