import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { exams, notes } from '../../data/content';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Badge, Button, Field, Input, Select, StatusBadge, Textarea, btn } from '../../components/ui/Primitives';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';
import { PublishStatus } from '../../types';

export function AdminNotes() {
  const [formOpen, setFormOpen] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, PublishStatus>>(
    Object.fromEntries(notes.map((n) => [n.id, n.status]))
  );

  return (
    <PageShell
      title="Notes"
      subtitle="Upload PDF notes. Students can read them in the viewer — downloads stay disabled."
      width="max-w-[1400px]"
      actions={
      <Button onClick={() => setFormOpen((o) => !o)}>
          <PlusIcon className="h-4 w-4" /> Upload Notes
        </Button>
      }>
      
      {formOpen &&
      <Panel className="mb-5">
          <h2 className="text-base font-semibold text-ink">Upload notes</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2">
              <Input placeholder="Quantitative Aptitude Notes" />
            </Field>
            <Field label="Exam">
              <Select>
                {exams.map((e) =>
              <option key={e}>{e}</option>
              )}
              </Select>
            </Field>
            <Field label="Subject">
              <Select>
                {['Quantitative Aptitude', 'Reasoning', 'English', 'General Studies'].map((s) =>
              <option key={s}>{s}</option>
              )}
              </Select>
            </Field>
            <Field label="Topic">
              <Input placeholder="Arithmetic & Algebra" />
            </Field>
            <Field label="PDF file" hint="Uploaded to Cloudinary · view-only for students">
              <Input type="file" />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea rows={2} placeholder="What these notes cover..." />
            </Field>
            <Field label="Status">
              <Select>
                <option>Published</option>
                <option>Draft</option>
              </Select>
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setFormOpen(false)}>Upload</Button>
          </div>
        </Panel>
      }

      <TableWrap footer={`${notes.length} note documents`}>
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Exam</Th>
              <Th>Subject</Th>
              <Th>Pages</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) =>
            <tr key={note.id} className="transition-colors duration-150 ease-smooth hover:bg-canvas/60">
                <Td>
                  <p className="font-medium text-ink">{note.title}</p>
                  <p className="text-xs text-ink-muted">{note.topic}</p>
                </Td>
                <Td>{note.exam}</Td>
                <Td>{note.subject}</Td>
                <Td className="tabular-nums">{note.pages}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={statuses[note.id]} />
                    <Badge tone="slate">View only</Badge>
                  </div>
                </Td>
                <Td className="whitespace-nowrap text-ink-muted">{note.created}</Td>
                <Td>
                  <RowActions
                  extra={
                  <button
                    type="button"
                    onClick={() =>
                    setStatuses((s) => ({
                      ...s,
                      [note.id]: s[note.id] === 'published' ? 'unpublished' : 'published'
                    }))
                    }
                    className={btn('secondary', 'sm', 'mr-1')}>
                    
                        {statuses[note.id] === 'published' ? 'Unpublish' : 'Publish'}
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