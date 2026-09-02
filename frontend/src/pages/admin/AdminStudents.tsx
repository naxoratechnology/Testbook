import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import { students } from '../../data/content';
import { PageShell } from '../../components/ui/PageShell';
import { FilterChips, StatusBadge, btn, inputClass } from '../../components/ui/Primitives';
import { Table, TableWrap, Td, Th } from '../../components/admin/DataTable';

export function AdminStudents() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(students.map((s) => [s.id, s.active]))
  );

  const rows = useMemo(
    () =>
    students.
    filter((s) =>
    filter === 'All' ? true : filter === 'Active' ? active[s.id] : !active[s.id]
    ).
    filter((s) =>
    query.trim() ? (s.name + s.email + s.targetExam).toLowerCase().includes(query.toLowerCase()) : true
    ),
    [query, filter, active]
  );

  return (
    <PageShell
      title="Students"
      subtitle="12,540 registered students. Manage access and review activity."
      width="max-w-[1400px]"
      actions={
      <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students..."
          aria-label="Search students"
          className={`${inputClass} h-10 w-60 pl-10`} />
        
        </div>
      }>
      
      <div className="mb-4">
        <FilterChips options={['All', 'Active', 'Inactive']} value={filter} onChange={setFilter} />
      </div>

      <TableWrap footer={`${rows.length} students shown`}>
        <Table>
          <thead>
            <tr>
              <Th>Student</Th>
              <Th>Target exam</Th>
              <Th>Courses</Th>
              <Th>Tests attempted</Th>
              <Th>Registered</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((student) =>
            <tr key={student.id} className="transition-colors duration-150 ease-smooth hover:bg-canvas/60">
                <Td>
                  <p className="font-medium text-ink">{student.name}</p>
                  <p className="text-xs text-ink-muted">{student.email}</p>
                </Td>
                <Td>{student.targetExam}</Td>
                <Td className="tabular-nums">{student.courses}</Td>
                <Td className="tabular-nums">{student.attempts}</Td>
                <Td className="whitespace-nowrap text-ink-muted">{student.registered}</Td>
                <Td>
                  <StatusBadge status={active[student.id] ? 'active' : 'inactive'} />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-2">
                    <button
                    type="button"
                    onClick={() => navigate(`/admin/students/${student.id}`)}
                    className={btn('secondary', 'sm')}>
                    
                      View
                    </button>
                    <button
                    type="button"
                    onClick={() => setActive((a) => ({ ...a, [student.id]: !a[student.id] }))}
                    className={btn(active[student.id] ? 'danger' : 'primary', 'sm')}>
                    
                      {active[student.id] ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableWrap>

      {rows.length === 0 &&
      <p className="mt-4 text-center text-sm text-ink-soft">
          No students match this search.{' '}
          <Link to="/admin/students" className="font-medium text-brand-700 hover:underline">
            Clear filters
          </Link>
        </p>
      }
    </PageShell>);

}