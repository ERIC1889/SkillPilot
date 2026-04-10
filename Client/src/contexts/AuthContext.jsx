import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const defaultOnboarding = {
  profile: false,
  goal: false,
  certSelected: false,
  roadmap: false,
  complete: false,
  nextStep: 'profile',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [onboarding, setOnboarding] = useState(defaultOnboarding);
  const [loading, setLoading] = useState(true);

  const applyAuthPayload = (payload) => {
    if (!payload) return;
    if (payload.user) setUser(payload.user);
    if (payload.onboarding) setOnboarding(payload.onboarding);
  };

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setOnboarding(defaultOnboarding);
      return null;
    }
    try {
      const res = await api.get('/auth/me');
      const d = res.data?.data || {};
      // 서버는 { user, onboarding } 또는 user 자체를 반환할 수 있음
      const u = d.user || d;
      const o = d.onboarding || defaultOnboarding;
      setUser(u);
      setOnboarding(o);
      return { user: u, onboarding: o };
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setOnboarding(defaultOnboarding);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data.data;
    localStorage.setItem('token', data.token);
    applyAuthPayload(data);
    return data;
  };

  const signup = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const data = res.data.data;
    localStorage.setItem('token', data.token);
    applyAuthPayload(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setOnboarding(defaultOnboarding);
  };

  const value = {
    user,
    setUser,
    onboarding,
    refreshMe,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
