import React from 'react';
import { Link } from 'react-router-dom';

export function Logo({ to = '/', suffix }: {to?: string;suffix?: string;}) {
  return (
    <Link to={to} className="flex shrink-0 items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-[15px] font-extrabold text-white">
        P
      </span>
      <span className="text-[17px] font-extrabold tracking-tight text-ink">
        PrepArena
        {suffix && <span className="ml-1.5 text-[13px] font-semibold text-ink-muted">{suffix}</span>}
      </span>
    </Link>);

}