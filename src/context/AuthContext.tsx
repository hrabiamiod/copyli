import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { setAccessToken, setRefreshFn } from '../lib/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  email_verified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    consents: Record<string, boolean>
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function callRefresh(): Promise<{ access_token?: string; user?: AuthUser } | null> {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'X-Copyli-Client': 'web', 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) return null;
    return res.json() as Promise<{ access_token?: string; user?: AuthUser }>;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const didInit = useRef(false);

  // Funkcja odświeżania tokena (eksportowana do api.ts)
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const data = await callRefresh();
    if (!data?.access_token) {
      setAccessToken(null);
      setUser(null);
      return false;
    }
    setAccessToken(data.access_token);

    // Jeśli refresh nie zwrócił danych użytkownika, pobierz z /api/auth/me
    if (!data.user && !user) {
      try {
        const meRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${data.access_token}`, 'X-Copyli-Client': 'web' },
        });
        if (meRes.ok) {
          const me = await meRes.json() as AuthUser & { email_verified: boolean };
          setUser({
            id: me.id,
            email: me.email,
            name: (me as { name?: string | null }).name ?? null,
            avatar: (me as { avatar?: string | null }).avatar ?? null,
            email_verified: me.email_verified,
          });
        }
      } catch { /* kontynuuj bez danych usera */ }
    }

    return true;
  }, [user]);

  // Silent refresh przy starcie aplikacji
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    setRefreshFn(refreshToken);

    (async () => {
      const data = await callRefresh();
      if (data?.access_token) {
        setAccessToken(data.access_token);
        // Pobierz dane usera
        try {
          const meRes = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${data.access_token}`, 'X-Copyli-Client': 'web' },
          });
          if (meRes.ok) {
            const me = await meRes.json() as Record<string, unknown>;
            setUser({
              id: me.id as string,
              email: me.email as string,
              name: (me.name as string | null) ?? null,
              avatar: (me.avatar as string | null) ?? null,
              email_verified: me.email_verified as boolean,
            });
          }
        } catch { /* brak sieci / błąd */ }
      }
      setIsLoading(false);
    })();
  }, [refreshToken]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Copyli-Client': 'web' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json() as {
      access_token?: string;
      user?: { id: string; email: string; name: string | null; avatar: string | null; email_verified: boolean };
      error?: string;
    };
    if (!res.ok) throw new Error(data.error ?? 'Błąd logowania');

    setAccessToken(data.access_token ?? null);
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.avatar,
        email_verified: data.user.email_verified,
      });
    }
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    name: string,
    consents: Record<string, boolean>
  ) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Copyli-Client': 'web' },
      body: JSON.stringify({ email, password, name, consents }),
    });
    const data = await res.json() as {
      access_token?: string;
      user?: { id: string; email: string; name: string | null; avatar: string | null; email_verified: boolean };
      error?: string;
    };
    if (!res.ok) throw new Error(data.error ?? 'Błąd rejestracji');

    setAccessToken(data.access_token ?? null);
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        avatar: data.user.avatar ?? null,
        email_verified: data.user.email_verified,
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'X-Copyli-Client': 'web', 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch { /* ignoruj błędy sieciowe */ }
    setAccessToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...patch } : null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth musi być używany wewnątrz AuthProvider');
  return ctx;
}
