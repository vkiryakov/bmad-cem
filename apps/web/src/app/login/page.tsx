'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ApiError } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';

interface LoginResponse {
  data: { accessToken: string };
  meta: Record<string, unknown>;
}

export default function LoginPage() {
  const router = useRouter();
  const { login: saveToken, isAuthenticated } = useAuth();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.fetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login: loginValue, password }),
      });
      saveToken(response.data.accessToken);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Произошла ошибка. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !loginValue || !password || loading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-[400px] rounded-xl bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-center text-2xl font-semibold">
          Вход в систему
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Логин
            </label>
            <input
              id="login"
              type="text"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
              autoComplete="username"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="text-sm text-rose-500">{error}</p>
          )}
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
