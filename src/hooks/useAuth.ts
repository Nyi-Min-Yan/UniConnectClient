"use client";

import useSWR, { useSWRConfig } from 'swr';
import { apiClient, type CurrentUserResponse, type AuthResponse, type LoginRequest } from '@/lib/axios';

export function useAuth() {
  const { mutate } = useSWRConfig();

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('access_token');

  const { data: user, error, isLoading, mutate: mutateUser } = useSWR<CurrentUserResponse>(
    hasToken ? '/api/auth/me' : null,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  const login = async (credentials: LoginRequest) => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/login', credentials);

    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);

    if (typeof document !== 'undefined') {
      document.cookie = `access_token=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      document.cookie = `refresh_token=${data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }

    await mutateUser();
    return data;
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // ignore logout errors
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (typeof document !== 'undefined') {
        document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'refresh_token=; path=/; max-age=0; SameSite=Lax';
      }

      await mutateUser(undefined, false);
      mutate(() => true, undefined, { revalidate: false });

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const logoutAll = async () => {
    try {
      await apiClient.post('/api/auth/logout-all');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (typeof document !== 'undefined') {
        document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'refresh_token=; path=/; max-age=0; SameSite=Lax';
      }

      await mutateUser(undefined, false);
      mutate(() => true, undefined, { revalidate: false });

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  return {
    user,
    isLoading: hasToken ? isLoading : false,
    isAuthenticated: !!user,
    login,
    logout,
    logoutAll,
    refreshUser: mutateUser,
  };
}