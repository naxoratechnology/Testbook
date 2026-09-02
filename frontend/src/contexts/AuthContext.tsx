import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AppNotification, Role, User } from '../types';
import { notifications as seedNotifications } from '../data/content';

const STUDENT: User = {
  id: 'u-student',
  name: 'Aarav Sharma',
  email: 'aarav@example.com',
  mobile: '+91 98765 43210',
  role: 'student',
  targetExam: 'SSC CGL',
  avatar: "/cabd38ae-4292-4b80-820f-fe327c69ea60.jpg"
};

const ADMIN: User = {
  id: 'u-admin',
  name: 'Neha Kapoor',
  email: 'admin@preparena.com',
  mobile: '+91 90000 11223',
  role: 'admin',
  targetExam: '—',
  avatar: ''
};

interface AuthValue {
  user: User | null;
  login: (identifier: string, password: string) => Role;
  register: (data: {name: string;email: string;targetExam: string;}) => Role;
  logout: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<AppNotification[]>(seedNotifications);

  const login = useCallback((identifier: string) => {
    const isAdmin = identifier.trim().toLowerCase().includes('admin');
    const next = isAdmin ? ADMIN : { ...STUDENT, email: identifier || STUDENT.email };
    setUser(next);
    return next.role;
  }, []);

  const register = useCallback((data: {name: string;email: string;targetExam: string;}) => {
    setUser({
      ...STUDENT,
      name: data.name || STUDENT.name,
      email: data.email || STUDENT.email,
      targetExam: data.targetExam || STUDENT.targetExam
    });
    return 'student' as Role;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const markRead = useCallback((id: string) => {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      notifications: items,
      unreadCount: items.filter((n) => !n.read).length,
      markRead,
      markAllRead
    }),
    [user, items, login, register, logout, markRead, markAllRead]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}