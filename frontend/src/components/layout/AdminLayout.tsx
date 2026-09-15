import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  MegaphoneIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  LogOutIcon,
  MenuIcon,
  NotebookTextIcon,
  ScrollTextIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon } from
'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useViewer } from '../../contexts/ViewerContext';
import { Logo } from './Logo';
import { Avatar } from './Navbar';

const items = [
{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
{ to: '/admin/courses', label: 'Courses', icon: BookOpenIcon },
{ to: '/admin/test-series', label: 'Test Series', icon: ListChecksIcon },
{ to: '/admin/notes', label: 'Notes', icon: NotebookTextIcon },
{ to: '/admin/current-affairs', label: 'Current Affairs', icon: CalendarDaysIcon },
{ to: '/admin/notices', label: 'Notices', icon: MegaphoneIcon },
{ to: '/admin/syllabus', label: 'Syllabus', icon: ScrollTextIcon },
{ to: '/admin/previous-papers', label: 'Previous Papers', icon: FileTextIcon },
{ to: '/admin/students', label: 'Students', icon: UsersIcon },
{ to: '/admin/settings', label: 'Settings', icon: SettingsIcon }];


export function AdminLayout() {
  const { user, logout } = useAuth();
  const { setSearchOpen } = useViewer();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: {isActive: boolean;}) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-smooth ${
  isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-canvas hover:text-ink'}`;


  const sidebar =
  <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo to="/admin/dashboard" suffix="Admin" />
      </div>
      <nav aria-label="Admin" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {items.map((item) =>
      <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setOpen(false)}>
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
      )}
      </nav>
      <div className="border-t border-line p-3">
        <button
        type="button"
        onClick={() => {
          logout();
          navigate('/');
        }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors duration-150 ease-smooth hover:bg-canvas hover:text-ink">
        
          <LogOutIcon className="h-[18px] w-[18px]" /> Logout
        </button>
      </div>
    </div>;


  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <aside className="hidden w-64 shrink-0 border-r border-line bg-white lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {open &&
      <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-lift">{sidebar}</div>
        </div>
      }

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-canvas lg:hidden">
            
            <MenuIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-10 w-72 items-center gap-2 rounded-xl border border-line px-3 text-sm text-ink-muted transition-colors duration-150 ease-smooth hover:bg-canvas sm:flex">
            
            <SearchIcon className="h-4 w-4" /> Search content, students...
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-canvas sm:hidden">
              
              <SearchIcon className="h-[18px] w-[18px]" />
            </button>
            <NavLink
              to="/admin/notices"
              aria-label="Notices"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft transition-colors duration-150 ease-smooth hover:bg-canvas hover:text-ink">
              
              <MegaphoneIcon className="h-[18px] w-[18px]" />
            </NavLink>
            <div className="ml-1 flex items-center gap-2.5 rounded-xl border border-line py-1 pl-1 pr-3">
              <Avatar name={user?.name ?? 'Admin'} />
              <div className="hidden leading-tight sm:block">
                <p className="text-[13px] font-semibold text-ink">{user?.name}</p>
                <p className="text-[11px] text-ink-muted">Administrator</p>
              </div>
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>);

}
