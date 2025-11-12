import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthResponse, AuthenticatedUser } from './api';

interface AuthState {
  token: string;
  user: AuthenticatedUser;
}

const STORAGE_KEY = 'number-talk-auth';

function readInitialAuthState(): AuthState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as AuthState;
    if (!parsed?.token || !parsed?.user) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function usePersistentAuth() {
  const [auth, setAuth] = useState<AuthState | null>(() => readInitialAuthState());

  useEffect(() => {
    if (!auth) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  const login = useCallback((response: AuthResponse) => {
    setAuth({
      token: response.token,
      user: response.user
    });
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
  }, []);

  return useMemo(
    () => ({
      auth,
      login,
      logout
    }),
    [auth, login, logout]
  );
}

