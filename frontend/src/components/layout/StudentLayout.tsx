import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpenIcon, HomeIcon, ListChecksIcon, NotebookTextIcon, UserIcon } from 'lucide-react';
import { Navbar } from './Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from './Logo';

const tabs = [
{ to: '/dashboard', label: 'Home', icon: HomeIcon },
{ to: '/courses', label: 'Courses', icon: BookOpenIcon },
{ to: '/test-series', label: 'Tests', icon: ListChecksIcon },
{ to: '/notes', label: 'Notes', icon: NotebookTextIcon },
{ to: '/profile', label: 'Profile', icon: UserIcon }];


export function StudentLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <Navbar />
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      {user?.role === 'student' && !isHome &&
      <nav
        aria-label="Quick navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-line bg-white/95 backdrop-blur lg:hidden">
        
          {tabs.map((tab) =>
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
          `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors duration-150 ease-smooth ${
          isActive ? 'text-brand-600' : 'text-ink-muted'}`

          }>
          
              <tab.icon className="h-[18px] w-[18px]" />
              {tab.label}
            </NavLink>
        )}
        </nav>
      }
    </div>);

}

function Footer() {
  const groups = [
  { title: 'Learn', links: [['Courses', '/courses'], ['Test Series', '/test-series'], ['Notes', '/notes']] },
  {
    title: 'Prepare',
    links: [['Current Affairs', '/current-affairs'], ['Previous Papers', '/previous-papers'], ['Syllabus', '/syllabus']]
  },
  { title: 'Account', links: [['Login', '/login'], ['Register', '/register'], ['Profile', '/profile']] }];

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid w-full max-w-none gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-6">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-ink-soft">
            One place for courses, mock tests, notes, current affairs and previous year papers.
          </p>
        </div>
        {groups.map((group) =>
        <div key={group.title}>
            <p className="text-[13px] font-semibold text-ink">{group.title}</p>
            <ul className="mt-3 space-y-2">
              {group.links.map(([label, href]) =>
            <li key={label}>
                  <Link to={href} className="text-sm text-ink-soft transition-colors duration-150 ease-smooth hover:text-brand-700">
                    {label}
                  </Link>
                </li>
            )}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-line px-4 py-5 text-center text-xs text-ink-muted sm:px-6 lg:px-6">
            © 2026 Chandrabhaga Academy. Built for serious exam preparation.
      </div>
    </footer>);

}
