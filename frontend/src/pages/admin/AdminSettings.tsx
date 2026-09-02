import React, { useState } from 'react';
import { PageShell, Panel } from '../../components/ui/PageShell';
import { Button, Field, Input, Select } from '../../components/ui/Primitives';

export function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [toggles, setToggles] = useState({
    autoNotify: true,
    allowSyllabusDownload: true,
    blockPdfDownloads: true
  });

  const rows: {key: keyof typeof toggles;label: string;desc: string;locked?: boolean;}[] = [
  {
    key: 'autoNotify',
    label: 'Notify students on publish',
    desc: 'Send a notification automatically when new content goes live.'
  },
  {
    key: 'allowSyllabusDownload',
    label: 'Allow syllabus downloads',
    desc: 'Students can download syllabus PDFs for offline use.'
  },
  {
    key: 'blockPdfDownloads',
    label: 'Block downloads for all other PDFs',
    desc: 'Notes, course PDFs, current affairs and previous papers stay view-only.',
    locked: true
  }];


  return (
    <PageShell title="Settings" subtitle="Platform-level defaults for content and delivery." width="max-w-3xl">
      <div className="space-y-5">
        <Panel>
          <h2 className="text-base font-semibold text-ink">Platform</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Platform name">
              <Input defaultValue="PrepArena" />
            </Field>
            <Field label="Support email">
              <Input defaultValue="support@preparena.com" />
            </Field>
            <Field label="Default exam">
              <Select defaultValue="SSC">
                {['SSC', 'Banking', 'Railway', 'UPSC'].map((e) =>
                <option key={e}>{e}</option>
                )}
              </Select>
            </Field>
            <Field label="Media storage" hint="Videos, PDFs and thumbnails">
              <Select defaultValue="Cloudinary">
                <option>Cloudinary</option>
              </Select>
            </Field>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-base font-semibold text-ink">Content rules</h2>
          <ul className="mt-3 divide-y divide-line">
            {rows.map((row) =>
            <li key={row.key} className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <p className="text-[13.5px] font-medium text-ink">{row.label}</p>
                  <p className="text-xs text-ink-muted">{row.desc}</p>
                </div>
                <button
                type="button"
                role="switch"
                aria-checked={toggles[row.key]}
                aria-label={row.label}
                disabled={row.locked}
                onClick={() => setToggles((t) => ({ ...t, [row.key]: !t[row.key] }))}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-smooth disabled:opacity-60 ${
                toggles[row.key] ? 'bg-brand-600' : 'bg-slate-200'}`
                }>
                
                  <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left] duration-150 ease-smooth ${
                  toggles[row.key] ? 'left-[22px]' : 'left-0.5'}`
                  } />
                
                </button>
              </li>
            )}
          </ul>
        </Panel>

        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-[13px] font-medium text-emerald-600">Settings saved</span>}
          <Button
            onClick={() => {
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2000);
            }}>
            
            Save changes
          </Button>
        </div>
      </div>
    </PageShell>);

}