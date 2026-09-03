import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import PasswordInput from '../components/PasswordInput';
import DispatchIllustration from '../components/DispatchIllustration';

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
    <div className="grid min-h-screen w-full grid-cols-1 bg-paper md:grid-cols-2">
      {/* Left: ilustrasi dispatch. Hidden on mobile, shown md+. */}
      <aside className="relative hidden min-h-screen flex-col items-center justify-center gap-6 overflow-hidden border-r border-line bg-card p-8 md:flex md:p-10 lg:p-14">
        <div className="flex items-center gap-2 self-start" aria-hidden="true">
          <span className="block h-2.5 w-2.5 rounded-full bg-moss" />
          <span className="block h-0.5 w-6 rounded-full bg-moss" />
          <span className="font-display text-lg font-bold uppercase tracking-wide text-ink">
            Ride Tracking
          </span>
        </div>
        <DispatchIllustration className="w-full max-w-md page-enter" />
        <div className="text-center">
          <p className="ops-eyebrow text-[10px] text-moss">Operations console</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink lg:text-3xl">
            Watch every ride, in real time.
          </h1>
          <p className="mt-2 text-sm text-muted">
            Live fleet telemetry, user activity, and ride history in one place.
          </p>
        </div>
        <p className="ops-figures self-end font-mono text-xs text-muted">v1.0 · Operations console</p>
      </aside>

      {/* Right: form. */}
      <main className="flex items-center justify-center p-4 sm:p-8 md:p-10">
        <div className="w-full max-w-md rounded-2xl border border-line bg-card p-8 shadow-[0_24px_60px_-30px_rgba(12,31,26,0.25)]">
          {/* Mobile-only brand strip */}
          <div className="mb-6 flex items-center gap-2 md:hidden" aria-hidden="true">
            <span className="block h-2.5 w-2.5 rounded-full bg-moss" />
            <span className="block h-0.5 w-6 rounded-full bg-moss" />
            <span className="font-display text-lg font-bold uppercase tracking-wide text-ink">
              Ride Tracking
            </span>
          </div>
          <div className="mb-8 flex items-center gap-2" aria-hidden="true">
            <span className="block h-2.5 w-2.5 rounded-full bg-moss" />
            <span className="block h-0.5 w-6 rounded-full bg-moss" />
            <span className="font-display text-lg font-bold uppercase tracking-wide text-ink">
              Ride Tracking
            </span>
          </div>

          <div className="mb-8">
            <p className="ops-eyebrow text-[10px] text-moss">Operations console</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
              Admin Login
            </h1>
            <p className="mt-2 text-sm text-muted">
              Sign in to access the operations dashboard.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-warn-line bg-warn-fill p-3 text-sm text-warn-ink"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-moss"
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                Password
              </label>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-moss px-4 py-2.5 font-medium text-card transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Forgot your password?{' '}
            <a href="/forgot-password" className="font-medium text-moss hover:underline">
              Reset Password
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
