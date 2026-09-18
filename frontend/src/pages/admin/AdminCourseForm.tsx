import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FileTextIcon, PlusIcon, Trash2Icon, VideoIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Button, Field, Input, Select, Textarea, btn } from '../../components/ui/Primitives';
import { removeCourseThumbnail, uploadCourseThumbnail, addCourseLecture, clearCurrentCourse, createCourse, deleteCourseLecture, fetchCourse, updateCourse } from '../../services/courses/courses.slice';
import type { CourseAccess, CoursePayload, CourseStatus } from '../../services/courses/courses.api';
import type { AppDispatch, RootState } from '../../store';
import { ThumbnailInput } from '../../components/courses/ThumbnailInput';

type NewLecture = { subject: string; source: 'upload' | 'youtube'; youtubeUrl: string; name: string; description: string; video: File | null; pdf: File | null };
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
  const [useSubjects, setUseSubjects] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [existingLectureSubjects, setExistingLectureSubjects] = useState<Record<string, string>>({});
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const savedId = useRef('');
  const loadedId = useRef('');

  useEffect(() => {
    if (courseId) dispatch(fetchCourse(courseId)); else dispatch(clearCurrentCourse());
  }, [courseId, dispatch]);
  useEffect(() => {
    if (current && current._id === courseId && loadedId.current !== courseId) { loadedId.current = courseId; setSubjects(current.subjects || []); setUseSubjects(Boolean(current.subjects?.length)); setExistingLectureSubjects(Object.fromEntries(current.lectures.map((lecture) => [lecture._id, lecture.subject || '']))); setCourse({ title: current.title, description: current.description, exam: current.exam, category: current.category, instructor: current.instructor, thumbnail: current.thumbnail || '', access: current.access, price: String(current.price), status: current.status }); }
  }, [current, courseId]);

  const update = (key: keyof FormState, value: string) => setCourse((item) => ({ ...item, [key]: value }));
  const addLecture = () => setLectures((items) => [...items, { subject: '', source: 'upload', youtubeUrl: '', name: '', description: '', video: null, pdf: null }]);
  const updateLecture = (index: number, value: Partial<NewLecture>) => setLectures((items) => items.map((lecture, i) => i === index ? { ...lecture, ...value } : lecture));

  const renameSubject = (index: number, name: string) => {
    const old = subjects[index];
    setSubjects((items) => items.map((subject, i) => i === index ? name : subject));
    if (old) { setLectures((items) => items.map((lecture) => lecture.subject === old ? { ...lecture, subject: name } : lecture)); setExistingLectureSubjects((items) => Object.fromEntries(Object.entries(items).map(([id, subject]) => [id, subject === old ? name : subject]))); }
  };
  const removeSubject = (index: number) => {
    const name = subjects[index];
    if (!window.confirm('Remove this subject? Its lectures will remain under General lectures.')) return;
    setSubjects((items) => items.filter((_subject, i) => i !== index));
    setLectures((items) => items.map((lecture) => lecture.subject === name ? { ...lecture, subject: '' } : lecture));
    setExistingLectureSubjects((items) => Object.fromEntries(Object.entries(items).map(([id, subject]) => [id, subject === name ? '' : subject])));
  };
  const removeThumbnail = async () => {
    const id = courseId || savedId.current;
    if (!id) { setCourse((value) => ({ ...value, thumbnail: '' })); return; }
    if (!window.confirm('Remove this thumbnail and permanently delete its uploaded image?')) return;
    setSubmitting(true); setUploadError('');
    try { await dispatch(removeCourseThumbnail(id)).unwrap(); setCourse((value) => ({ ...value, thumbnail: '' })); }
    catch (failure) { setUploadError(String(failure)); } finally { setSubmitting(false); }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true); setUploadError('');
    try {
    for (const lecture of lectures) {
      if (Boolean(lecture.video) === Boolean(lecture.youtubeUrl.trim())) throw new Error('Each lecture needs an uploaded video or a YouTube URL, not both.');
      if (lecture.source === 'youtube') { const url = new URL(lecture.youtubeUrl); if (!['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(url.hostname)) throw new Error('Enter a valid YouTube video URL.'); }
    }
    const selectedSubjects = useSubjects ? subjects.map((subject) => subject.trim()) : [];
    if (useSubjects && (!selectedSubjects.length || selectedSubjects.some((subject) => !subject))) throw new Error('Add at least one named subject, or disable subjects.');
    const payload: CoursePayload = { ...course, subjects: selectedSubjects, price: course.access === 'free' ? 0 : Number(course.price), lectures: (editing || savedId.current) ? (current?.lectures || []).map((lecture) => ({ ...lecture, subject: useSubjects ? (existingLectureSubjects[lecture._id] ?? lecture.subject ?? '').trim() : '' })) : [] };
    const targetId = courseId || savedId.current;
    const saved = targetId
      ? await dispatch(updateCourse({ id: targetId, payload })).unwrap()
      : await dispatch(createCourse(payload)).unwrap();
    savedId.current = saved._id;
    if (thumbnailFile) { const uploaded = await dispatch(uploadCourseThumbnail({ id: saved._id, file: thumbnailFile })).unwrap(); setCourse((value) => ({ ...value, thumbnail: uploaded.thumbnail })); setThumbnailFile(null); }
    for (const lecture of lectures) {
      await dispatch(addCourseLecture({ courseId: saved._id, lecture: { subject: useSubjects ? lecture.subject.trim() : '', title: lecture.name, description: lecture.description, video: lecture.video, youtubeUrl: lecture.youtubeUrl, pdf: lecture.pdf } })).unwrap();
    }
    navigate('/admin/courses');
    } catch (failure) { setUploadError(String(failure)); } finally { setSubmitting(false); }
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
        <Field label="Instructor"><Input required value={course.instructor} onChange={(e) => update('instructor', e.target.value)} /></Field><Field label="Thumbnail URL (optional)"><Input type="url" value={course.thumbnail} onChange={(e) => update('thumbnail', e.target.value)} placeholder="https://..." /></Field>
        <ThumbnailInput kind="course" file={thumbnailFile} url={course.thumbnail} title={course.title} onChange={setThumbnailFile} onRemove={removeThumbnail} disabled={saving || submitting} />
        <Field label="Access"><Select value={course.access} onChange={(e) => update('access', e.target.value)}><option value="paid">Paid</option><option value="free">Free</option></Select></Field>
        {course.access === 'paid' && <Field label="Price (₹)"><Input required type="number" min="1" value={course.price} onChange={(e) => update('price', e.target.value)} /></Field>}
        <Field label="Status"><Select value={course.status} onChange={(e) => update('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="unpublished">Unpublished</option></Select></Field>
      </div></Panel>
      <Panel><label className="flex items-start gap-3"><input type="checkbox" checked={useSubjects} onChange={(event) => setUseSubjects(event.target.checked)} className="mt-1 h-4 w-4" /><span><span className="block text-base font-semibold text-ink">Organize lectures by subject (optional)</span><span className="mt-1 block text-[13px] text-ink-muted">Course → Subjects → Lectures. Leave this off for a simple course with direct lectures.</span></span></label>{useSubjects && <div className="mt-5 space-y-3">{subjects.map((subject, index) => <div key={index} className="flex items-center gap-3"><Input required maxLength={120} value={subject} onChange={(event) => renameSubject(index, event.target.value)} aria-label={`Subject ${index + 1} name`} placeholder="Subject name, e.g. Mathematics" /><Button type="button" variant="ghost" size="sm" onClick={() => removeSubject(index)} aria-label="Remove subject"><Trash2Icon className="h-4 w-4" /></Button></div>)}<Button type="button" variant="secondary" size="sm" onClick={() => setSubjects((items) => [...items, ''])}><PlusIcon className="h-4 w-4" />Add Subject</Button></div>}</Panel>
      <Panel><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-ink">Lectures</h2><p className="mt-1 text-[13px] text-ink-muted">Choose an uploaded video or a YouTube URL for each lecture, with optional PDF notes.</p></div><Button type="button" variant="secondary" size="sm" onClick={addLecture}><PlusIcon className="h-4 w-4" /> Add lecture</Button></div>
        {editing && current?.lectures.length ? <div className="mt-4 space-y-2">{current.lectures.map((lecture, index) => <div key={lecture._id} className="flex items-center justify-between rounded-xl border border-line px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-ink">{index + 1}. {lecture.title}</p><p className="text-xs text-ink-muted">{lecture.videoSource === 'youtube' ? 'YouTube' : 'Video'}{lecture.pdfUrl ? ' + PDF notes' : ''}</p></div>{useSubjects && <Select aria-label={`Subject for ${lecture.title}`} className="!w-auto" value={existingLectureSubjects[lecture._id] ?? lecture.subject ?? ''} onChange={(event) => setExistingLectureSubjects((items) => ({ ...items, [lecture._id]: event.target.value }))}><option value="">General lectures</option>{subjects.filter((subject) => subject.trim()).map((subject, i) => <option key={i} value={subject}>{subject}</option>)}</Select>}<button type="button" disabled={saving} onClick={() => removeExistingLecture(lecture._id)} aria-label="Delete lecture" className="text-ink-muted hover:text-red-600"><Trash2Icon className="h-4 w-4" /></button></div>)}</div> : null}
        <div className="mt-4 space-y-3">{!current?.lectures.length && lectures.length === 0 && <p className="rounded-xl bg-canvas px-4 py-8 text-center text-sm text-ink-muted">No lectures yet. Click Add lecture.</p>}{lectures.map((lecture, index) => <div key={index} className="rounded-xl border border-line p-4"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-ink">New lecture {index + 1}</p><button type="button" onClick={() => setLectures((items) => items.filter((_item, i) => i !== index))} className="text-ink-muted hover:text-red-600"><Trash2Icon className="h-4 w-4" /></button></div><div className="grid gap-3 sm:grid-cols-2">
          {useSubjects && <Field label="Subject" className="sm:col-span-2"><Select value={lecture.subject} onChange={(event) => updateLecture(index, { subject: event.target.value })}><option value="">General lectures</option>{subjects.filter((subject) => subject.trim()).map((subject, i) => <option key={i} value={subject}>{subject}</option>)}</Select></Field>}<Input required value={lecture.name} onChange={(e) => updateLecture(index, { name: e.target.value })} placeholder="Lecture name" /><Select aria-label="Lecture video source" value={lecture.source} onChange={(e) => updateLecture(index, { source: e.target.value as 'upload' | 'youtube', video: null, youtubeUrl: '' })}><option value="upload">Upload video</option><option value="youtube">YouTube URL</option></Select>
          {lecture.source === 'youtube' ? <Field label="YouTube URL" className="sm:col-span-2"><Input required type="url" value={lecture.youtubeUrl} onChange={(e) => updateLecture(index, { youtubeUrl: e.target.value, video: null })} placeholder="https://www.youtube.com/watch?v=..." /></Field> : <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3 text-xs text-ink-soft"><VideoIcon className="h-4 w-4" /><span className="truncate">{lecture.video?.name || 'Choose video'}</span><input required type="file" accept="video/*" className="hidden" onChange={(e) => updateLecture(index, { video: e.target.files?.[0] || null })} /></label>}

          <Textarea className="sm:col-span-2" rows={2} required value={lecture.description} onChange={(e) => updateLecture(index, { description: e.target.value })} placeholder="Short lecture description" /><label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3 text-xs text-ink-soft"><FileTextIcon className="h-4 w-4" /><span className="truncate">{lecture.pdf?.name || 'Optional PDF notes'}</span><input type="file" accept="application/pdf" className="hidden" onChange={(e) => updateLecture(index, { pdf: e.target.files?.[0] || null })} /></label>
        </div></div>)}</div>
      </Panel>
      {(error || uploadError) && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{uploadError || error}</p>}
      <div className="flex justify-end gap-2"><Link to="/admin/courses" className={btn('secondary', 'md')}>Cancel</Link><Button type="submit" disabled={saving || submitting}>{(saving || submitting) ? 'Saving and uploading…' : editing ? 'Update course' : 'Save course'}</Button></div>
    </form>
  </PageShell>;
}
