import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export type AuthStatus = 'loggedOut' | 'loggedIn' | 'idleWarning';

const ACCESS_KEY = 'admin_token';
const REFRESH_KEY = 'admin_refresh_token';

interface AuthContextValue {
  status: AuthStatus;
  setLoggedIn: () => void;
  setLoggedOut: () => void;
  setIdleWarning: () => void;
  setResumeFromIdle: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Bootstrap: kalau ada token di localStorage, anggap logged in.
  const [status, setStatus] = useState<AuthStatus>(() =>
    localStorage.getItem(ACCESS_KEY) ? 'loggedIn' : 'loggedOut'
  );

  const setLoggedIn = useCallback(() => setStatus('loggedIn'), []);
  const setLoggedOut = useCallback(() => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setStatus('loggedOut');
  }, []);
  const setIdleWarning = useCallback(() => {
    setStatus((prev) => (prev === 'loggedIn' ? 'idleWarning' : prev));
  }, []);
  const setResumeFromIdle = useCallback(() => setStatus('loggedIn'), []);

  return (
    <AuthContext.Provider
      value={{ status, setLoggedIn, setLoggedOut, setIdleWarning, setResumeFromIdle }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
