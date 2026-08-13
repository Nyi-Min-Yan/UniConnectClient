"use client";

import { useState } from "react";
import { apiClient, type LoginRequest } from "@/lib/axios";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorModalOpen(false);

    try {
      const credentials: LoginRequest = { email, password };
      const { data } = await apiClient.post('/api/auth/login', credentials);

      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);

      if (typeof document !== 'undefined') {
        document.cookie = `access_token=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        document.cookie = `refresh_token=${data.refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      }

      const role = data.roleName;
      const roleRoute: Record<string, string> = {
        STUDENT: '/students/feed',
        STAFF: '/teachers/feed',
        SYSTEM_ADMIN: '/admin/feed',
      };

      const target = role ? (roleRoute[role] || '/students/feed') : '/students/feed';

      setTimeout(() => {
        window.location.href = target;
      }, 300);
    } catch (err: unknown) {
      let msg = 'Connection failed. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
        msg = axiosErr.response?.data?.message || axiosErr.response?.status === 401
          ? 'Invalid email or password'
          : 'Connection failed. Please try again.';
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMessage(msg);
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">U</span>
          </div>
          <h1 className="text-2xl font-bold text-base-content">Welcome Back</h1>
          <p className="text-base-content/50 mt-1">Sign in to continue to UniConnect</p>
        </div>

        <form onSubmit={handleLogin} className="bg-base-100 rounded-2xl border border-base-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-base-content/80">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-base-200 bg-base-100 text-base-content text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-base-content/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-base-content/80">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-xl border border-base-200 bg-base-100 text-base-content text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-base-content/30 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943-9.543-7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943-9.542-7-1.274 4.057-5.064-7-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>

      {/* Error Modal - DaisyUI */}
      <div className={`modal ${errorModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error mb-3">Login Failed</h3>
          <p className="text-base-content/80 mb-4">{errorMessage}</p>
          <div className="modal-action">
            <button
              onClick={() => setErrorModalOpen(false)}
              className="btn btn-primary"
            >
              OK
            </button>
          </div>
        </div>
        <form className="modal-backdrop" onSubmit={(e) => { e.preventDefault(); setErrorModalOpen(false); }}>
          <button type="submit" className="btn btn-ghost btn-circle" aria-label="close">✕</button>
        </form>
      </div>
    </div>
  );
}