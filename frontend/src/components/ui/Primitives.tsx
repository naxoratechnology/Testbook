import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft',
  secondary: 'bg-white text-ink border border-line hover:bg-canvas',
  ghost: 'text-ink-soft hover:text-ink hover:bg-canvas',
  danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
  dark: 'bg-ink text-white hover:bg-slate-800'
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2'
};

export function btn(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return [
  'inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-150 ease-smooth disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
  variants[variant],
  sizes[size],
  extra].
  join(' ');
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: ButtonProps) {
  return <button {...rest} className={btn(variant, size, className)} />;
}

type Tone = 'brand' | 'green' | 'amber' | 'slate' | 'red' | 'violet';

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  red: 'bg-red-50 text-red-600 ring-red-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100'
};

export function Badge({
  children,
  tone = 'slate',
  className = ''




}: {children: React.ReactNode;tone?: Tone;className?: string;}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}>
      
      {children}
    </span>);

}

export function StatusBadge({ status }: {status: string;}) {
  const map: Record<string, Tone> = {
    published: 'green',
    draft: 'amber',
    unpublished: 'slate',
    free: 'green',
    paid: 'violet',
    premium: 'violet',
    completed: 'green',
    'in-progress': 'brand',
    'not-started': 'slate',
    locked: 'slate',
    active: 'green',
    inactive: 'slate'
  };
  const label = status.
  split('-').
  map((w) => w.charAt(0).toUpperCase() + w.slice(1)).
  join(' ');
  return <Badge tone={map[status] ?? 'slate'}>{label}</Badge>;
}

export function Progress({ value, className = '' }: {value: number;className?: string;}) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div
        className="h-full rounded-full bg-brand-600 transition-[width] duration-300 ease-smooth"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      
    </div>);

}

export function SectionHeading({
  title,
  subtitle,
  action




}: {title: string;subtitle?: string;action?: React.ReactNode;}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>);

}

export function EmptyState({
  icon,
  title,
  description,
  action





}: {icon: React.ReactNode;title: string;description?: string;action?: React.ReactNode;}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-canvas text-ink-muted">
        {icon}
      </div>
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>);

}

export function Field({
  label,
  hint,
  children,
  className = ''





}: {label: string;hint?: string;children: React.ReactNode;className?: string;}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>);

}

export const inputClass =
'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted transition-colors duration-150 ease-smooth focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} appearance-none pr-9 ${props.className ?? ''}`} />;
}

export function FilterChips({
  options,
  value,
  onChange




}: {options: string[];value: string;onChange: (v: string) => void;}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition-colors duration-150 ease-smooth ${
            active ?
            'border-brand-600 bg-brand-600 text-white' :
            'border-line bg-white text-ink-soft hover:text-ink'}`
            }>
            
            {option}
          </button>);

      })}
    </div>);

}