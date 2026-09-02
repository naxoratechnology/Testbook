import React from 'react';
import { EyeIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';

export function TableWrap({ children, footer }: {children: React.ReactNode;footer?: React.ReactNode;}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="overflow-x-auto">{children}</div>
      {footer && <div className="border-t border-line px-5 py-3 text-[13px] text-ink-muted">{footer}</div>}
    </div>);

}

export function Table({ children }: {children: React.ReactNode;}) {
  return <table className="w-full min-w-[720px] text-sm">{children}</table>;
}

export function Th({ children, className = '' }: {children?: React.ReactNode;className?: string;}) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap border-b border-line bg-canvas/60 px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted ${className}`}>
      
      {children}
    </th>);

}

export function Td({ children, className = '' }: {children?: React.ReactNode;className?: string;}) {
  return <td className={`border-b border-line px-5 py-3.5 align-middle text-ink-soft ${className}`}>{children}</td>;
}

export function RowActions({
  onView,
  onEdit,
  onDelete,
  extra





}: {onView?: () => void;onEdit?: () => void;onDelete?: () => void;extra?: React.ReactNode;}) {
  const base =
  'flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 ease-smooth hover:bg-canvas hover:text-ink';
  return (
    <div className="flex items-center justify-end gap-1">
      {extra}
      <button type="button" onClick={onView} aria-label="View" className={base}>
        <EyeIcon className="h-4 w-4" />
      </button>
      <button type="button" onClick={onEdit} aria-label="Edit" className={base}>
        <PencilIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 ease-smooth hover:bg-red-50 hover:text-red-600">
        
        <Trash2Icon className="h-4 w-4" />
      </button>
      <button type="button" aria-label="More" className={base}>
        <MoreHorizontalIcon className="h-4 w-4" />
      </button>
    </div>);

}