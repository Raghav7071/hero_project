'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  charity_id: string | null;
  charity_contribution_pct: number;
}

interface Subscription {
  id: string;
  status: string;
  plan_type: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  isSubscribed: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      const { data } = await authAPI.getMe();
      setUser(data.user);
      setSubscription(data.subscription);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const login = async (email: string, password: string) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    await refresh();
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const { data } = await authAPI.signup({ email, password, fullName });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    await refresh();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setSubscription(null);
  };

  return (
    <AuthContext.Provider value={{
      user, subscription, loading, login, signup, logout, refresh,
      isSubscribed: subscription?.status === 'active',
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
