import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { PageShell } from '../../components/ui/PageShell';
import { Badge, StatusBadge, btn, inputClass } from '../../components/ui/Primitives';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';
import { deleteCourse, fetchAdminCourses, updateCourse } from '../../services/courses/courses.slice';
import type { AppDispatch, RootState } from '../../store';
import { CourseThumbnail } from '../../components/courses/CourseThumbnail';

export function AdminCourses() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading, saving, error } = useSelector((state: RootState) => state.courses);
  const [query, setQuery] = useState('');
  useEffect(() => { dispatch(fetchAdminCourses()); }, [dispatch]);
  const rows = useMemo(() => items.filter((course) => !query.trim() || `${course.title} ${course.exam}`.toLowerCase().includes(query.toLowerCase())), [items, query]);

  const toggleStatus = async (courseId: string) => {
    const course = items.find((item) => item._id === courseId);
    if (!course) return;
    await dispatch(updateCourse({ id: courseId, payload: { ...course, status: course.status === 'published' ? 'unpublished' : 'published' } })).unwrap();
  };
  const remove = async (courseId: string) => {
    if (window.confirm('Delete this course and all its lectures?')) await dispatch(deleteCourse(courseId));
  };

  return <PageShell title="Courses" subtitle="Manage courses, lectures and publishing." width="max-w-[1400px]" actions={<>
    <div className="relative"><SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses..." aria-label="Search courses" className={`${inputClass} h-10 w-56 pl-10`} /></div>
    <Link to="/admin/courses/new" className={btn('primary', 'md')}><PlusIcon className="h-4 w-4" /> Create Course</Link>
  </>}>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
    <TableWrap footer={loading ? 'Loading courses...' : `${rows.length} of ${items.length} courses`}>
      <Table><thead><tr><Th>Course</Th><Th>Exam</Th><Th>Type</Th><Th>Lectures</Th><Th>Status</Th><Th>Created</Th><Th className="text-right">Actions</Th></tr></thead>
        <tbody>{!loading && rows.length === 0 && <tr><td className="border-b border-line px-5 py-10 text-center text-sm text-ink-muted" colSpan={7}>No courses found.</td></tr>}{rows.map((course) => <tr key={course._id} className="transition-colors hover:bg-canvas/60">
          <Td><div className="flex items-center gap-3"><CourseThumbnail src={course.thumbnail} alt={course.title} className="h-10 w-16 rounded-lg object-cover" /><div className="min-w-0"><p className="truncate font-medium text-ink">{course.title}</p><p className="text-xs text-ink-muted">By {course.instructor}</p></div></div></Td>
          <Td>{course.exam}</Td><Td><Badge tone={course.access === 'free' ? 'green' : 'violet'}>{course.access === 'free' ? 'Free' : `₹${course.price.toLocaleString('en-IN')}`}</Badge></Td>
          <Td className="tabular-nums">{course.lectures?.length || 0}</Td><Td><StatusBadge status={course.status} /></Td><Td className="whitespace-nowrap text-ink-muted">{new Date(course.createdAt).toLocaleDateString('en-IN')}</Td>
          <Td><RowActions onView={() => navigate(`/admin/courses/${course._id}/edit`)} onEdit={() => navigate(`/admin/courses/${course._id}/edit`)} onDelete={() => remove(course._id)} extra={<button disabled={saving} type="button" onClick={() => toggleStatus(course._id)} className={btn('secondary', 'sm', 'mr-1')}>{course.status === 'published' ? 'Unpublish' : 'Publish'}</button>} /></Td>
        </tr>)}</tbody>
      </Table>
    </TableWrap>
  </PageShell>;
}
