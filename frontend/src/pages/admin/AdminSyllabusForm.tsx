import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Button, Field, Input, Select, btn } from '../../components/ui/Primitives';
import { createSyllabus, fetchAdminSyllabusDocument, updateSyllabus } from '../../services/syllabus/syllabus.slice';
import type { SyllabusStatus } from '../../services/syllabus/syllabus.api';
import type { AppDispatch, RootState } from '../../store';
export function AdminSyllabusForm() {
  const { syllabusId } = useParams(); const editing = Boolean(syllabusId); const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate(); const { current, loading, saving, error } = useSelector((state: RootState) => state.syllabus);
  const [name, setName] = useState(''); const [status, setStatus] = useState<SyllabusStatus>('draft'); const [file, setFile] = useState<File | null>(null);
  useEffect(() => { if (syllabusId) dispatch(fetchAdminSyllabusDocument(syllabusId)); }, [syllabusId, dispatch]);
  useEffect(() => { if (syllabusId && current?._id === syllabusId) { setName(current.name); setStatus(current.status); } }, [syllabusId, current]);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (syllabusId) await dispatch(updateSyllabus({ id: syllabusId, payload: { name, status } })).unwrap(); else { if (!file) return; await dispatch(createSyllabus({ name, status, file })).unwrap(); } navigate('/admin/syllabus'); };
  if (editing && loading) return <PageShell title="Edit Syllabus" subtitle="Loading syllabus..." width="max-w-3xl"><Panel><p className="text-sm text-ink-muted">Loading details...</p></Panel></PageShell>;
  return <PageShell title={editing ? 'Edit Syllabus' : 'Upload Syllabus'} subtitle="Add the syllabus name and PDF document." width="max-w-3xl"><form onSubmit={(event) => { submit(event).catch(() => undefined); }} className="space-y-5"><Panel><div className="grid gap-4"><Field label="Syllabus name"><Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="SSC CGL Syllabus" /></Field>{!editing && <Field label="PDF file" hint="PDF only · downloadable for students · maximum 50 MB"><Input required type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} /></Field>}{editing && current && <Field label="Current PDF"><a href={current.pdfUrl} target="_blank" rel="noreferrer" className={btn('secondary', 'md')}>View current PDF</a></Field>}<Field label="Status"><Select value={status} onChange={(e) => setStatus(e.target.value as SyllabusStatus)}><option value="draft">Draft</option><option value="published">Published</option><option value="unpublished">Unpublished</option></Select></Field></div></Panel>{error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}<div className="flex justify-end gap-2"><Link to="/admin/syllabus" className={btn('secondary', 'md')}>Cancel</Link><Button type="submit" disabled={saving || (!editing && !file)}>{saving ? 'Saving…' : editing ? 'Update syllabus' : 'Upload syllabus'}</Button></div></form></PageShell>;
}
