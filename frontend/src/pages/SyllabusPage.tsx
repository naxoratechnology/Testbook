import React from 'react';
import { DownloadIcon, FileTextIcon } from 'lucide-react';
import { syllabusList } from '../data/content';
import { PageShell } from '../components/ui/PageShell';
import { Badge, btn } from '../components/ui/Primitives';
import { buildPdf, useViewer } from '../contexts/ViewerContext';

export function SyllabusPage() {
  const { openPdf } = useViewer();

  return (
    <PageShell
      title="Exam Syllabus"
      subtitle="Official syllabus documents — the only PDFs you can download for offline use.">
      
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {syllabusList.
        filter((s) => s.status === 'published').
        map((item) =>
        <li key={item.id} className="flex h-full flex-col rounded-2xl border border-line bg-white p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <FileTextIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold leading-snug text-ink">{item.title}</h2>
                  <p className="mt-1 flex items-center gap-1.5">
                    <Badge tone="slate">PDF</Badge>
                    <Badge tone="green">Downloadable</Badge>
                  </p>
                </div>
              </div>
              <p className="mt-3.5 text-[13px] leading-relaxed text-ink-soft">{item.description}</p>
              <p className="mt-3 text-xs text-ink-muted">Updated: {item.updated}</p>
              <div className="mt-5 flex gap-2">
                <button
              type="button"
              onClick={() =>
              openPdf(
                buildPdf(item.title, `${item.exam} · Updated ${item.updated}`, 'syllabus', [
                'Exam pattern',
                'Tier 1 syllabus',
                'Tier 2 syllabus',
                'Marking scheme',
                'Eligibility & important dates']
                )
              )
              }
              className={btn('primary', 'sm', 'flex-1')}>
              
                  View Syllabus
                </button>
                <a href="#" download className={btn('secondary', 'sm', 'flex-1')}>
                  <DownloadIcon className="h-4 w-4" /> Download
                </a>
              </div>
            </li>
        )}
      </ul>
    </PageShell>);

}