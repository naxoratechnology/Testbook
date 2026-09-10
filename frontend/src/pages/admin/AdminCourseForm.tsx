import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileTextIcon, PlusIcon, Trash2Icon, UploadCloudIcon, VideoIcon } from 'lucide-react';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Button, Field, Input, Select, Textarea, btn } from '../../components/ui/Primitives';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
type Lecture = { name: string; description: string; video: File | null; pdf: File | null };

export function AdminCourseForm() {
  const navigate = useNavigate();
  const [course, setCourse] = useState({ title: '', description: '', exam: 'SSC', category: 'SSC CGL', instructor: '', thumbnail: '', access: 'paid', price: '1499' });
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const update = (key: keyof typeof course, value: string) => setCourse((current) => ({ ...current, [key]: value }));
  const addLecture = () => setLectures((current) => [...current, { name: '', description: '', video: null, pdf: null }]);
  const updateLecture = (index: number, value: Partial<Lecture>) => setLectures((current) => current.map((lecture, i) => i === index ? { ...lecture, ...value } : lecture));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = await axios.post(API + '/courses', { ...course, access: course.access, price: Number(course.price || 0), lectures: [], status: 'draft' }, { withCredentials: true });
      const created = response.data.data.course;
      for (const lecture of lectures) {
        if (!lecture.video) continue;
        const body = new FormData(); body.append('video', lecture.video); if (lecture.pdf) body.append('pdf', lecture.pdf); body.append('title', lecture.name); body.append('description', lecture.description);
        await axios.post(API + '/courses/' + created._id + '/lectures', body, { withCredentials: true });
      }
      navigate('/admin/courses');
    } catch (e) { setError(axios.isAxiosError(e) ? e.response?.data?.message || 'Unable to save course.' : 'Unable to save course.'); }
    finally { setSaving(false); }
  };

  return <PageShell title="Create Course" subtitle="Create one course, then add its lectures." width="max-w-4xl"><form onSubmit={submit} className="space-y-5">
    <Panel><h2 className="text-base font-semibold text-ink">Course details</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
      <Field label="Course name" className="sm:col-span-2"><Input required value={course.title} onChange={(e) => update('title', e.target.value)} placeholder="SSC CGL Complete Preparation" /></Field>
      <Field label="Short description" className="sm:col-span-2"><Textarea required rows={3} value={course.description} onChange={(e) => update('description', e.target.value)} placeholder="What will students learn?" /></Field>
      <Field label="Exam"><Input required value={course.exam} onChange={(e) => update('exam', e.target.value)} /></Field><Field label="Category"><Input required value={course.category} onChange={(e) => update('category', e.target.value)} /></Field><Field label="Instructor"><Input required value={course.instructor} onChange={(e) => update('instructor', e.target.value)} /></Field><Field label="Thumbnail URL"><Input required value={course.thumbnail} onChange={(e) => update('thumbnail', e.target.value)} placeholder="https://..." /></Field>
      <Field label="Access"><Select value={course.access} onChange={(e) => update('access', e.target.value)}><option value="paid">Paid</option><option value="free">Free</option></Select></Field>{course.access === 'paid' && <Field label="Price (₹)"><Input type="number" min="1" value={course.price} onChange={(e) => update('price', e.target.value)} /></Field>}
    </div></Panel>
    <Panel><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-ink">Lectures</h2><p className="mt-1 text-[13px] text-ink-muted">Each lecture has a video and optional PDF notes.</p></div><Button type="button" variant="secondary" size="sm" onClick={addLecture}><PlusIcon className="h-4 w-4" /> Add lecture</Button></div>
      <div className="mt-4 space-y-3">{lectures.length === 0 && <p className="rounded-xl bg-canvas px-4 py-8 text-center text-sm text-ink-muted">No lectures yet. Click Add lecture.</p>}{lectures.map((lecture, index) => <div key={index} className="rounded-xl border border-line p-4"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-ink">Lecture {index + 1}</p><button type="button" onClick={() => setLectures((current) => current.filter((_item, i) => i !== index))} className="text-ink-muted hover:text-red-600"><Trash2Icon className="h-4 w-4" /></button></div><div className="grid gap-3 sm:grid-cols-2"><Input required value={lecture.name} onChange={(e) => updateLecture(index, { name: e.target.value })} placeholder="Lecture name" /><label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3 text-xs text-ink-soft"><VideoIcon className="h-4 w-4" /><span className="truncate">{lecture.video?.name || 'Choose video'}</span><input required type="file" accept="video/*" className="hidden" onChange={(e) => updateLecture(index, { video: e.target.files?.[0] || null })} /></label><Textarea className="sm:col-span-2" rows={2} required value={lecture.description} onChange={(e) => updateLecture(index, { description: e.target.value })} placeholder="Short lecture description" /><label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3 text-xs text-ink-soft"><FileTextIcon className="h-4 w-4" /><span className="truncate">{lecture.pdf?.name || 'Optional PDF notes'}</span><input type="file" accept="application/pdf" className="hidden" onChange={(e) => updateLecture(index, { pdf: e.target.files?.[0] || null })} /></label></div></div>)}</div>
    </Panel>
    {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}<div className="flex justify-end gap-2"><Link to="/admin/courses" className={btn('secondary', 'md')}>Cancel</Link><Button type="submit" disabled={saving}>{saving ? 'Saving and uploading…' : 'Save course'}</Button></div>
  </form></PageShell>;
}
