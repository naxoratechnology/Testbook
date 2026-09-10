import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AppNotification, Role, User } from '../types';
import { notifications as seedNotifications } from '../data/content';
import { useDispatch } from 'react-redux';
import { login as authLogin, register as authRegister, logout as authLogout } from '../services/auth/auth.slice';
import type { AppDispatch } from '../store';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
type AuthData = { name: string; email: string; mobile: string; password: string; targetExam: string };
const mapUser = (user: Omit<User, 'avatar'>): User => ({ ...user, avatar: '' });

interface AuthValue {
  user: User | null;
  login: (identifier: string, password: string) => Promise<Role>;
  register: (data: AuthData) => Promise<Role>;
  logout: () => Promise<void>;
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState(seedNotifications);
  const dispatch = useDispatch<AppDispatch>();

  const request = useCallback(async (path: string, body?: unknown) => {
    const response = await fetch(API + path, { method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : undefined, credentials: 'include', body: body ? JSON.stringify(body) : undefined });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Request failed.');
    return payload;
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    return (await dispatch(authLogin({ identifier, password })).unwrap()).role;
  }, [request]);

  const register = useCallback(async (data: AuthData) => {
    return (await dispatch(authRegister(data)).unwrap()).role;
  }, [request]);

  const logout = useCallback(async () => {
    try { await dispatch(authLogout()).unwrap(); } finally { setUser(null); }
  }, [request]);
  const markRead = useCallback((id: string) => setItems((prev) => prev.map((item) => item.id === id ? { ...item, read: true } : item)), []);
  const markAllRead = useCallback(() => setItems((prev) => prev.map((item) => ({ ...item, read: true }))), []);
  const value = useMemo(() => ({ user, login, register, logout, notifications: items, unreadCount: items.filter((item) => !item.read).length, markRead, markAllRead }), [user, login, register, logout, items, markRead, markAllRead]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used inside AuthProvider'); return context; }
