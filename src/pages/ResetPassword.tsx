import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../lib/api';
import PasswordInput from '../components/PasswordInput';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !otp) {
      setError('Invalid session. Please start from forgot password page.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirmation do not match.');
      setLoading(false);
      return;
    }

    try {
      await authAPI.resetPassword(email, otp, password, confirmPassword);
      navigate('/login');
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Failed to reset password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-paper">
      <main className="flex min-h-screen items-center justify-center p-4 sm:p-8 md:p-10">
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
              Reset Password
            </h1>
            <p className="mt-2 text-sm text-muted">
              Choose a new password. Use 8+ characters with mixed case and at least one number.
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
              <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-ink">
                New Password
              </label>
              <PasswordInput
                id="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-ink">
                Confirm New Password
              </label>
              <PasswordInput
                id="confirm-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-moss px-4 py-2.5 font-medium text-card transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
