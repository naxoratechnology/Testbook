import { Children, Fragment, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { MoreHorizontalIcon } from 'lucide-react';
export interface MenuAction { label: string; icon?: ReactNode; href?: string; onClick?: () => void; danger?: boolean; disabled?: boolean }
function menuExtras(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement<{ className?: string; role?: string; children?: ReactNode; 'aria-label'?: string }>(child)) return child;
    if (child.type === Fragment) return menuExtras(child.props.children);
    return cloneElement(child, { role: 'menuitem', className: 'flex min-h-9 w-full items-center justify-start gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-soft hover:bg-canvas disabled:opacity-40' }, child.props['aria-label'] ? <>{child.props.children}{child.props['aria-label']}</> : child.props.children);
  });
}
export function ActionMenu({ actions, extra, label = 'Actions' }: { actions: MenuAction[]; extra?: ReactNode; label?: string }) {
  const button = useRef<HTMLButtonElement>(null); const menu = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const extras = menuExtras(extra);
  useEffect(() => { if (!position) return; const close = (event: Event) => { if (event.type === 'keydown' && (event as KeyboardEvent).key !== 'Escape') return; if (event.type === 'pointerdown' && (menu.current?.contains(event.target as Node) || button.current?.contains(event.target as Node))) return; setPosition(null); if (event.type === 'keydown') button.current?.focus(); }; document.addEventListener('pointerdown', close); document.addEventListener('keydown', close); window.addEventListener('resize', close); window.addEventListener('scroll', close, true); return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); window.removeEventListener('resize', close); window.removeEventListener('scroll', close, true); }; }, [position]);
  return <><button ref={button} type="button" aria-label={label} aria-haspopup="menu" aria-expanded={Boolean(position)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-ink-soft hover:bg-canvas" onClick={() => { if (position) { setPosition(null); return; } const rect = button.current!.getBoundingClientRect(); const height = (actions.length + Children.count(extras)) * 40 + 16; setPosition({ left: Math.max(8, Math.min(rect.right - 208, window.innerWidth - 216)), top: rect.bottom + height < window.innerHeight ? rect.bottom + 6 : Math.max(8, rect.top - height - 6) }); }}><MoreHorizontalIcon className="h-5 w-5" /></button>{position && createPortal(<div ref={menu} role="menu" aria-label={label} style={position} className="fixed z-[100] w-52 rounded-xl border border-line bg-white p-1.5 shadow-lift">{actions.map((action) => { const className = `flex min-h-9 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${action.danger ? 'text-red-600 hover:bg-red-50' : 'text-ink-soft hover:bg-canvas'} disabled:opacity-40`; return action.href && !action.disabled ? <Link key={action.label} role="menuitem" to={action.href} className={className} onClick={() => setPosition(null)}>{action.icon}{action.label}</Link> : <button key={action.label} type="button" role="menuitem" disabled={action.disabled} className={className} onClick={() => { setPosition(null); action.onClick?.(); }}>{action.icon}{action.label}</button>; })}{extra && <div className="border-t border-line p-1 [&_button]:w-full [&_button]:justify-start" onClick={(event) => { if (!(event.target as HTMLElement).closest('button:disabled')) setPosition(null); }}>{extras}</div>}</div>, document.body)}</>;
}
