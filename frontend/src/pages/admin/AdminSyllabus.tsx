import React, { useState } from 'react';
import { DownloadIcon, PlusIcon } from 'lucide-react';
import { exams, syllabusList } from '../../data/content';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Badge, Button, Field, Input, Select, StatusBadge, Textarea } from '../../components/ui/Primitives';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';

export function AdminSyllabus() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <PageShell
      title="Syllabus"
      subtitle="The only module where students are allowed to download the PDF."
      width="max-w-[1400px]"
      actions={
      <Button onClick={() => setFormOpen((o) => !o)}>
          <PlusIcon className="h-4 w-4" /> Upload Syllabus
        </Button>
      }>
      
      {formOpen &&
      <Panel className="mb-5">
          <h2 className="text-base font-semibold text-ink">Upload syllabus</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Exam">
              <Select>
                {exams.map((e) =>
              <option key={e}>{e}</option>
              )}
              </Select>
            </Field>
            <Field label="Title">
              <Input placeholder="SSC CGL Syllabus" />
            </Field>
            <Field label="PDF file" hint="Cloudinary · downloadable for students">
              <Input type="file" />
            </Field>
            <Field label="Status">
              <Select>
                <option>Published</option>
                <option>Draft</option>
              </Select>
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea rows={2} placeholder="Stages, marking scheme and pattern covered..." />
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

      <TableWrap footer={`${syllabusList.length} syllabus documents`}>
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Exam</Th>
              <Th>Updated</Th>
              <Th>Permissions</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {syllabusList.map((item) =>
            <tr key={item.id} className="transition-colors duration-150 ease-smooth hover:bg-canvas/60">
                <Td className="font-medium text-ink">{item.title}</Td>
                <Td>{item.exam}</Td>
                <Td className="whitespace-nowrap text-ink-muted">{item.updated}</Td>
                <Td>
                  <Badge tone="green">View + Download</Badge>
                </Td>
                <Td>
                  <StatusBadge status={item.status} />
                </Td>
                <Td>
                  <RowActions
                  extra={
                  <a href="#" download aria-label="Download" className="mr-1 flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 ease-smooth hover:bg-canvas hover:text-ink">
                        <DownloadIcon className="h-4 w-4" />
                      </a>
                  } />
                
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableWrap>
    </PageShell>);

}