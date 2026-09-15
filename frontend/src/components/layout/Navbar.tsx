import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BellIcon, ChevronDownIcon, LogOutIcon, MegaphoneIcon, MenuIcon, SearchIcon, UserIcon, XIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useViewer } from '../../contexts/ViewerContext';
import { btn } from '../ui/Primitives';
import { Logo } from './Logo';

const publicLinks = [
{ to: '/', label: 'Home' },
{ to: '/courses', label: 'Courses' },
{ to: '/test-series', label: 'Test Series' },
{ to: '/notes', label: 'Notes' },
{ to: '/current-affairs', label: 'Current Affairs' },
{ to: '/notices', label: 'Notices' },
{ to: '/previous-papers', label: 'Previous Papers' },
{ to: '/syllabus', label: 'Syllabus' }];


const studentLinks = [{ to: '/dashboard', label: 'Dashboard' }, ...publicLinks.slice(1)];

export function Navbar() {
  const { user, logout, unreadCount } = useAuth();
  const { setSearchOpen } = useViewer();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = user?.role === 'student' ? studentLinks : publicLinks;

  const linkClass = ({ isActive }: {isActive: boolean;}) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ease-smooth ${
  isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:text-ink'}`;


  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-3 lg:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden items-center justify-center gap-0.5 lg:flex">
          {links.map((link) =>
          <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
              {link.label}
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-0.5 sm:gap-1.5">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft transition-colors duration-150 ease-smooth hover:bg-canvas hover:text-ink">
            
            <SearchIcon className="h-[18px] w-[18px]" />
          </button>

          <Link
            to={user ? '/notifications' : '/notices'}
            aria-label={user ? 'Notifications' : 'Notices'}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft transition-colors duration-150 ease-smooth hover:bg-canvas hover:text-ink">
            
            {user ? <BellIcon className="h-[18px] w-[18px]" /> : <MegaphoneIcon className="h-[18px] w-[18px]" />}
            {user && unreadCount > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </Link>

          {user ?
          <div className="relative">
              <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl border border-line py-1 pl-1 pr-2 transition-colors duration-150 ease-smooth hover:bg-canvas">
              
                <Avatar name={user.name} src={user.avatar} />
                <span className="hidden text-sm font-medium text-ink sm:block">{user.name.split(' ')[0]}</span>
                <ChevronDownIcon className="h-4 w-4 text-ink-muted" />
              </button>
              {menuOpen &&
            <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-lift">
                    <div className="px-2.5 py-2">
                      <p className="text-sm font-semibold text-ink">{user.name}</p>
                      <p className="truncate text-xs text-ink-muted">{user.email}</p>
                    </div>
                    <div className="my-1 h-px bg-line" />
                    <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-soft hover:bg-canvas hover:text-ink">
                  
                      <UserIcon className="h-4 w-4" /> Profile
                    </Link>
                    <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-soft hover:bg-canvas hover:text-ink">
                  
                      <LogOutIcon className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </>
            }
            </div> :

          <>
              <Link to="/login" className={btn('secondary', 'md', 'hidden sm:inline-flex')}>
                Login
              </Link>
            </>
          }

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-canvas lg:hidden">
            
            {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen &&
      <nav aria-label="Mobile" className="border-t border-line bg-white px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {links.map((link) =>
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            onClick={() => setMobileOpen(false)}
            className={linkClass}>
            
                {link.label}
              </NavLink>
          )}
          </div>
          {!user &&
        <div className="mt-3 grid grid-cols-2 gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className={btn('secondary')}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className={btn('primary')}>
                Start Learning
              </Link>
            </div>
        }
        </nav>
      }
    </header>);

}

export function Avatar({ name, src, size = 32 }: {name: string;src?: string;size?: number;}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={{ width: size, height: size }}
        className="rounded-lg object-cover" />);


  }
  return (
    <span
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
      
      {name.
      split(' ').
      map((n) => n[0]).
      slice(0, 2).
      join('')}
    </span>);

}
