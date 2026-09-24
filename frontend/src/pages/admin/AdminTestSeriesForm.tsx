import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Button, Field, Input, Select, btn } from '../../components/ui/Primitives';
import { RichTextEditor } from '../../components/ui/RichText';
import { removeSeriesThumbnail, uploadSeriesThumbnail, createTestSeries, fetchAdminSeries, updateTestSeries } from '../../services/test-series/testSeries.slice';
import type { SeriesPayload, SeriesStatus } from '../../services/test-series/testSeries.api';
import type { AppDispatch, RootState } from '../../store';
import { ThumbnailInput } from '../../components/courses/ThumbnailInput';

type Draft = { title: string; description: string; exam: string; kind: string; access: 'free' | 'paid'; price: string; difficulty: string; languages: string; status: SeriesStatus };
const blank: Draft = { title: '', description: '', exam: '', kind: '', access: 'paid', price: '499', difficulty: '', languages: 'English', status: 'draft' };

export function AdminTestSeriesForm() {
  const { seriesId } = useParams(); const editing = Boolean(seriesId); const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate();
  const { current, loading, saving, error } = useSelector((state: RootState) => state.testSeries); const [draft, setDraft] = useState<Draft>(blank);
  const [useSubjects, setUseSubjects] = useState(false); const [subjects, setSubjects] = useState<string[]>([]);
  const loadedId = useRef('');
  useEffect(() => { if (seriesId) dispatch(fetchAdminSeries(seriesId)); }, [seriesId, dispatch]);
  useEffect(() => { if (seriesId && current?._id === seriesId && loadedId.current !== seriesId) { loadedId.current = seriesId; setDraft({ title: current.title, description: current.description, exam: current.exam, kind: current.kind, access: current.access, price: String(current.price), difficulty: current.difficulty, languages: current.languages, status: current.status }); setSubjects(current.subjects || []); setUseSubjects(Boolean(current.subjects?.length)); } }, [seriesId, current]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null); const [submitting, setSubmitting] = useState(false); const [uploadError, setUploadError] = useState(''); const savedId = useRef('');
  const set = (key: keyof Draft, value: string) => setDraft((item) => ({ ...item, [key]: value } as Draft));
  const removeThumbnail = async () => {
    const id = seriesId || savedId.current;
    if (!id || !window.confirm('Remove this thumbnail and permanently delete its uploaded image?')) return;
    setSubmitting(true); setUploadError('');
    try { await dispatch(removeSeriesThumbnail(id)).unwrap(); }
    catch (failure) { setUploadError(String(failure)); } finally { setSubmitting(false); }
  };
  const assignedSubjects = new Set((current && current._id === seriesId ? current.tests : []).map((test) => test.subject).filter(Boolean));
  const toggleSubjects = (enabled: boolean) => { if (!enabled && assignedSubjects.size) { setUploadError('Move tests to General tests before removing their subject folders.'); return; } setUploadError(''); setUseSubjects(enabled); };
  const renameSubject = (index: number, name: string) => { if (assignedSubjects.has(subjects[index])) { setUploadError('Move tests out of this subject before renaming it.'); return; } setUploadError(''); setSubjects((items) => items.map((item, i) => i === index ? name : item)); };
  const removeSubject = (index: number) => { if (assignedSubjects.has(subjects[index])) { setUploadError('Move tests out of this subject before removing it.'); return; } setUploadError(''); setSubjects((items) => items.filter((_item, i) => i !== index)); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (submitting) return; setSubmitting(true); setUploadError('');
    try {
      const selectedSubjects = useSubjects ? subjects.map((subject) => subject.trim()) : [];
      if (useSubjects && (!selectedSubjects.length || selectedSubjects.some((subject) => !subject || subject.length > 120))) throw new Error('Add at least one subject name of up to 120 characters, or turn off subject folders.');
      if (new Set(selectedSubjects.map((subject) => subject.toLowerCase())).size !== selectedSubjects.length) throw new Error('Subject names must be unique.');
      const payload: SeriesPayload = { ...draft, subjects: selectedSubjects, price: draft.access === 'free' ? 0 : Number(draft.price) };
      const targetId = seriesId || savedId.current;
      const saved = targetId ? await dispatch(updateTestSeries({ id: targetId, payload })).unwrap() : await dispatch(createTestSeries(payload)).unwrap();
      savedId.current = saved._id;
      if (thumbnailFile) await dispatch(uploadSeriesThumbnail({ id: saved._id, file: thumbnailFile })).unwrap();
      navigate(`/admin/test-series/${saved._id}`);
    } catch (failure) { setUploadError(String(failure)); } finally { setSubmitting(false); }
  };

  if (editing && loading) return <PageShell title="Edit Test Series" subtitle="Loading series..." width="max-w-4xl"><Panel><p className="text-sm text-ink-muted">Loading details...</p></Panel></PageShell>;
  return <PageShell title={editing ? 'Edit Test Series' : 'Create Test Series'} subtitle="Set the series details, then add individual tests." width="max-w-4xl"><form onSubmit={(event) => { submit(event).catch(() => undefined); }} className="space-y-5"><Panel><div className="grid gap-4 sm:grid-cols-2">
    <Field label="Series name" className="sm:col-span-2"><Input required value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="SSC CGL Full Mock Test Series" /></Field><Field label="Description" className="sm:col-span-2" hint="Use formatting, lists, superscript or subscript as needed."><RichTextEditor value={draft.description} onChange={(value) => set('description', value)} placeholder="Describe the test series" minHeight="140px" ariaLabel="Test series description" /></Field>
    <ThumbnailInput kind="test-series" file={thumbnailFile} url={current?._id === (seriesId || savedId.current) ? current.thumbnail : undefined} title={draft.title} onChange={setThumbnailFile} onRemove={removeThumbnail} disabled={saving || submitting} />
    <Field label="Exam"><Input required maxLength={120} value={draft.exam} onChange={(e) => set('exam', e.target.value)} placeholder="e.g. State Exams" /></Field><Field label="Test type"><Input required maxLength={120} value={draft.kind} onChange={(e) => set('kind', e.target.value)} placeholder="e.g. Full Mock" /></Field>
    <Field label="Difficulty"><Input required maxLength={120} value={draft.difficulty} onChange={(e) => set('difficulty', e.target.value)} placeholder="e.g. Moderate" /></Field><Field label="Language"><Select value={draft.languages} onChange={(e) => set('languages', e.target.value)}><option>English</option><option>Hindi</option><option>English + Hindi</option></Select></Field>
    <Field label="Access"><Select value={draft.access} onChange={(e) => set('access', e.target.value)}><option value="paid">Paid</option><option value="free">Free</option></Select></Field>{draft.access === 'paid' && <Field label="Price (₹)"><Input type="number" min="1" required value={draft.price} onChange={(e) => set('price', e.target.value)} /></Field>}<Field label="Status"><Select value={draft.status} onChange={(e) => set('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="unpublished">Unpublished</option></Select></Field>
  </div></Panel>
  <Panel><label className="flex items-start gap-3"><input type="checkbox" checked={useSubjects} onChange={(event) => toggleSubjects(event.target.checked)} className="mt-1 h-4 w-4" /><span><span className="block text-base font-semibold text-ink">Organize tests by subject (optional)</span><span className="mt-1 block text-[13px] text-ink-muted">Series → Subjects → Tests. Leave this off to add tests directly to the series.</span></span></label>{useSubjects && <div className="mt-5 space-y-3">{subjects.map((subject, index) => <div key={index} className="flex items-center gap-3"><Input required maxLength={120} disabled={assignedSubjects.has(subject)} value={subject} onChange={(event) => renameSubject(index, event.target.value)} aria-label={`Subject ${index + 1} name`} placeholder="Subject name, e.g. Mathematics" /><Button type="button" variant="ghost" size="sm" disabled={assignedSubjects.has(subject)} onClick={() => removeSubject(index)} aria-label="Remove subject"><Trash2Icon className="h-4 w-4" /></Button></div>)}<Button type="button" variant="secondary" size="sm" onClick={() => setSubjects((items) => [...items, ''])}><PlusIcon className="h-4 w-4" />Add Subject</Button>{assignedSubjects.size > 0 && <p className="text-xs text-ink-muted">To rename or remove a subject already used by tests, move those tests to another folder first.</p>}</div>}</Panel>
  {(error || uploadError) && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{uploadError || error}</p>}<div className="flex justify-end gap-2"><Link to="/admin/test-series" className={btn('secondary', 'md')}>Cancel</Link><Button type="submit" disabled={saving || submitting}>{(saving || submitting) ? 'Saving…' : editing ? 'Update series' : 'Save series and add tests'}</Button></div></form></PageShell>;
}
