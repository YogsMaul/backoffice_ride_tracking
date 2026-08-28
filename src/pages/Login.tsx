import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import loginIllustration from '../assets/login-illustration.svg';

// H-1 (preserved): prefill is opt-in via env. Default is empty.
const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL as string | undefined;
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD as string | undefined;

export default function Login() {
  const [email, setEmail] = useState(DEMO_EMAIL ?? '');
  const [password, setPassword] = useState(DEMO_PASSWORD ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authAPI.login(email, password);
      const token = res.data.access_token || res.data.token;
      localStorage.setItem('admin_token', token);
      navigate('/dashboard');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // R-03: min-h-screen (not h-screen) so the on-screen keyboard does not crop content.
    <div className="login-bg min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      {/* Left: brand + illustration. Hidden on mobile, shown md+. */}
      <aside className="login-brand relative hidden md:flex flex-col justify-between p-10 lg:p-14 overflow-hidden">
        {/* Decorative orbs (R-13: glow as accent, single screen). */}
        <div className="login-orb login-orb--a" aria-hidden="true" />
        <div className="login-orb login-orb--b" aria-hidden="true" />
        <div className="login-orb login-orb--c" aria-hidden="true" />

        {/* Identity motif + wordmark at the top. */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5" aria-hidden="true">
            <span className="block w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="block w-2.5 h-2.5 rounded-full bg-violet-600" />
            <span className="block h-0.5 w-6 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">Ride Tracking</span>
        </div>

        {/* Center: illustration + tagline. */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <img
            src={loginIllustration}
            alt=""
            className="w-full max-w-sm h-auto mb-8 login-illustration-anim"
          />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            Watch every ride, in real time.
          </h1>
          <p className="text-sm lg:text-base text-gray-700 dark:text-slate-300 mt-3">
            Live fleet telemetry, user activity, and ride history in one place.
          </p>
        </div>

        {/* Bottom: small build/version stamp. */}
        <div className="relative z-10 text-xs text-gray-500 dark:text-slate-400">
          v1.0 · Operations console
        </div>
      </aside>

      {/* Right: form. Single glass surface. R-10 single-use glass. */}
      <main className="flex items-center justify-center p-4 sm:p-8 md:p-10">
        <div className="login-card w-full max-w-md rounded-2xl border border-white/40 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.18)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] p-8">
          {/* Identity motif shown only on mobile (left side carries it on md+). */}
          <div className="md:hidden inline-flex items-center gap-1.5 mb-4" aria-hidden="true">
            <span className="block w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="block w-2.5 h-2.5 rounded-full bg-violet-600" />
            <span className="block h-0.5 w-6 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h2>
            <p className="text-sm text-gray-700 dark:text-slate-300 mt-1">Sign in to access the operations dashboard.</p>
          </div>

          {error && (
            <div role="alert" className="mb-4 p-3 text-sm text-red-700 dark:text-red-300 bg-red-50/90 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/60 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-500 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900 placeholder:text-gray-500 dark:placeholder:text-slate-500"
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/60 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-500 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900 placeholder:text-gray-500 dark:placeholder:text-slate-500"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-6">
            Forgot your password?{' '}
            <a href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
              Reset Password
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
