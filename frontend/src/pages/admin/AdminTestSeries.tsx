import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, PlusIcon } from 'lucide-react';
import { testSeriesList } from '../../data/testSeries';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Badge, Button, Field, Input, Select, StatusBadge, Textarea, btn } from '../../components/ui/Primitives';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';
import { exams } from '../../data/content';

export function AdminTestSeries() {
  const [formOpen, setFormOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [paid, setPaid] = useState(true);

  return (
    <PageShell
      title="Test Series"
      subtitle="Create series, then add individual tests inside each one."
      width="max-w-[1400px]"
      actions={
      <Button onClick={() => setFormOpen((o) => !o)}>
          <PlusIcon className="h-4 w-4" /> Create Test Series
        </Button>
      }>
      
      {formOpen &&
      <Panel className="mb-5">
          <h2 className="text-base font-semibold text-ink">New test series</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Series name" className="sm:col-span-2">
              <Input placeholder="SSC CGL Mock Test Series" />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea rows={2} placeholder="What this series covers..." />
            </Field>
            <Field label="Exam">
              <Select>
                {exams.map((e) =>
              <option key={e}>{e}</option>
              )}
              </Select>
            </Field>
            <Field label="Thumbnail" hint="Stored on Cloudinary">
              <Input type="file" />
            </Field>
            <Field label="Pricing">
              <Select value={paid ? 'Paid' : 'Free'} onChange={(e) => setPaid(e.target.value === 'Paid')}>
                <option>Paid</option>
                <option>Free</option>
              </Select>
            </Field>
            {paid &&
          <Field label="Price (₹)">
                <Input type="number" placeholder="499" />
              </Field>
          }
            <Field label="Number of tests">
              <Input type="number" placeholder="20" />
            </Field>
            <Field label="Status">
              <Select>
                <option>Draft</option>
                <option>Published</option>
              </Select>
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setFormOpen(false)}>Create series</Button>
          </div>
        </Panel>
      }

      <TableWrap footer={`${testSeriesList.length} test series`}>
        <Table>
          <thead>
            <tr>
              <Th>Series</Th>
              <Th>Exam</Th>
              <Th>Type</Th>
              <Th>Tests</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {testSeriesList.map((series) =>
            <React.Fragment key={series.id}>
                <tr className="transition-colors duration-150 ease-smooth hover:bg-canvas/60">
                  <Td>
                    <button
                    type="button"
                    onClick={() => setExpanded(expanded === series.id ? null : series.id)}
                    className="flex items-center gap-2 text-left">
                    
                      <ChevronDownIcon
                      className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 ease-smooth ${
                      expanded === series.id ? 'rotate-180' : ''}`
                      } />
                    
                      <span>
                        <span className="block font-medium text-ink">{series.title}</span>
                        <span className="block text-xs text-ink-muted">
                          {series.totalQuestions.toLocaleString('en-IN')} questions
                        </span>
                      </span>
                    </button>
                  </Td>
                  <Td>{series.exam}</Td>
                  <Td>
                    <Badge tone={series.type === 'free' ? 'green' : 'violet'}>
                      {series.type === 'free' ? 'Free' : `₹${series.price}`}
                    </Badge>
                  </Td>
                  <Td className="tabular-nums">{series.tests.length}</Td>
                  <Td>
                    <StatusBadge status={series.status} />
                  </Td>
                  <Td className="whitespace-nowrap text-ink-muted">{series.created}</Td>
                  <Td>
                    <RowActions
                    extra={
                    <Link to="/admin/test-series/new-test" className={btn('secondary', 'sm', 'mr-1')}>
                          <PlusIcon className="h-3.5 w-3.5" /> Create Test
                        </Link>
                    } />
                  
                  </Td>
                </tr>
                {expanded === series.id &&
              <tr>
                    <td colSpan={7} className="border-b border-line bg-canvas/60 px-5 py-4">
                      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {series.tests.slice(0, 6).map((test) =>
                    <li
                      key={test.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-3.5 py-2.5">
                      
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-medium text-ink">{test.title}</span>
                              <span className="block text-xs text-ink-muted">
                                {test.questions} questions · {test.duration} min
                              </span>
                            </span>
                            <Link to="/admin/test-series/new-test" className="text-[13px] font-medium text-brand-700 hover:underline">
                              Edit
                            </Link>
                          </li>
                    )}
                      </ul>
                      {series.tests.length > 6 &&
                  <p className="mt-3 text-[13px] text-ink-muted">
                          + {series.tests.length - 6} more tests in this series
                        </p>
                  }
                    </td>
                  </tr>
              }
              </React.Fragment>
            )}
          </tbody>
        </Table>
      </TableWrap>
    </PageShell>);

}