import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Extend Window interface to include our custom property
declare global {
  interface Window {
    __NEXT_PUBLIC_API_URL__?: string;
  }
}

const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Use the window property directly with proper typing
    return window.__NEXT_PUBLIC_API_URL__ || process.env.NEXT_PUBLIC_API_URL || '';
  }
  return process.env.NEXT_PUBLIC_API_URL || '';
};

export const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

function deleteCookie(name: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  }
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
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
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/api/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newAccessToken = data.accessToken;
        localStorage.setItem('access_token', newAccessToken);
        setCookie('access_token', newAccessToken, 60 * 60 * 24 * 7);

        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
          setCookie('refresh_token', data.refreshToken, 60 * 60 * 24 * 30);
        }

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        deleteCookie('access_token');
        deleteCookie('refresh_token');
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

export type ApiErrorResponse = {
  success: false;
  message?: string;
  error?: string;
  timestamp?: string;
  path?: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  userId: string;
  email: string;
  roleName: string;
  isActive: boolean;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type CurrentUserResponse = {
  userId: string;
  email: string;
  roleName: string;
  isActive: boolean;
  registrationStatus: string;
  lastLogin: string | null;
  createdAt: string;
};

export const authApi = {
  login: (credentials: LoginRequest) => apiClient.post<AuthResponse>('/api/auth/login', credentials),
  refresh: (payload: RefreshTokenRequest) => apiClient.post<AuthResponse>('/api/auth/refresh', payload),
  logout: () => apiClient.post('/api/auth/logout'),
  logoutAll: () => apiClient.post('/api/auth/logout-all'),
  me: () => apiClient.get<CurrentUserResponse>('/api/auth/me'),
};