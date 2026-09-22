import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Input } from './Primitives';

export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);

  return <span className="relative block">
    <Input {...props} type={visible ? 'text' : 'password'} className={`pr-12 ${props.className || ''}`} />
    <button
      type="button"
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
      title={visible ? 'Hide password' : 'Show password'}
      onClick={(event) => { event.preventDefault(); setVisible((value) => !value); }}
      className="absolute inset-y-0 right-1 flex w-10 items-center justify-center rounded-lg text-ink-muted hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
    >
      {visible ? <EyeOffIcon className="h-4 w-4" aria-hidden="true" /> : <EyeIcon className="h-4 w-4" aria-hidden="true" />}
    </button>
  </span>;
}
