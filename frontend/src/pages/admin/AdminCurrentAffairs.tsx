import React, { useState } from 'react';
import { CheckIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { currentAffairs, exams } from '../../data/content';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Badge, Button, Field, Input, Select, StatusBadge, Textarea } from '../../components/ui/Primitives';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';

interface Draft {
  id: string;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

let seq = 1;

export function AdminCurrentAffairs() {
  const [formOpen, setFormOpen] = useState(false);
  const [questions, setQuestions] = useState<Draft[]>([
  {
    id: 'ca-q1',
    text: 'Which institution kept the repo rate unchanged in its August 2026 review?',
    options: ['SEBI', 'RBI', 'NITI Aayog', 'Finance Commission'],
    correct: 1,
    explanation: 'The RBI Monetary Policy Committee kept the repo rate unchanged in August 2026.'
  }]
  );

  const update = (id: string, patch: Partial<Draft>) =>
  setQuestions((qs) => qs.map((q) => q.id === id ? { ...q, ...patch } : q));

  return (
    <PageShell
      title="Current Affairs"
      subtitle="Publish the daily capsule, PDF and 10-question test."
      width="max-w-[1400px]"
      actions={
      <Button onClick={() => setFormOpen((o) => !o)}>
          <PlusIcon className="h-4 w-4" /> Add Daily Current Affairs
        </Button>
      }>
      
      {formOpen &&
      <Panel className="mb-5">
          <h2 className="text-base font-semibold text-ink">New daily current affairs</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Date">
              <Input type="date" defaultValue="2026-08-30" />
            </Field>
            <Field label="Exam relevance">
              <Select>
                <option>All Exams</option>
                {exams.map((e) =>
              <option key={e}>{e}</option>
              )}
              </Select>
            </Field>
            <Field label="Title" className="sm:col-span-2">
              <Input placeholder="Daily Current Affairs — 30 August 2026" />
            </Field>
            <Field label="Content / highlights" className="sm:col-span-2" hint="One highlight per line">
              <Textarea rows={4} placeholder={'RBI keeps repo rate unchanged...\nISRO completes test flight...'} />
            </Field>
            <Field label="PDF upload" hint="Cloudinary · view-only for students">
              <Input type="file" />
            </Field>
            <Field label="Status">
              <Select>
                <option>Published</option>
                <option>Draft</option>
              </Select>
            </Field>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-ink">Daily MCQ test</h3>
                <p className="mt-0.5 text-[13px] text-ink-muted">{questions.length} of 10 questions added</p>
              </div>
              <Button
              variant="secondary"
              size="sm"
              onClick={() =>
              setQuestions((qs) => [
              ...qs,
              { id: `ca-new-${seq++}`, text: '', options: ['', '', '', ''], correct: 0, explanation: '' }]
              )
              }>
              
                <PlusIcon className="h-4 w-4" /> Add question
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              {questions.map((q, index) =>
            <div key={q.id} className="rounded-xl border border-line p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold text-ink">Question {index + 1}</p>
                    <button
                  type="button"
                  onClick={() => setQuestions((qs) => qs.filter((item) => item.id !== q.id))}
                  aria-label="Delete question"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 ease-smooth hover:bg-red-50 hover:text-red-600">
                  
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3">
                    <Textarea
                  rows={2}
                  value={q.text}
                  onChange={(e) => update(q.id, { text: e.target.value })}
                  placeholder="Question text" />
                
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((option, i) =>
                  <div key={i} className="flex items-center gap-2">
                          <Input
                      value={option}
                      aria-label={`Option ${String.fromCharCode(65 + i)}`}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      onChange={(e) =>
                      update(q.id, { options: q.options.map((o, oi) => oi === i ? e.target.value : o) })
                      } />
                    
                          <button
                      type="button"
                      onClick={() => update(q.id, { correct: i })}
                      aria-label={`Mark option ${String.fromCharCode(65 + i)} correct`}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-150 ease-smooth ${
                      q.correct === i ?
                      'border-emerald-500 bg-emerald-500 text-white' :
                      'border-line text-ink-muted hover:bg-canvas'}`
                      }>
                      
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        </div>
                  )}
                    </div>
                    <Textarea
                  rows={2}
                  value={q.explanation}
                  onChange={(e) => update(q.id, { explanation: e.target.value })}
                  placeholder="Explanation" />
                
                  </div>
                </div>
            )}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Save draft
            </Button>
            <Button onClick={() => setFormOpen(false)}>Publish</Button>
          </div>
        </Panel>
      }

      <TableWrap footer={`${currentAffairs.length} daily entries`}>
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Title</Th>
              <Th>Questions</Th>
              <Th>PDF</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {currentAffairs.map((day) =>
            <tr key={day.id} className="transition-colors duration-150 ease-smooth hover:bg-canvas/60">
                <Td className="whitespace-nowrap font-medium text-ink">{day.date}</Td>
                <Td>{day.title}</Td>
                <Td className="tabular-nums">{day.questions}</Td>
                <Td>
                  <Badge tone="slate">PDF</Badge>
                </Td>
                <Td>
                  <StatusBadge status={day.status} />
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