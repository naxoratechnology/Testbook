import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { MailIcon, TargetIcon } from 'lucide-react';
import { students } from '../../data/content';
import { courses } from '../../data/courses';
import { recentResults } from '../../data/testSeries';
import { PageShell, Panel, StatCard } from '../../components/ui/PageShell';
import { Badge, Progress, StatusBadge, btn } from '../../components/ui/Primitives';
import { Table, TableWrap, Td, Th } from '../../components/admin/DataTable';
import { Avatar } from '../../components/layout/Navbar';

export function AdminStudentDetail() {
  const { studentId = '' } = useParams();
  const student = students.find((s) => s.id === studentId) ?? students[0];

  return (
    <PageShell
      title={student.name}
      subtitle={`Registered ${student.registered} · ${student.targetExam}`}
      width="max-w-[1200px]"
      actions={
      <>
          <Link to="/admin/students" className={btn('secondary', 'md')}>
            Back to students
          </Link>
          <button type="button" className={btn(student.active ? 'danger' : 'primary', 'md')}>
            {student.active ? 'Deactivate' : 'Activate'}
          </button>
        </>
      }>
      
      <div className="grid gap-5 lg:grid-cols-[1fr_2fr] lg:items-start">
        <Panel>
          <div className="flex items-center gap-4">
            <Avatar name={student.name} size={56} />
            <div className="min-w-0">
              <p className="text-base font-bold text-ink">{student.name}</p>
              <StatusBadge status={student.active ? 'active' : 'inactive'} />
            </div>
          </div>
          <dl className="mt-5 space-y-3 border-t border-line pt-4 text-[13.5px]">
            <div className="flex items-center gap-3">
              <MailIcon className="h-4 w-4 shrink-0 text-ink-muted" />
              <dt className="sr-only">Email</dt>
              <dd className="min-w-0 truncate text-ink">{student.email}</dd>
            </div>
            <div className="flex items-center gap-3">
              <TargetIcon className="h-4 w-4 shrink-0 text-ink-muted" />
              <dt className="sr-only">Target exam</dt>
              <dd className="text-ink">{student.targetExam}</dd>
            </div>
          </dl>
        </Panel>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Enrolled courses" value={String(student.courses)} />
            <StatCard label="Test attempts" value={String(student.attempts)} />
            <StatCard label="Average score" value="74%" />
          </div>

          <Panel>
            <h2 className="text-base font-semibold text-ink">Enrolled courses</h2>
            <ul className="mt-4 space-y-3">
              {courses.slice(0, student.courses || 1).map((course) =>
              <li key={course.id} className="flex items-center gap-4 rounded-xl border border-line p-3.5">
                  <img src={course.thumbnail} alt="" className="h-11 w-16 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-ink">{course.title}</p>
                    <Progress value={course.progress ?? 35} className="mt-2 max-w-[220px]" />
                  </div>
                  <Badge tone={course.type === 'free' ? 'green' : 'violet'}>
                    {course.type === 'free' ? 'Free' : 'Paid'}
                  </Badge>
                </li>
              )}
            </ul>
          </Panel>

          <div>
            <h2 className="mb-3 text-base font-semibold text-ink">Test attempts</h2>
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>Test</Th>
                    <Th>Score</Th>
                    <Th>Accuracy</Th>
                    <Th>Date</Th>
                  </tr>
                </thead>
                <tbody>
                  {recentResults.map((result) =>
                  <tr key={result.id}>
                      <Td className="font-medium text-ink">{result.test}</Td>
                      <Td className="tabular-nums">{result.score}</Td>
                      <Td className="tabular-nums">{result.accuracy}</Td>
                      <Td className="whitespace-nowrap text-ink-muted">{result.date}</Td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </TableWrap>
          </div>
        </div>
      </div>
    </PageShell>);

}