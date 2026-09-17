import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { exams } from '../../data/content';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Button, Field, Input, Select, Textarea, btn } from '../../components/ui/Primitives';
import { removeSeriesThumbnail, uploadSeriesThumbnail, createTestSeries, fetchAdminSeries, updateTestSeries } from '../../services/test-series/testSeries.slice';
import type { SeriesKind, SeriesPayload, SeriesStatus } from '../../services/test-series/testSeries.api';
import type { AppDispatch, RootState } from '../../store';
import { ThumbnailInput } from '../../components/courses/ThumbnailInput';

type Draft = { title: string; description: string; exam: string; kind: SeriesKind; access: 'free' | 'paid'; price: string; difficulty: 'Easy' | 'Moderate' | 'Hard'; languages: string; status: SeriesStatus };
const blank: Draft = { title: '', description: '', exam: 'SSC', kind: 'full', access: 'paid', price: '499', difficulty: 'Moderate', languages: 'English', status: 'draft' };

export function AdminTestSeriesForm() {
  const { seriesId } = useParams(); const editing = Boolean(seriesId); const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate();
  const { current, loading, saving, error } = useSelector((state: RootState) => state.testSeries); const [draft, setDraft] = useState<Draft>(blank);
  const loadedId = useRef('');
  useEffect(() => { if (seriesId) dispatch(fetchAdminSeries(seriesId)); }, [seriesId, dispatch]);
  useEffect(() => { if (seriesId && current?._id === seriesId && loadedId.current !== seriesId) { loadedId.current = seriesId; setDraft({ title: current.title, description: current.description, exam: current.exam, kind: current.kind, access: current.access, price: String(current.price), difficulty: current.difficulty, languages: current.languages, status: current.status }); } }, [seriesId, current]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null); const [submitting, setSubmitting] = useState(false); const [uploadError, setUploadError] = useState(''); const savedId = useRef('');
  const set = (key: keyof Draft, value: string) => setDraft((item) => ({ ...item, [key]: value } as Draft));
  const removeThumbnail = async () => {
    const id = seriesId || savedId.current;
    if (!id || !window.confirm('Remove this thumbnail and permanently delete its uploaded image?')) return;
    setSubmitting(true); setUploadError('');
    try { await dispatch(removeSeriesThumbnail(id)).unwrap(); }
    catch (failure) { setUploadError(String(failure)); } finally { setSubmitting(false); }
  };
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (submitting) return; setSubmitting(true); setUploadError(''); try { const payload: SeriesPayload = { ...draft, price: draft.access === 'free' ? 0 : Number(draft.price) }; const targetId = seriesId || savedId.current; const saved = targetId ? await dispatch(updateTestSeries({ id: targetId, payload })).unwrap() : await dispatch(createTestSeries(payload)).unwrap(); savedId.current = saved._id; if (thumbnailFile) await dispatch(uploadSeriesThumbnail({ id: saved._id, file: thumbnailFile })).unwrap(); navigate('/admin/test-series'); } catch (failure) { setUploadError(String(failure)); } finally { setSubmitting(false); } };

  if (editing && loading) return <PageShell title="Edit Test Series" subtitle="Loading series..." width="max-w-4xl"><Panel><p className="text-sm text-ink-muted">Loading details...</p></Panel></PageShell>;
  return <PageShell title={editing ? 'Edit Test Series' : 'Create Test Series'} subtitle="Set the series details, then add individual tests." width="max-w-4xl"><form onSubmit={(event) => { submit(event).catch(() => undefined); }} className="space-y-5"><Panel><div className="grid gap-4 sm:grid-cols-2">
    <Field label="Series name" className="sm:col-span-2"><Input required value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="SSC CGL Full Mock Test Series" /></Field><Field label="Description" className="sm:col-span-2"><Textarea required rows={3} value={draft.description} onChange={(e) => set('description', e.target.value)} /></Field>
    <ThumbnailInput kind="test-series" file={thumbnailFile} url={current?._id === (seriesId || savedId.current) ? current.thumbnail : undefined} title={draft.title} onChange={setThumbnailFile} onRemove={removeThumbnail} disabled={saving || submitting} />
    <Field label="Exam"><Select value={draft.exam} onChange={(e) => set('exam', e.target.value)}>{exams.map((exam) => <option key={exam}>{exam}</option>)}</Select></Field><Field label="Test type"><Select value={draft.kind} onChange={(e) => set('kind', e.target.value)}><option value="full">Full Mock</option><option value="sectional">Sectional</option><option value="current-affairs">Current Affairs</option><option value="previous-year">Previous Year</option></Select></Field>
    <Field label="Difficulty"><Select value={draft.difficulty} onChange={(e) => set('difficulty', e.target.value)}><option>Easy</option><option>Moderate</option><option>Hard</option></Select></Field><Field label="Language"><Select value={draft.languages} onChange={(e) => set('languages', e.target.value)}><option>English</option><option>Hindi</option><option>English + Hindi</option></Select></Field>
    <Field label="Access"><Select value={draft.access} onChange={(e) => set('access', e.target.value)}><option value="paid">Paid</option><option value="free">Free</option></Select></Field>{draft.access === 'paid' && <Field label="Price (₹)"><Input type="number" min="1" required value={draft.price} onChange={(e) => set('price', e.target.value)} /></Field>}<Field label="Status"><Select value={draft.status} onChange={(e) => set('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="unpublished">Unpublished</option></Select></Field>
  </div></Panel>{(error || uploadError) && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{uploadError || error}</p>}<div className="flex justify-end gap-2"><Link to="/admin/test-series" className={btn('secondary', 'md')}>Cancel</Link><Button type="submit" disabled={saving || submitting}>{(saving || submitting) ? 'Saving…' : editing ? 'Update series' : 'Save series'}</Button></div></form></PageShell>;
}
