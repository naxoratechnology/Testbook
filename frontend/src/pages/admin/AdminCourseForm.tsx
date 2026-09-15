import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FileTextIcon, PlusIcon, Trash2Icon, VideoIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Button, Field, Input, Select, Textarea, btn } from '../../components/ui/Primitives';
import { addCourseLecture, clearCurrentCourse, createCourse, deleteCourseLecture, fetchCourse, updateCourse } from '../../services/courses/courses.slice';
import type { CourseAccess, CoursePayload, CourseStatus } from '../../services/courses/courses.api';
import type { AppDispatch, RootState } from '../../store';

type NewLecture = { name: string; description: string; video: File | null; pdf: File | null };
type FormState = { title: string; description: string; exam: string; category: string; instructor: string; thumbnail: string; access: CourseAccess; price: string; status: CourseStatus };
const emptyCourse: FormState = { title: '', description: '', exam: 'SSC', category: 'SSC CGL', instructor: '', thumbnail: '', access: 'paid', price: '1499', status: 'draft' };

export function AdminCourseForm() {
  const { courseId } = useParams();
  const editing = Boolean(courseId);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { current, loading, saving, error } = useSelector((state: RootState) => state.courses);
  const [course, setCourse] = useState<FormState>(emptyCourse);
  const [lectures, setLectures] = useState<NewLecture[]>([]);

  useEffect(() => {
    if (courseId) dispatch(fetchCourse(courseId)); else dispatch(clearCurrentCourse());
  }, [courseId, dispatch]);
  useEffect(() => {
    if (current && current._id === courseId) setCourse({ title: current.title, description: current.description, exam: current.exam, category: current.category, instructor: current.instructor, thumbnail: current.thumbnail, access: current.access, price: String(current.price), status: current.status });
  }, [current, courseId]);

  const update = (key: keyof FormState, value: string) => setCourse((item) => ({ ...item, [key]: value }));
  const addLecture = () => setLectures((items) => [...items, { name: '', description: '', video: null, pdf: null }]);
  const updateLecture = (index: number, value: Partial<NewLecture>) => setLectures((items) => items.map((lecture, i) => i === index ? { ...lecture, ...value } : lecture));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: CoursePayload = { ...course, price: course.access === 'free' ? 0 : Number(course.price), lectures: editing ? current?.lectures || [] : [] };
    const saved = editing && courseId
      ? await dispatch(updateCourse({ id: courseId, payload })).unwrap()
      : await dispatch(createCourse(payload)).unwrap();
    for (const lecture of lectures) {
      if (!lecture.video) continue;
      await dispatch(addCourseLecture({ courseId: saved._id, lecture: { title: lecture.name, description: lecture.description, video: lecture.video, pdf: lecture.pdf } })).unwrap();
    }
    navigate('/admin/courses');
  };
  const removeExistingLecture = async (lectureId: string) => {
    if (courseId && window.confirm('Delete this lecture and its uploaded files?')) await dispatch(deleteCourseLecture({ courseId, lectureId }));
  };

  if (editing && loading) return <PageShell title="Edit Course" subtitle="Loading course..." width="max-w-4xl"><Panel><p className="text-sm text-ink-muted">Loading course details...</p></Panel></PageShell>;
  return <PageShell title={editing ? 'Edit Course' : 'Create Course'} subtitle={editing ? 'Update course details and manage lectures.' : 'Create one course, then add its lectures.'} width="max-w-4xl">
    <form onSubmit={(event) => { submit(event).catch(() => undefined); }} className="space-y-5">
      <Panel><h2 className="text-base font-semibold text-ink">Course details</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Course name" className="sm:col-span-2"><Input required value={course.title} onChange={(e) => update('title', e.target.value)} placeholder="SSC CGL Complete Preparation" /></Field>
        <Field label="Short description" className="sm:col-span-2"><Textarea required rows={3} value={course.description} onChange={(e) => update('description', e.target.value)} placeholder="What will students learn?" /></Field>
        <Field label="Exam"><Input required value={course.exam} onChange={(e) => update('exam', e.target.value)} /></Field><Field label="Category"><Input required value={course.category} onChange={(e) => update('category', e.target.value)} /></Field>
        <Field label="Instructor"><Input required value={course.instructor} onChange={(e) => update('instructor', e.target.value)} /></Field><Field label="Thumbnail URL"><Input required type="url" value={course.thumbnail} onChange={(e) => update('thumbnail', e.target.value)} placeholder="https://..." /></Field>
        <Field label="Access"><Select value={course.access} onChange={(e) => update('access', e.target.value)}><option value="paid">Paid</option><option value="free">Free</option></Select></Field>
        {course.access === 'paid' && <Field label="Price (₹)"><Input required type="number" min="1" value={course.price} onChange={(e) => update('price', e.target.value)} /></Field>}
        <Field label="Status"><Select value={course.status} onChange={(e) => update('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="unpublished">Unpublished</option></Select></Field>
      </div></Panel>
      <Panel><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-ink">Lectures</h2><p className="mt-1 text-[13px] text-ink-muted">Each lecture has a video and optional PDF notes.</p></div><Button type="button" variant="secondary" size="sm" onClick={addLecture}><PlusIcon className="h-4 w-4" /> Add lecture</Button></div>
        {editing && current?.lectures.length ? <div className="mt-4 space-y-2">{current.lectures.map((lecture, index) => <div key={lecture._id} className="flex items-center justify-between rounded-xl border border-line px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-ink">{index + 1}. {lecture.title}</p><p className="text-xs text-ink-muted">Video{lecture.pdfUrl ? ' + PDF notes' : ''}</p></div><button type="button" disabled={saving} onClick={() => removeExistingLecture(lecture._id)} aria-label="Delete lecture" className="text-ink-muted hover:text-red-600"><Trash2Icon className="h-4 w-4" /></button></div>)}</div> : null}
        <div className="mt-4 space-y-3">{!current?.lectures.length && lectures.length === 0 && <p className="rounded-xl bg-canvas px-4 py-8 text-center text-sm text-ink-muted">No lectures yet. Click Add lecture.</p>}{lectures.map((lecture, index) => <div key={index} className="rounded-xl border border-line p-4"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-ink">New lecture {index + 1}</p><button type="button" onClick={() => setLectures((items) => items.filter((_item, i) => i !== index))} className="text-ink-muted hover:text-red-600"><Trash2Icon className="h-4 w-4" /></button></div><div className="grid gap-3 sm:grid-cols-2">
          <Input required value={lecture.name} onChange={(e) => updateLecture(index, { name: e.target.value })} placeholder="Lecture name" /><label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3 text-xs text-ink-soft"><VideoIcon className="h-4 w-4" /><span className="truncate">{lecture.video?.name || 'Choose video'}</span><input required type="file" accept="video/*" className="hidden" onChange={(e) => updateLecture(index, { video: e.target.files?.[0] || null })} /></label>
          <Textarea className="sm:col-span-2" rows={2} required value={lecture.description} onChange={(e) => updateLecture(index, { description: e.target.value })} placeholder="Short lecture description" /><label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3 text-xs text-ink-soft"><FileTextIcon className="h-4 w-4" /><span className="truncate">{lecture.pdf?.name || 'Optional PDF notes'}</span><input type="file" accept="application/pdf" className="hidden" onChange={(e) => updateLecture(index, { pdf: e.target.files?.[0] || null })} /></label>
        </div></div>)}</div>
      </Panel>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2"><Link to="/admin/courses" className={btn('secondary', 'md')}>Cancel</Link><Button type="submit" disabled={saving}>{saving ? 'Saving and uploading…' : editing ? 'Update course' : 'Save course'}</Button></div>
    </form>
  </PageShell>;
}
