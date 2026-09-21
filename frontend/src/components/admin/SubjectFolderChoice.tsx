import { useId } from 'react';
import { Input } from '../ui/Primitives';

type Props = {
  content: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  generalLabel: string;
  suggestions: string[];
};

export function SubjectFolderChoice({ content, enabled, onToggle, value, onChange, generalLabel, suggestions }: Props) {
  const listId = useId();
  return <div className="rounded-xl border border-line p-4">
    <label className="flex items-start gap-3">
      <input type="checkbox" checked={enabled} onChange={(event) => onToggle(event.target.checked)} className="mt-1 h-4 w-4" />
      <span><span className="block text-sm font-semibold text-ink">Organize {content} by subject (optional)</span><span className="mt-1 block text-xs text-ink-muted">Leave this off to show {content} under {generalLabel}.</span></span>
    </label>
    {enabled && <div className="mt-4"><label htmlFor={listId + '-input'} className="mb-1.5 block text-sm font-medium text-ink">Subject folder</label><Input id={listId + '-input'} required maxLength={120} list={listId} value={value === generalLabel ? '' : value} onChange={(event) => onChange(event.target.value)} placeholder="Choose an existing subject or type a new one" /><datalist id={listId}>{suggestions.filter((item) => item && item !== generalLabel).map((item) => <option key={item} value={item} />)}</datalist><p className="mt-1.5 text-xs text-ink-muted">Items with the same subject name appear together.</p></div>}
  </div>;
}
