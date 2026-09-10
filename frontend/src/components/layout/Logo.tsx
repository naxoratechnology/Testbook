import React from 'react';
import { Link } from 'react-router-dom';

export function Logo({ to = '/', suffix }: {to?: string;suffix?: string;}) {
  return (
    <Link to={to} className="flex shrink-0 items-center gap-2">
      <img src="/logo.png" alt="Chandrabhaga Academy" className="h-9 w-auto max-w-[150px] object-contain object-left sm:h-14 sm:max-w-[280px]" />
      {suffix && <span className="text-[12px] font-semibold text-ink-muted">{suffix}</span>}
    </Link>);

}
