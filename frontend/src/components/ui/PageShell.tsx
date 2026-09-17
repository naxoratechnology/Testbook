import React from 'react';
import { useLocation } from 'react-router-dom';

export function PageShell({
  title,
  subtitle,
  actions,
  children,
  width = 'max-w-7xl'






}: {title?: string;subtitle?: string;actions?: React.ReactNode;children: React.ReactNode;width?: string;}) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <div className={`mx-auto w-full ${isAdmin ? width : 'max-w-none'} px-4 py-8 sm:px-6 ${isAdmin ? 'lg:px-8' : 'lg:px-6'} lg:py-10`}>
      {title &&
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      }
      {children}
    </div>);

}

export function Panel({
  children,
  className = '',
  padded = true




}: {children: React.ReactNode;className?: string;padded?: boolean;}) {
  return (
    <section
      className={`rounded-2xl border border-line bg-white ${padded ? 'p-5 sm:p-6' : ''} ${className}`}>
      
      {children}
    </section>);

}

export function StatCard({
  label,
  value,
  hint,
  icon





}: {label: string;value: string;hint?: string;icon?: React.ReactNode;}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-ink-soft">{label}</p>
        {icon &&
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            {icon}
          </span>
        }
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>);

}
