import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { XIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell, Panel, StatCard } from '../../components/ui/PageShell';
import { Button, Field, Select, StatusBadge, btn } from '../../components/ui/Primitives';
import { Table, TableWrap, Td, Th } from '../../components/admin/DataTable';
import { Avatar } from '../../components/layout/Navbar';
import { fetchStudent, grantStudentAccess, updateStudentStatus } from '../../services/students/students.slice';
import { notesApiService, type NotesCollection } from '../../services/notes/notes.api';
import type { AppDispatch, RootState } from '../../store';

type NotesAccessOption = Pick<NotesCollection, '_id' | 'title' | 'exam' | 'access' | 'status' | 'price'>;

export function AdminStudentDetail() {
  const { studentId = '' } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { current: student, loading, saving, error } = useSelector((state: RootState) => state.students);
  const [type, setType] = useState<'course' | 'test-series' | 'notes'>('course');
  const [contentId, setContentId] = useState('');
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [preview, setPreview] = useState(false);
  const [publishedNotes, setPublishedNotes] = useState<NotesAccessOption[]>([]);

  useEffect(() => { if (studentId) dispatch(fetchStudent(studentId)); }, [studentId, dispatch]);
  useEffect(() => {
    let active = true;
    notesApiService.listCollections(true)
      .then((response) => {
        if (!active) return;
        setPublishedNotes((response.data.data.collections || []).filter((item: NotesCollection) => item.access === 'paid' && item.status === 'published'));
      })
      .catch(() => { if (active) setPublishedNotes([]); });
    return () => { active = false; };
  }, []);
  useEffect(() => { setContentId(''); setMessage(''); setActionError(''); }, [type]);

  if (loading) return <PageShell title="Student"><Panel>Loading student...</Panel></PageShell>;
  if (!student) return <PageShell title="Student unavailable"><Panel>{error}<Link className={btn('secondary', 'md', 'mt-4')} to="/admin/students">Back</Link></Panel></PageShell>;

  const ownedNoteExams = new Set((student.purchasedNotes || []).map((item) => (item as typeof item & { exam?: string }).exam).filter(Boolean));
  const noteOptions = Array.from(new Map([
    ...(student.accessOptions?.notes || []),
    ...publishedNotes,
  ].map((item) => [item._id, item])).values()).filter((item) => !ownedNoteExams.has((item as typeof item & { exam?: string }).exam));
  const options = type === 'course' ? student.accessOptions?.courses || [] : type === 'test-series' ? student.accessOptions?.testSeries || [] : noteOptions;
  const grant = async () => {
    if (!contentId) return;
    setMessage('');
    setActionError('');
    try {
      await dispatch(grantStudentAccess({ id: student._id, type, contentId })).unwrap();
      setContentId('');
      setMessage('Access granted successfully.');
    } catch (failure) {
      setActionError(typeof failure === 'string' ? failure : 'Unable to grant access.');
    }
  };

  return <PageShell title={student.name} subtitle={`Registered ${new Date(student.createdAt).toLocaleDateString('en-IN')} · ${student.targetExam || 'No target exam'}`} width="max-w-[1200px]" actions={<><Link to="/admin/students" className={btn('secondary', 'md')}>Back to students</Link><Button variant={student.isActive ? 'danger' : 'primary'} disabled={saving} onClick={() => dispatch(updateStudentStatus({ id: student._id, isActive: !student.isActive }))}>{student.isActive ? 'Deactivate' : 'Activate'}</Button></>}>
    <div className="grid gap-5 lg:grid-cols-[1fr_2fr] lg:items-start">
      <Panel><div className="flex items-center gap-4"><Avatar name={student.name} size={56}/><div><b>{student.name}</b><StatusBadge status={student.isActive ? 'active' : 'inactive'}/></div></div><div className="mt-4 space-y-2 border-t border-line pt-4 text-sm"><p>{student.email}</p><p>{student.mobile}</p><p>{student.targetExam}</p></div><div className="mt-4 border-t border-line pt-4"><b>Identity document</b>{student.identityDocumentUrl ? <Button size="sm" className="mt-3 w-full" onClick={() => setPreview(true)}>View identity document</Button> : <p className="mt-2 text-sm text-ink-muted">No document submitted.</p>}</div></Panel>
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Courses" value={String(student.enrolledCourses?.length || 0)}/><StatCard label="Test series" value={String(student.purchasedSeries?.length || 0)}/><StatCard label="Paid notes" value={String(student.purchasedNotes?.length || 0)}/></div>
        <Panel><b>Grant paid content access</b><div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end"><Field label="Content type"><Select value={type} onChange={(event) => setType(event.target.value as typeof type)}><option value="course">Paid course</option><option value="test-series">Paid test series</option><option value="notes">Paid notes</option></Select></Field><Field label="Content"><Select value={contentId} onChange={(event) => setContentId(event.target.value)}><option value="">Select content</option>{options.map((item) => <option key={item._id} value={item._id}>{item.title} · ₹{item.price}</option>)}</Select></Field><Button disabled={!contentId || saving} onClick={() => void grant()}>Grant access</Button></div>{message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}{(actionError || error) && <p className="mt-3 text-sm text-red-600">{actionError || error}</p>}</Panel>
        <Panel><b>Granted notes</b>{!student.purchasedNotes?.length && <p className="mt-2 text-sm text-ink-muted">No paid notes access.</p>}{student.purchasedNotes?.map((item) => <p key={item._id} className="mt-2 rounded-xl border border-line p-3 text-sm">{item.title}</p>)}</Panel>
        <div><b>Test attempts</b><TableWrap><Table><thead><tr><Th>Test</Th><Th>Score</Th><Th>Accuracy</Th></tr></thead><tbody>{(student.testAttempts || []).map((item) => <tr key={item._id}><Td>{item.testTitle}</Td><Td>{item.score}</Td><Td>{item.accuracy}%</Td></tr>)}</tbody></Table></TableWrap></div>
      </div>
    </div>
    {preview && student.identityDocumentUrl && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4" onMouseDown={(event) => event.target === event.currentTarget && setPreview(false)}><div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-3"><b>{student.identityDocumentName || 'Identity document'}</b><button type="button" aria-label="Close document" onClick={() => setPreview(false)}><XIcon/></button></div><iframe className="min-h-0 flex-1" src={student.identityDocumentUrl} title="Identity document"/></div></div>}
  </PageShell>;
}
