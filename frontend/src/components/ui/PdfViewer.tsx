import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  MaximizeIcon,
  MinimizeIcon,
  ScanIcon,
  SearchIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon } from
'lucide-react';
import { useViewer } from '../../contexts/ViewerContext';
import { Badge, btn } from './Primitives';

export function PdfViewer() {
  const { pdf, closePdf } = useViewer();
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [full, setFull] = useState(false);
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pdf) {
      setPage(1);
      setZoom(100);
      setQuery('');
      setShowSearch(false);
      setFull(false);
    }
  }, [pdf]);

  useEffect(() => {
    if (!pdf) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePdf();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [pdf, closePdf]);

  if (!pdf) return null;

  const total = pdf.pages.length;
  const current = pdf.pages[page - 1];
  const canDownload = pdf.module === 'syllabus';
  const matches = query ?
  pdf.pages.reduce(
    (acc, p) =>
    acc +
    (p.heading + ' ' + p.body.join(' ')).toLowerCase().split(query.toLowerCase()).length -
    1,
    0
  ) :
  0;

  const highlight = (text: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ?
    <mark key={i} className="rounded bg-amber-200/70 px-0.5 text-ink">
          {part}
        </mark> :

    <React.Fragment key={i}>{part}</React.Fragment>

    );
  };

  const go = (delta: number) => {
    setPage((p) => Math.min(total, Math.max(1, p + delta)));
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${pdf.title} document viewer`}
      className={`fixed inset-0 z-[70] flex flex-col bg-slate-900/70 backdrop-blur-sm ${full ? 'p-0' : 'sm:p-4 lg:p-8'}`}>
      
      <div
        className={`flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-canvas ${
        full ? '' : 'mx-auto max-w-5xl sm:rounded-2xl sm:shadow-lift'}`
        }>
        
        {/* Toolbar */}
        <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-white px-3 py-2.5 sm:px-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-ink">{pdf.title}</p>
              {!canDownload && <Badge tone="slate">View only</Badge>}
            </div>
            <p className="truncate text-xs text-ink-muted">{pdf.subtitle}</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowSearch((s) => !s)}
              aria-label="Search in document"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors duration-150 ease-smooth hover:bg-canvas hover:text-ink">
              
              <SearchIcon className="h-4 w-4" />
            </button>
            <div className="mx-1 hidden items-center gap-1 rounded-lg border border-line px-1 sm:flex">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(60, z - 20))}
                aria-label="Zoom out"
                className="flex h-7 w-7 items-center justify-center rounded text-ink-soft hover:text-ink">
                
                <ZoomOutIcon className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-xs font-medium tabular-nums text-ink-soft">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(180, z + 20))}
                aria-label="Zoom in"
                className="flex h-7 w-7 items-center justify-center rounded text-ink-soft hover:text-ink">
                
                <ZoomInIcon className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setZoom(100)}
              aria-label="Fit to screen"
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors duration-150 ease-smooth hover:bg-canvas hover:text-ink sm:flex">
              
              <ScanIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setFull((f) => !f)}
              aria-label={full ? 'Exit fullscreen' : 'Fullscreen'}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors duration-150 ease-smooth hover:bg-canvas hover:text-ink">
              
              {full ? <MinimizeIcon className="h-4 w-4" /> : <MaximizeIcon className="h-4 w-4" />}
            </button>
            {canDownload &&
            <a href="#" download className={btn('secondary', 'sm', 'ml-1')}>
                <DownloadIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </a>
            }
            <button
              type="button"
              onClick={closePdf}
              aria-label="Close viewer"
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors duration-150 ease-smooth hover:bg-canvas hover:text-ink">
              
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {showSearch &&
          <div className="flex w-full items-center gap-2 border-t border-line pt-2">
              <SearchIcon className="h-4 w-4 text-ink-muted" />
              <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search within PDF..."
              className="h-8 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none" />
            
              <span className="text-xs text-ink-muted">
                {query ? `${matches} match${matches === 1 ? '' : 'es'}` : 'Type to search'}
              </span>
            </div>
          }
        </header>

        {/* Document */}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto px-3 py-5 sm:px-6 sm:py-8">
          <article
            className="mx-auto max-w-3xl origin-top rounded-lg bg-white p-6 shadow-soft ring-1 ring-line sm:p-10"
            style={{ width: `${zoom}%`, maxWidth: zoom > 100 ? 'none' : '48rem' }}>
            
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{pdf.subtitle}</p>
            <h1 className="mt-2 text-xl font-bold text-ink sm:text-2xl">{highlight(pdf.title)}</h1>
            <div className="my-6 h-px bg-line" />
            <h2 className="text-base font-semibold text-ink">{highlight(current.heading)}</h2>
            <div className="mt-3 space-y-3.5">
              {current.body.map((para, i) =>
              <p key={i} className="text-[13.5px] leading-relaxed text-ink-soft">
                  {highlight(para)}
                </p>
              )}
            </div>
            <div className="mt-8 space-y-2">
              {[1, 2, 3, 4, 5].map((n) =>
              <div key={n} className="flex gap-3">
                  <span className="text-[13px] font-medium text-ink-muted">Q{n}.</span>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2 w-full rounded bg-slate-100" />
                    <div className="h-2 w-3/5 rounded bg-slate-100" />
                  </div>
                </div>
              )}
            </div>
            <p className="mt-10 text-center text-xs text-ink-muted">Page {page} of {total}</p>
          </article>
        </div>

        {/* Pager */}
        <footer className="flex items-center justify-between gap-3 border-t border-line bg-white px-3 py-2.5 sm:px-4">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={page === 1}
            className={btn('secondary', 'sm')}>
            
            <ChevronLeftIcon className="h-4 w-4" /> Previous
          </button>
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <span>Page</span>
            <input
              value={page}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isNaN(n)) setPage(Math.min(total, Math.max(1, n)));
              }}
              aria-label="Page number"
              className="h-8 w-12 rounded-lg border border-line text-center text-sm tabular-nums text-ink focus:border-brand-400 focus:outline-none" />
            
            <span>of {total}</span>
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={page === total}
            className={btn('secondary', 'sm')}>
            
            Next <ChevronRightIcon className="h-4 w-4" />
          </button>
        </footer>
      </div>
    </div>);

}