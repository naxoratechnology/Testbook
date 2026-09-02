import React from 'react';
import { Link } from 'react-router-dom';
import {
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ListChecksIcon,
  MegaphoneIcon,
  NotebookTextIcon } from
'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageShell, Panel } from '../components/ui/PageShell';
import { EmptyState, btn } from '../components/ui/Primitives';
import { NotificationType } from '../types';

const icons: Record<NotificationType, React.ElementType> = {
  course: BookOpenIcon,
  'test-series': ListChecksIcon,
  test: ListChecksIcon,
  notes: NotebookTextIcon,
  'current-affairs': CalendarDaysIcon,
  announcement: MegaphoneIcon
};

export function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useAuth();

  return (
    <PageShell
      title="Notifications"
      subtitle={unreadCount > 0 ? `${unreadCount} unread updates` : "You're all caught up."}
      actions={
      notifications.length > 0 &&
      <button type="button" onClick={markAllRead} className={btn('secondary', 'md')}>
            Mark all as read
          </button>

      }>
      
      {notifications.length === 0 ?
      <EmptyState
        icon={<BellIcon className="h-5 w-5" />}
        title="No notifications."
        description="You're all caught up. New courses, tests and daily current affairs will appear here." /> :


      <Panel padded={false}>
          <ul className="divide-y divide-line">
            {notifications.map((item) => {
            const Icon = icons[item.type] ?? BellIcon;
            return (
              <li key={item.id}>
                  <Link
                  to={item.href}
                  onClick={() => markRead(item.id)}
                  className={`flex items-start gap-4 px-5 py-4 transition-colors duration-150 ease-smooth hover:bg-canvas ${
                  item.read ? '' : 'bg-brand-50/40'}`
                  }>
                  
                    <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    item.read ? 'bg-canvas text-ink-muted' : 'bg-brand-50 text-brand-600'}`
                    }>
                    
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-ink">{item.title}</span>
                        {!item.read && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-ink-soft">{item.message}</span>
                      <span className="mt-1 block text-xs text-ink-muted">{item.time}</span>
                    </span>
                  </Link>
                </li>);

          })}
          </ul>
        </Panel>
      }
    </PageShell>);

}