import React from 'react';
import { EyeIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { ActionMenu } from './ActionMenu';

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
  return <div className="flex justify-end"><ActionMenu actions={[
    ...(onView ? [{ label: 'View', icon: <EyeIcon className="h-4 w-4" />, onClick: onView }] : []),
    ...(onEdit ? [{ label: 'Edit', icon: <PencilIcon className="h-4 w-4" />, onClick: onEdit }] : []),
    ...(onDelete ? [{ label: 'Delete', icon: <Trash2Icon className="h-4 w-4" />, onClick: onDelete, danger: true }] : []),
  ]} extra={extra} /></div>;
}
