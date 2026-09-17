import { ActionMenu } from '../../components/admin/ActionMenu';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell } from '../../components/ui/PageShell';
import { FilterChips, StatusBadge, inputClass } from '../../components/ui/Primitives';
import { Table, TableWrap, Td, Th } from '../../components/admin/DataTable';
import { deleteStudent, fetchStudents, updateStudentStatus } from '../../services/students/students.slice';
import type { AppDispatch, RootState } from '../../store';
export function AdminStudents() {
  const dispatch = useDispatch<AppDispatch>(); const navigate = useNavigate(); const { items, loading, saving, error } = useSelector((state: RootState) => state.students); const [query, setQuery] = useState(''); const [filter, setFilter] = useState('All');
  useEffect(() => { const timeout = window.setTimeout(() => dispatch(fetchStudents({ search: query.trim() || undefined, active: filter === 'All' ? undefined : filter === 'Active' })), 250); return () => window.clearTimeout(timeout); }, [dispatch, query, filter]);
  const remove = async (id: string) => { if (window.confirm('Permanently delete this student account?')) await dispatch(deleteStudent(id)); };
  return <PageShell title="Students" subtitle={`${items.length} registered students. Manage access and review activity.`} width="max-w-[1400px]" actions={<div className="relative"><SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students..." className={`${inputClass} h-10 w-60 pl-10`} /></div>}>
    <div className="mb-4"><FilterChips options={['All', 'Active', 'Inactive']} value={filter} onChange={setFilter} /></div>{error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}<TableWrap footer={loading ? 'Loading students...' : `${items.length} students shown`}><Table><thead><tr><Th>Student</Th><Th>Target exam</Th><Th>Purchased series</Th><Th>Tests attempted</Th><Th>Accuracy</Th><Th>Registered</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead><tbody>{!loading && !items.length && <tr><td colSpan={8} className="border-b border-line px-5 py-10 text-center text-sm text-ink-muted">No students found.</td></tr>}{items.map((student) => <tr key={student._id} className="hover:bg-canvas/60"><Td><p className="font-medium text-ink">{student.name}</p><p className="text-xs text-ink-muted">{student.email} · {student.mobile}</p></Td><Td>{student.targetExam || '—'}</Td><Td>{student.purchasedSeries}</Td><Td>{student.attempts}</Td><Td>{student.averageAccuracy}%</Td><Td>{new Date(student.createdAt).toLocaleDateString('en-IN')}</Td><Td><StatusBadge status={student.isActive ? 'active' : 'inactive'} /></Td><Td><div className="flex justify-end"><ActionMenu label={`Actions for ${student.name}`} actions={[
  { label: 'View student', onClick: () => navigate(`/admin/students/${student._id}`) },
  { label: student.isActive ? 'Deactivate' : 'Activate', danger: student.isActive, disabled: saving, onClick: () => { void dispatch(updateStudentStatus({ id: student._id, isActive: !student.isActive })); } },
  { label: 'Delete student', danger: true, disabled: saving, onClick: () => { void remove(student._id); } },
]} /></div></Td></tr>)}</tbody></Table></TableWrap>
  </PageShell>;
}
