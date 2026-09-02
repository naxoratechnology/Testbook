import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';
import { exams, previousPapers } from '../../data/content';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Badge, Button, Field, Input, Select, StatusBadge, btn } from '../../components/ui/Primitives';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';

export function AdminPreviousPapers() {
  const [formOpen, setFormOpen] = useState(false);
  const [withTest, setWithTest] = useState(false);

  return (
    <PageShell
      title="Previous Year Papers"
      subtitle="Upload the paper PDF, and optionally turn it into an online test."
      width="max-w-[1400px]"
      actions={
      <Button onClick={() => setFormOpen((o) => !o)}>
          <PlusIcon className="h-4 w-4" /> Add Previous Paper
        </Button>
      }>
      
      {formOpen &&
      <Panel className="mb-5">
          <h2 className="text-base font-semibold text-ink">New previous year paper</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Exam">
              <Select>
                {exams.map((e) =>
              <option key={e}>{e}</option>
              )}
              </Select>
            </Field>
            <Field label="Year">
              <Input type="number" placeholder="2025" />
            </Field>
            <Field label="Tier / Stage">
              <Select>
                {['Tier 1', 'Tier 2', 'Prelims', 'Mains', 'CBT 1', 'CBT 2'].map((s) =>
              <option key={s}>{s}</option>
              )}
              </Select>
            </Field>
            <Field label="Shift">
              <Select>
                {['Shift 1', 'Shift 2', 'Shift 3'].map((s) =>
              <option key={s}>{s}</option>
              )}
              </Select>
            </Field>
            <Field label="Subject">
              <Select>
                {['All Subjects', 'Quantitative', 'Reasoning', 'English', 'General Awareness'].map((s) =>
              <option key={s}>{s}</option>
              )}
              </Select>
            </Field>
            <Field label="PDF file" hint="View only for students">
              <Input type="file" />
            </Field>
          </div>

          <div className="mt-5 rounded-xl border border-line p-4">
            <label className="flex items-start gap-3">
              <input
              type="checkbox"
              checked={withTest}
              onChange={(e) => setWithTest(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-line text-brand-600" />
            
              <span>
                <span className="block text-[13.5px] font-medium text-ink">Create online test from this paper</span>
                <span className="block text-xs text-ink-muted">
                  Students will see both “View Paper” and “Attempt Online”.
                </span>
              </span>
            </label>
            {withTest &&
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Field label="Questions">
                  <Input type="number" placeholder="100" />
                </Field>
                <Field label="Duration (minutes)">
                  <Input type="number" placeholder="60" />
                </Field>
                <Field label="Negative marking">
                  <Select defaultValue="0.5">
                    <option value="0">None</option>
                    <option value="0.25">0.25</option>
                    <option value="0.5">0.5</option>
                  </Select>
                </Field>
                <p className="sm:col-span-3">
                  <Link to="/admin/test-series/new-test" className={btn('secondary', 'sm')}>
                    Add questions in the test builder
                  </Link>
                </p>
              </div>
          }
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setFormOpen(false)}>Publish</Button>
          </div>
        </Panel>
      }

      <TableWrap footer={`${previousPapers.length} papers`}>
        <Table>
          <thead>
            <tr>
              <Th>Paper</Th>
              <Th>Exam</Th>
              <Th>Year</Th>
              <Th>Shift</Th>
              <Th>Online test</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {previousPapers.map((paper) =>
            <tr key={paper.id} className="transition-colors duration-150 ease-smooth hover:bg-canvas/60">
                <Td>
                  <p className="font-medium text-ink">{paper.title}</p>
                  <p className="text-xs text-ink-muted">
                    {paper.stage} · {paper.subject}
                  </p>
                </Td>
                <Td>{paper.exam}</Td>
                <Td className="tabular-nums">{paper.year}</Td>
                <Td>{paper.shift}</Td>
                <Td>
                  {paper.onlineTest ?
                <Badge tone="brand">
                      {paper.onlineTest.questions} Q · {paper.onlineTest.duration} min
                    </Badge> :

                <Link to="/admin/test-series/new-test" className="text-[13px] font-medium text-brand-700 hover:underline">
                      Create Online Test
                    </Link>
                }
                </Td>
                <Td>
                  <StatusBadge status={paper.status} />
                </Td>
                <Td>
                  <RowActions />
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableWrap>
    </PageShell>);

}