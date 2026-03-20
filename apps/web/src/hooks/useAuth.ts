'use client';

import { useCallback, useSyncExternalStore } from 'react';

const TOKEN_KEY = 'accessToken';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function useAuth() {
  const token = useSyncExternalStore(
    subscribe,
    () => getToken(),
    () => null,
  );

  const isAuthenticated = token !== null;

  const login = useCallback((accessToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    window.dispatchEvent(new Event('storage'));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event('storage'));
  }, []);

  return { isAuthenticated, token, login, logout };
}
