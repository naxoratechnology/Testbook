import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { courses } from '../../data/courses';
import { PageShell } from '../../components/ui/PageShell';
import { Badge, StatusBadge, btn, inputClass } from '../../components/ui/Primitives';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';
import { PublishStatus } from '../../types';

export function AdminCourses() {
  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState<Record<string, PublishStatus>>(
    Object.fromEntries(courses.map((c) => [c.id, c.status]))
  );

  const rows = courses.filter((c) =>
  query.trim() ? (c.title + c.exam).toLowerCase().includes(query.toLowerCase()) : true
  );

  const toggle = (id: string) =>
  setStatuses((s) => ({ ...s, [id]: s[id] === 'published' ? 'unpublished' : 'published' }));

  return (
    <PageShell
      title="Courses"
      subtitle="Manage course content, sections and publishing."
      width="max-w-[1400px]"
      actions={
      <>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses..."
            aria-label="Search courses"
            className={`${inputClass} h-10 w-56 pl-10`} />
          
          </div>
          <Link to="/admin/courses/new" className={btn('primary', 'md')}>
            <PlusIcon className="h-4 w-4" /> Create Course
          </Link>
        </>
      }>
      
      <TableWrap footer={`${rows.length} of ${courses.length} courses`}>
        <Table>
          <thead>
            <tr>
              <Th>Course</Th>
              <Th>Exam</Th>
              <Th>Type</Th>
              <Th>Lessons</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((course) =>
            <tr key={course.id} className="transition-colors duration-150 ease-smooth hover:bg-canvas/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <img src={course.thumbnail} alt="" className="h-10 w-16 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{course.title}</p>
                      <p className="text-xs text-ink-muted">By {course.instructor}</p>
                    </div>
                  </div>
                </Td>
                <Td>{course.exam}</Td>
                <Td>
                  <Badge tone={course.type === 'free' ? 'green' : 'violet'}>
                    {course.type === 'free' ? 'Free' : `₹${course.price?.toLocaleString('en-IN')}`}
                  </Badge>
                </Td>
                <Td className="tabular-nums">{course.lessons}</Td>
                <Td>
                  <StatusBadge status={statuses[course.id]} />
                </Td>
                <Td className="whitespace-nowrap text-ink-muted">{course.created}</Td>
                <Td>
                  <RowActions
                  extra={
                  <button type="button" onClick={() => toggle(course.id)} className={btn('secondary', 'sm', 'mr-1')}>
                        {statuses[course.id] === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                  } />
                
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableWrap>
    </PageShell>);

}