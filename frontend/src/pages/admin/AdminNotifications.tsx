import React, { useState } from 'react';
import { PlusIcon, SendIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Badge, Button, Field, Input, Select, Textarea } from '../../components/ui/Primitives';
import { RowActions, Table, TableWrap, Td, Th } from '../../components/admin/DataTable';

const types = ['New Course', 'New Test Series', 'New Test', 'New Notes', 'Current Affairs', 'Announcement'];
const audiences = ['All students', 'SSC aspirants', 'Banking aspirants', 'Enrolled in a course', 'Inactive students'];
const modules = ['None', 'Course', 'Test series', 'Notes', 'Current affairs', 'Syllabus', 'Previous papers'];

export function AdminNotifications() {
  const { notifications } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <PageShell
      title="Notifications"
      subtitle="Send updates to students and see what has already gone out."
      width="max-w-[1400px]"
      actions={
      <Button onClick={() => setFormOpen((o) => !o)}>
          <PlusIcon className="h-4 w-4" /> Create Notification
        </Button>
      }>
      
      {formOpen &&
      <Panel className="mb-5">
          <h2 className="text-base font-semibold text-ink">New notification</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Title" className="sm:col-span-2">
              <Input placeholder="New Test Series" />
            </Field>
            <Field label="Message" className="sm:col-span-2">
              <Textarea rows={2} placeholder="New Banking Mock Test Series added." />
            </Field>
            <Field label="Notification type">
              <Select>
                {types.map((t) =>
              <option key={t}>{t}</option>
              )}
              </Select>
            </Field>
            <Field label="Target audience">
              <Select>
                {audiences.map((a) =>
              <option key={a}>{a}</option>
              )}
              </Select>
            </Field>
            <Field label="Related module">
              <Select>
                {modules.map((m) =>
              <option key={m}>{m}</option>
              )}
              </Select>
            </Field>
            <Field label="Publish date">
              <Input type="date" defaultValue="2026-08-29" />
            </Field>
          </div>
          <div className="mt-5 flex items-center justify-end gap-3">
            {sent && <span className="text-[13px] font-medium text-emerald-600">Notification published</span>}
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
            onClick={() => {
              setSent(true);
              window.setTimeout(() => {
                setSent(false);
                setFormOpen(false);
              }, 1400);
            }}>
            
              <SendIcon className="h-4 w-4" /> Publish
            </Button>
          </div>
        </Panel>
      }

      <TableWrap footer={`${notifications.length} notifications sent`}>
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Message</Th>
              <Th>Type</Th>
              <Th>Sent</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((item) =>
            <tr key={item.id} className="transition-colors duration-150 ease-smooth hover:bg-canvas/60">
                <Td className="font-medium text-ink">{item.title}</Td>
                <Td>{item.message}</Td>
                <Td>
                  <Badge tone="brand">{item.type.replace('-', ' ')}</Badge>
                </Td>
                <Td className="whitespace-nowrap text-ink-muted">{item.time}</Td>
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