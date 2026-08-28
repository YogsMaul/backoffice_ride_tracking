import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../lib/api';
import loginIllustration from '../assets/login-illustration.svg';

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
    <div className="login-bg min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      <aside className="login-brand relative hidden md:flex flex-col justify-between p-10 lg:p-14 overflow-hidden">
        <div className="login-orb login-orb--a" aria-hidden="true" />
        <div className="login-orb login-orb--b" aria-hidden="true" />
        <div className="login-orb login-orb--c" aria-hidden="true" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5" aria-hidden="true">
            <span className="block w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="block w-2.5 h-2.5 rounded-full bg-violet-600" />
            <span className="block h-0.5 w-6 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">Ride Tracking</span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <img src={loginIllustration} alt="" className="w-full max-w-sm h-auto mb-8 login-illustration-anim" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            Choose a new password.
          </h1>
          <p className="text-sm lg:text-base text-gray-700 dark:text-slate-300 mt-3">
            Use 8 or more characters with a mix of cases and at least one number.
          </p>
        </div>

        <div className="relative z-10 text-xs text-gray-500 dark:text-slate-400">v1.0 · Operations console</div>
      </aside>

      <main className="flex items-center justify-center p-4 sm:p-8 md:p-10">
        <div className="login-card w-full max-w-md rounded-2xl border border-white/40 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.18)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] p-8">
          <div className="md:hidden inline-flex items-center gap-1.5 mb-4" aria-hidden="true">
            <span className="block w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="block w-2.5 h-2.5 rounded-full bg-violet-600" />
            <span className="block h-0.5 w-6 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
            <p className="text-sm text-gray-700 dark:text-slate-300 mt-1">Enter your new password to finish the reset.</p>
          </div>

          {error && (
            <div role="alert" className="mb-4 p-3 text-sm text-red-700 dark:text-red-300 bg-red-50/90 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1" htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/60 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-500 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900 placeholder:text-gray-500 dark:placeholder:text-slate-500"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1" htmlFor="confirm-password">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white/80 dark:bg-slate-900/60 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-500 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900 placeholder:text-gray-500 dark:placeholder:text-slate-500"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}