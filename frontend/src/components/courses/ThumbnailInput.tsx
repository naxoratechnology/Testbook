import { useEffect, useState } from 'react';
import { Button, Field, Input } from '../ui/Primitives';
import { CourseThumbnail } from './CourseThumbnail';
import { TestSeriesThumbnail } from './TestSeriesThumbnail';

export function ThumbnailInput({ file, url, title, kind, onChange, onRemove, disabled }: { file: File | null; url?: string; title: string; kind: 'course' | 'test-series' | 'notes'; onChange: (file: File | null) => void; onRemove?: () => void; disabled?: boolean }) {
  const [inputKey, setInputKey] = useState(0);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { if (!file) { setPreview(''); return; } const value = URL.createObjectURL(file); setPreview(value); return () => URL.revokeObjectURL(value); }, [file]);
  const Thumbnail = kind === 'test-series' ? TestSeriesThumbnail : CourseThumbnail;
  return <Field label="Thumbnail image (optional)" className="sm:col-span-2"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><Thumbnail src={preview || url} alt={title || 'Thumbnail'} className="h-24 w-40 shrink-0 rounded-lg object-cover" /><div className="min-w-0 flex-1"><Input key={inputKey} disabled={disabled} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const selected = event.target.files?.[0] || null; if (selected && (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type) || selected.size > 5 * 1024 * 1024)) { setError('Choose a JPG, PNG or WebP image up to 5 MB.'); event.target.value = ''; onChange(null); return; } setError(''); onChange(selected); }} /><p className="mt-2 text-xs text-ink-muted">JPG, PNG or WebP, up to 5 MB. The default icon is shown if no image is uploaded.</p>{(file || url) && <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={() => { setError(''); setInputKey((value) => value + 1); if (file) onChange(null); else onRemove?.(); }}>Remove thumbnail</Button>}{error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}</div></div></Field>;
}
