import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { exams } from '../../data/content';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Button, Field, Input, Select, Textarea, btn } from '../../components/ui/Primitives';
import { createNote, fetchAdminNote, fetchAdminNotes, removeNoteThumbnail, updateNote, uploadNoteThumbnail } from '../../services/notes/notes.slice';
import type { NotePayload, NotesStatus } from '../../services/notes/notes.api';
import type { AppDispatch, RootState } from '../../store';
import { SubjectFolderChoice } from '../../components/admin/SubjectFolderChoice';
import { ThumbnailInput } from '../../components/courses/ThumbnailInput';

type Draft = { name: string; description: string; exam: string; subject: string; status: NotesStatus; file: File | null };
const blank: Draft = { name: '', description: '', exam: 'SSC', subject: '', status: 'draft', file: null };

export function AdminNotesForm() {
  const { noteId } = useParams(); const editing = Boolean(noteId); const navigate = useNavigate(); const dispatch = useDispatch<AppDispatch>();
  const { current, items, loading, saving, error } = useSelector((state: RootState) => state.notes); const [draft, setDraft] = useState<Draft>(blank);
  const [useSubject, setUseSubject] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  useEffect(() => { if (noteId) dispatch(fetchAdminNote(noteId)); }, [noteId, dispatch]);
  useEffect(() => { if (!noteId) dispatch(fetchAdminNotes()); }, [dispatch, noteId]);
  useEffect(() => { if (noteId && current?._id === noteId) { setDraft({ name: current.name, description: current.description, exam: current.exam, subject: current.subject, status: current.status, file: null }); setUseSubject(current.subject !== 'General notes'); } }, [noteId, current]);
  const set = (key: keyof Draft, value: string | File | null) => setDraft((item) => ({ ...item, [key]: value } as Draft));
  const values = (): NotePayload => ({ name: draft.name, description: draft.description, exam: draft.exam, subject: useSubject ? draft.subject.trim() : 'General notes', status: draft.status });
  const submit = async (event: React.FormEvent) => { event.preventDefault(); let saved; if (noteId) saved = await dispatch(updateNote({ id: noteId, payload: values() })).unwrap(); else { if (!draft.file) return; saved = await dispatch(createNote({ ...values(), file: draft.file })).unwrap(); } if (thumbnailFile) await dispatch(uploadNoteThumbnail({ id: saved._id, file: thumbnailFile })).unwrap(); navigate('/admin/notes'); };
  const removeThumbnail = async () => { if (noteId && current?.thumbnail && window.confirm('Remove this notes thumbnail?')) await dispatch(removeNoteThumbnail(noteId)).unwrap(); };

  if (editing && loading) return <PageShell title="Edit Notes" subtitle="Loading notes..." width="max-w-4xl"><Panel><p className="text-sm text-ink-muted">Loading details...</p></Panel></PageShell>;
  return <PageShell title={editing ? 'Edit Notes' : 'Upload Notes'} subtitle={editing ? 'Update note information and publishing status.' : 'Upload a PDF document for students to read.'} width="max-w-4xl"><form onSubmit={(event) => { submit(event).catch(() => undefined); }} className="space-y-5"><Panel><div className="grid gap-4 sm:grid-cols-2">
    <Field label="Title" className="sm:col-span-2"><Input required value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Quantitative Aptitude Notes" /></Field><Field label="Exam"><Select value={draft.exam} onChange={(e) => set('exam', e.target.value)}>{exams.map((exam) => <option key={exam}>{exam}</option>)}</Select></Field>
    <ThumbnailInput kind="notes" file={thumbnailFile} url={current?.thumbnail} title={draft.name} onChange={setThumbnailFile} onRemove={removeThumbnail} disabled={saving} />
    {!editing && <Field label="PDF file" hint="PDF only · maximum 50 MB" className="sm:col-span-2"><Input required type="file" accept="application/pdf" onChange={(e) => set('file', e.target.files?.[0] || null)} /></Field>}{editing && current && <Field label="Current PDF" className="sm:col-span-2"><a href={current.pdfUrl} target="_blank" rel="noreferrer" className={btn('secondary', 'md')}>View current PDF</a></Field>}
    <Field label="Description" className="sm:col-span-2"><Textarea rows={3} value={draft.description} onChange={(e) => set('description', e.target.value)} placeholder="What these notes cover..." /></Field><Field label="Status"><Select value={draft.status} onChange={(e) => set('status', e.target.value)}><option value="published">Published</option><option value="draft">Draft</option><option value="unpublished">Unpublished</option></Select></Field>
  </div></Panel><SubjectFolderChoice content="notes" enabled={useSubject} onToggle={setUseSubject} value={draft.subject} onChange={(subject) => set('subject', subject)} generalLabel="General notes" suggestions={[...new Set([...items.map((note) => note.subject), 'Quantitative Aptitude', 'Reasoning', 'English', 'General Studies'])]} />{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}<div className="flex justify-end gap-2"><Link to="/admin/notes" className={btn('secondary', 'md')}>Cancel</Link><Button type="submit" disabled={saving || (!editing && !draft.file)}>{saving ? 'Saving…' : editing ? 'Update notes' : 'Upload notes'}</Button></div></form></PageShell>;
}
