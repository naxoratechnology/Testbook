import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppNotification, Role, User } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import { login as authLogin, register as authRegister, logout as authLogout, restoreSession } from '../services/auth/auth.slice';
import type { AppDispatch, RootState } from '../store';
import { ApiNotification, notificationsApiService } from '../services/notifications/notifications.api';

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
  const user = useSelector((state: RootState) => state.auth.user);
  const [items, setItems] = useState<AppNotification[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => { dispatch(restoreSession()); }, [dispatch]);
  useEffect(() => { if (!user) { setItems([]); return; } notificationsApiService.list().then(({ data }) => setItems(data.data.notifications.map((item: ApiNotification) => ({ id: item._id, title: item.title, message: item.message, type: item.type as AppNotification['type'], href: item.href || '/notifications', time: new Date(item.createdAt).toLocaleString('en-IN'), read: item.readBy.some((id) => id === user.id) })))).catch(() => setItems([])); }, [user]);

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
    await dispatch(authLogout()).unwrap();
  }, [request]);
  const markRead = useCallback((id: string) => { setItems((prev) => prev.map((item) => item.id === id ? { ...item, read: true } : item)); notificationsApiService.markRead(id).catch(() => undefined); }, []);
  const markAllRead = useCallback(() => { setItems((prev) => prev.map((item) => ({ ...item, read: true }))); notificationsApiService.markAllRead().catch(() => undefined); }, []);
  const value = useMemo(() => ({ user, login, register, logout, notifications: items, unreadCount: items.filter((item) => !item.read).length, markRead, markAllRead }), [user, login, register, logout, items, markRead, markAllRead]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used inside AuthProvider'); return context; }
