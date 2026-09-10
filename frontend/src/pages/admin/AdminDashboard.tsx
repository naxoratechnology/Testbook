import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  CalendarPlusIcon,
  FileQuestionIcon,
  FilePlus2Icon,
  ListChecksIcon,
  PlusIcon,
  ScrollTextIcon,
  TargetIcon,
  UploadIcon,
  UsersIcon } from
'lucide-react';
import { PageShell, Panel, StatCard } from '../../components/ui/PageShell';
import { btn } from '../../components/ui/Primitives';
import { adminActivity } from '../../data/content';

const quickActions = [
{ label: 'Create Course', to: '/admin/courses/new', icon: PlusIcon },
{ label: 'Create Test', to: '/admin/test-series/new-test', icon: ListChecksIcon },
{ label: 'Upload Notes', to: '/admin/notes', icon: UploadIcon },
{ label: 'Add Current Affairs', to: '/admin/current-affairs', icon: CalendarPlusIcon },
{ label: 'Upload Syllabus', to: '/admin/syllabus', icon: ScrollTextIcon }];


export function AdminDashboard() {
  return (
    <PageShell
      title="Dashboard"
      subtitle="Content, students and activity across Chandrabhaga Academy."
      width="max-w-[1400px]"
      actions={
      <Link to="/admin/courses/new" className={btn('primary', 'md')}>
          <PlusIcon className="h-4 w-4" /> Create Course
        </Link>
      }>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total students" value="12,540" hint="+248 this week" icon={<UsersIcon className="h-4 w-4" />} />
        <StatCard label="Courses" value="28" hint="3 drafts" icon={<BookOpenIcon className="h-4 w-4" />} />
        <StatCard label="Test series" value="42" icon={<ListChecksIcon className="h-4 w-4" />} />
        <StatCard label="Tests" value="320" icon={<FileQuestionIcon className="h-4 w-4" />} />
        <StatCard label="Questions" value="18,450" icon={<FilePlus2Icon className="h-4 w-4" />} />
        <StatCard label="Test attempts" value="85,240" hint="+4,120 this week" icon={<TargetIcon className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Panel padded={false}>
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-ink">Recent activity</h2>
            <Link to="/admin/students" className="text-[13px] font-medium text-brand-700 hover:underline">
              View students
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {adminActivity.map((item) =>
            <li key={item.id} className="flex items-center gap-3.5 px-5 py-3.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <p className="min-w-0 flex-1 text-[13.5px] text-ink">{item.text}</p>
                <p className="shrink-0 text-xs text-ink-muted">{item.time}</p>
              </li>
            )}
          </ul>
        </Panel>

        <Panel>
          <h2 className="text-base font-semibold text-ink">Quick actions</h2>
          <div className="mt-4 grid gap-2">
            {quickActions.map((action) =>
            <Link
              key={action.label}
              to={action.to}
              className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-[13.5px] font-medium text-ink transition-colors duration-150 ease-smooth hover:border-brand-200 hover:bg-brand-50/50">
              
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <action.icon className="h-4 w-4" />
                </span>
                {action.label}
              </Link>
            )}
          </div>
        </Panel>
      </div>
    </PageShell>);

}
