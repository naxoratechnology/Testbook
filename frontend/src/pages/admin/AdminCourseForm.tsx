import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileTextIcon, PlusIcon, Trash2Icon, UploadCloudIcon, VideoIcon } from 'lucide-react';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Badge, Button, Field, Input, Select, Textarea, btn } from '../../components/ui/Primitives';
import { exams } from '../../data/content';

interface Item {
  id: string;
  kind: 'video' | 'pdf';
  title: string;
  meta: string;
}
interface Section {
  id: string;
  title: string;
  items: Item[];
}

let counter = 3;

export function AdminCourseForm() {
  const navigate = useNavigate();
  const [paid, setPaid] = useState(true);
  const [sections, setSections] = useState<Section[]>([
  {
    id: 's1',
    title: 'Section 1 — Quantitative Aptitude',
    items: [
    { id: 'i1', kind: 'video', title: 'Percentage Basics', meta: '18:24' },
    { id: 'i2', kind: 'pdf', title: 'Quantitative Formula Sheet', meta: 'formula-sheet.pdf' }]

  }]
  );

  const addSection = () =>
  setSections((s) => [...s, { id: `s${++counter}`, title: `Section ${s.length + 1} — New section`, items: [] }]);

  const addItem = (sectionId: string, kind: 'video' | 'pdf') =>
  setSections((s) =>
  s.map((section) =>
  section.id === sectionId ?
  {
    ...section,
    items: [
    ...section.items,
    {
      id: `i${++counter}`,
      kind,
      title: kind === 'video' ? 'New video lesson' : 'New PDF note',
      meta: kind === 'video' ? '00:00' : 'upload.pdf'
    }]

  } :
  section
  )
  );

  const removeItem = (sectionId: string, itemId: string) =>
  setSections((s) =>
  s.map((section) =>
  section.id === sectionId ? { ...section, items: section.items.filter((i) => i.id !== itemId) } : section
  )
  );

  return (
    <PageShell
      title="Create Course"
      subtitle="Add basic information, then build the course content."
      width="max-w-5xl"
      actions={
      <>
          <Link to="/admin/courses" className={btn('secondary', 'md')}>
            Cancel
          </Link>
          <Button onClick={() => navigate('/admin/courses')}>Save &amp; Publish</Button>
        </>
      }>
      
      <div className="space-y-5">
        <Panel>
          <h2 className="text-base font-semibold text-ink">Basic information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Course name" className="sm:col-span-2">
              <Input placeholder="SSC CGL Complete Preparation" />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea rows={3} placeholder="What the student will learn in this course..." />
            </Field>
            <Field label="Exam">
              <Select>
                {exams.map((e) =>
                <option key={e}>{e}</option>
                )}
              </Select>
            </Field>
            <Field label="Category">
              <Select>
                {['SSC CGL', 'SSC CHSL', 'IBPS PO', 'RRB NTPC', 'Current Affairs', 'Sectional'].map((c) =>
                <option key={c}>{c}</option>
                )}
              </Select>
            </Field>
            <Field label="Thumbnail" hint="Uploaded to Cloudinary · JPG or PNG, 16:9" className="sm:col-span-2">
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-line px-4 py-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-ink-muted">
                  <UploadCloudIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ink">Drag a file here or browse</p>
                  <p className="text-xs text-ink-muted">Recommended 1280×720</p>
                </div>
                <Button variant="secondary" size="sm" type="button">
                  Browse
                </Button>
              </div>
            </Field>
            <Field label="Pricing">
              <Select value={paid ? 'Paid' : 'Free'} onChange={(e) => setPaid(e.target.value === 'Paid')}>
                <option>Paid</option>
                <option>Free</option>
              </Select>
            </Field>
            {paid &&
            <Field label="Price (₹)">
                <Input type="number" placeholder="1499" />
              </Field>
            }
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-ink">Course content</h2>
              <p className="mt-1 text-[13px] text-ink-muted">
                Videos stream in the platform player. PDFs are view-only for students.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={addSection}>
              <PlusIcon className="h-4 w-4" /> Add Section
            </Button>
          </div>

          <div className="mt-4 space-y-4">
            {sections.map((section) =>
            <div key={section.id} className="rounded-xl border border-line p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Input defaultValue={section.title} className="max-w-sm" aria-label="Section title" />
                  <div className="ml-auto flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => addItem(section.id, 'video')}>
                      <VideoIcon className="h-4 w-4" /> Add Video
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => addItem(section.id, 'pdf')}>
                      <FileTextIcon className="h-4 w-4" /> Add PDF
                    </Button>
                  </div>
                </div>

                {section.items.length === 0 ?
              <p className="mt-4 rounded-lg bg-canvas px-4 py-6 text-center text-[13px] text-ink-muted">
                    No lessons in this section yet.
                  </p> :

              <ul className="mt-4 space-y-2">
                    {section.items.map((item) =>
                <li key={item.id} className="grid gap-3 rounded-lg border border-line p-3 sm:grid-cols-[1fr_180px_auto]">
                        <div className="flex items-center gap-2.5">
                          {item.kind === 'video' ?
                    <VideoIcon className="h-4 w-4 shrink-0 text-brand-600" /> :

                    <FileTextIcon className="h-4 w-4 shrink-0 text-red-500" />
                    }
                          <Input defaultValue={item.title} aria-label="Lesson title" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                      defaultValue={item.meta}
                      aria-label={item.kind === 'video' ? 'Duration' : 'File'}
                      placeholder={item.kind === 'video' ? 'Duration' : 'File name'} />
                    
                          {item.kind === 'pdf' && <Badge tone="slate">View only</Badge>}
                        </div>
                        <button
                    type="button"
                    onClick={() => removeItem(section.id, item.id)}
                    aria-label="Remove lesson"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 ease-smooth hover:bg-red-50 hover:text-red-600">
                    
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </li>
                )}
                  </ul>
              }
              </div>
            )}
          </div>
        </Panel>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => navigate('/admin/courses')}>
            Save Draft
          </Button>
          <Button variant="secondary" onClick={() => navigate('/courses/ssc-cgl-complete')}>
            Preview
          </Button>
          <Button onClick={() => navigate('/admin/courses')}>Publish</Button>
        </div>
      </div>
    </PageShell>);

}