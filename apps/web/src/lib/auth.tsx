'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  signup: (email: string, password: string, name: string) => { ok: boolean; error?: string };
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = 'bookdoongji_user';
const USERS_KEY = 'bookdoongji_users'; // 이메일 -> {name, passwordHash(단순 해시)}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return 'h' + Math.abs(h).toString(36);
}

function loadUsers(): Record<string, { name: string; pw: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  const login = (email: string, name: string) => {
    const u = { email: email.toLowerCase().trim(), name };
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const signup = (email: string, password: string, name: string) => {
    const em = email.toLowerCase().trim();
    if (!em || !password || password.length < 4) {
      return { ok: false, error: '이메일과 4자 이상 비밀번호를 입력해 주세요.' };
    }
    const users = loadUsers();
    if (users[em]) {
      return { ok: false, error: '이미 가입된 이메일입니다. 로그인해 주세요.' };
    }
    users[em] = { name: name.trim() || em.split('@')[0], pw: simpleHash(password) };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    login(em, users[em].name);
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  // 로그인 검증용 (내부)
  const verifyLogin = (email: string, password: string): { ok: boolean; name?: string; error?: string } => {
    const users = loadUsers();
    const em = email.toLowerCase().trim();
    const rec = users[em];
    if (!rec) return { ok: false, error: '가입되지 않은 이메일입니다.' };
    if (rec.pw !== simpleHash(password)) return { ok: false, error: '비밀번호가 일치하지 않습니다.' };
    return { ok: true, name: rec.name };
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// verifyLogin을 context 외부에서도 쓸 수 있게 export
export function verifyCredentials(email: string, password: string) {
  const users = loadUsers();
  const em = email.toLowerCase().trim();
  const rec = users[em];
  if (!rec) return { ok: false as const, error: '가입되지 않은 이메일입니다.' };
  if (rec.pw !== simpleHash(password)) return { ok: false as const, error: '비밀번호가 일치하지 않습니다.' };
  return { ok: true as const, name: rec.name };
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.');
  return ctx;
}
