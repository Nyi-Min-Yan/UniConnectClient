
const response = await fetch(
      "http://localhost:8080/api/admin/users/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": Bearer ${localStorage.getItem("accessToken")},
        },
        body: JSON.stringify(form),
      }
    );


const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Send request to your Next.js rewrite route or directly to backend
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message  "Invalid credentials");
      }

      // Store tokens returned by backend
      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

      // Handle mandatory password update flow or navigate to feed
      if (data.must_change_password) {
        router.push("/change-password");
      } else {
        router.push("/feed");
      }
    } catch (err: any) {
      setError(err.message  "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };


// lib/axios.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Access Token to Requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = Bearer ${token};
    }
  }
  return config;
});

// Handle Token Expiry & Silent Refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = Bearer ${token};
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        // Call your /api/auth/refresh endpoint
        const { data } = await axios.post(
          ${apiClient.defaults.baseURL}/api/auth/refresh,
          { refreshToken }
        );

        const newAccessToken = data.accessToken;
        localStorage.setItem('access_token', newAccessToken);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }

        apiClient.defaults.headers.common['Authorization'] = Bearer ${newAccessToken};
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = Bearer ${newAccessToken};
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


// app/providers.tsx
"use client";

import { SWRConfig } from 'swr';
import { apiClient } from '@/lib/axios';

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}

// hooks/useAuth.ts
"use client";

import useSWR, { useSWRConfig } from 'swr';
import { apiClient } from '@/lib/axios';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  departmentId?: string;
}

export function useAuth() {
  const { mutate } = useSWRConfig();

  // Helper check to ensure a token exists before attempting to fetch /me
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('access_token');

  // Fetch current user from /api/auth/me
  const { data: user, error, isLoading, mutate: mutateUser } = useSWR<User>(
    hasToken ? '/api/auth/me' : null
  );

  const login = async (credentials: Record<string, any>) => {
    const { data } = await apiClient.post('/api/auth/login', credentials);
    
    // Save tokens
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);

    // Refetch the current user immediately
    await mutateUser();
    return data;
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Clear current user state and purge cache
      await mutateUser(null, false);
      mutate(() => true, undefined, { revalidate: false });

      window.location.href = '/login';
    }
  };

  return {
    user,
    isLoading: hasToken ? isLoading : false,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser: mutateUser,
  };
}


hooks/useAuth.ts


"use client";

import useSWR from 'swr';

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR('/api/users');

  return {
    users: data ?? [],
    isLoading,
    isError: !!error,
    refreshUsers: mutate,
  };
}

export function useUsersByRole(role: string | null, details = false) {
  const endpoint = role 
    ? /api/users/role/${role}${details ? '/details' : ''} 
    : null;

  const { data, error, isLoading } = useSWR(endpoint);

  return {
    users: data ?? [],
    isLoading,
    isError: !!error,
  };
}


useUsers


"use client";

import useSWR from 'swr';
import { apiClient } from '@/lib/axios';

export function useDepartments() {
  const { data, error, isLoading, mutate } = useSWR('/api/departments');

  const createDepartment = async (deptData: { name: string; code: string }) => {
    const res = await apiClient.post('/api/departments', deptData);
    mutate(); // Refresh the list after creation
    return res.data;
  };

  const updateDepartment = async (id: string | number, deptData: any) => {
    const res = await apiClient.put(/api/departments/${id}, deptData);
    mutate();
    return res.data;
  };

  const deleteDepartment = async (id: string | number) => {
    await apiClient.delete(/api/departments/${id});
    mutate();
  };

  return {
    departments: data ?? [],
    isLoading,
    isError: !!error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
}


useDepartments


"use client";

import useSWR from 'swr';

export function useStudentGrades(studentId: string | null, academicYear?: string) {
  const endpoint = studentId
    ? academicYear
      ? /api/academic/grades/${studentId}/${academicYear}
      : /api/academic/grades/${studentId}
    : null;

  const { data, error, isLoading } = useSWR(endpoint);

  return { grades: data, isLoading, isError: !!error };
}

export function useAttendance(studentId: string | null) {
  const { data, error, isLoading } = useSWR(
    studentId ? /api/attendance/${studentId} : null
  );

  return { attendance: data, isLoading, isError: !!error };
}

export function useLowAttendanceStudents() {
  const { data, error, isLoading } = useSWR('/api/attendance/below75');

  return { lowAttendanceList: data ?? [], isLoading, isError: !!error };
}


useAcademic


Act as a Senior Frontend Engineer building a Next.js App Router application with Axios and SWR.

Requirements:
1. Create a useAuth custom hook that handles logging in via POST /api/auth/login.
2. Capture and parse backend authentication error messages cleanly—specifically handling remaining login attempt warnings (e.g., 401 Bad Credentials) and account lock notifications (e.g., 423 Locked / Account Disabled).
3. Handle token persistence: Save the returned accessToken and refreshToken in localStorage.
4. Implement routing flow based on response flags:
   - If mustChangePassword is true, redirect the user immediately to /change-password.
   - If mustChangePassword is false, redirect the user to /dashboard.
5. Create a modern UI page for /login using Tailwind CSS that dynamically displays backend error/warning messages, handles loading states, and collects email and password inputs.