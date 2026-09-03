import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import DispatchIllustration from '../components/DispatchIllustration';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(email);
      navigate('/forgot-password/otp', { state: { email } });
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Failed to send OTP. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-paper">
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-4 sm:p-8 md:p-10">
        <DispatchIllustration className="w-full max-w-md page-enter" />
        <div className="w-full max-w-md rounded-2xl border border-line bg-card p-8 shadow-[0_24px_60px_-30px_rgba(12,31,26,0.25)]">
          <div className="mb-8 flex items-center gap-2" aria-hidden="true">
            <span className="block h-2.5 w-2.5 rounded-full bg-moss" />
            <span className="block h-0.5 w-6 rounded-full bg-moss" />
            <span className="font-display text-lg font-bold uppercase tracking-wide text-ink">
              Ride Tracking
            </span>
          </div>

          <div className="mb-8">
            <p className="ops-eyebrow text-[10px] text-moss">Account recovery</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
              Forgot Password
            </h1>
            <p className="mt-2 text-sm text-muted">
              Enter your email to receive a one-time code.
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

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-moss px-4 py-2.5 font-medium text-card transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss disabled:opacity-50"
            >
              {loading ? 'Sending code...' : 'Send code'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Remembered your password?{' '}
            <a href="/login" className="font-medium text-moss hover:underline">
              Back to login
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
