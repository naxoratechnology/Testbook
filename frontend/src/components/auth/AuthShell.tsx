import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, BarChart3Icon, ListChecksIcon, PlayCircleIcon } from 'lucide-react';
import { Logo } from '../layout/Logo';

export function AuthShell({
  title,
  subtitle,
  children,
  footer





}: {title: string;subtitle: string;children: React.ReactNode;footer: React.ReactNode;}) {
  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="flex w-full flex-col px-4 py-8 sm:px-8 lg:w-[54%] lg:px-14">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft transition-colors duration-150 ease-smooth hover:text-ink">
            
            <ArrowLeftIcon className="h-4 w-4" /> Back to home
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-[26px] font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{subtitle}</p>
          <div className="mt-7">{children}</div>
          <p className="mt-6 text-center text-[13px] text-ink-soft">{footer}</p>
        </div>
      </div>

      <aside className="hidden bg-canvas lg:flex lg:w-[46%] lg:flex-col lg:justify-center lg:border-l lg:border-line lg:px-14">
        <img src="/logo.png" alt="Chandrabhaga Academy" className="h-12 w-auto max-w-[250px] object-contain object-left" />
        <h2 className="mt-3 max-w-sm text-3xl font-bold leading-tight tracking-tight text-ink">
          Everything your exam needs, in one calm workspace.
        </h2>
        <ul className="mt-8 space-y-4">
          {[
          { icon: PlayCircleIcon, title: 'Video classes', text: '96 lessons across four sections' },
          { icon: ListChecksIcon, title: 'Real exam mocks', text: 'Timer, palette and instant analysis' },
          { icon: BarChart3Icon, title: 'Progress tracking', text: 'Know exactly what to study next' }].
          map((item) =>
          <li key={item.title} className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <item.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{item.title}</span>
                <span className="block text-xs text-ink-muted">{item.text}</span>
              </span>
            </li>
          )}
        </ul>
      </aside>
    </div>);

}
