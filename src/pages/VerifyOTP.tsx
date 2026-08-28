import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../lib/api';
import loginIllustration from '../assets/login-illustration.svg';

export default function VerifyOTP() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const newValue = value.replace(/\D/g, '');
    if (newValue.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = newValue;
    setOtp(newOtp);

    if (newValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);
    const nextEmptyIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextEmptyIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email) {
      setError('Email not found. Please start from forgot password page.');
      setLoading(false);
      return;
    }

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits.');
      setLoading(false);
      return;
    }

    try {
      await authAPI.verifyOTP(email, otpString);
      navigate('/forgot-password/reset', { state: { email, otp: otpString } });
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Invalid OTP. Please try again.';
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
            Confirm the reset code.
          </h1>
          <p className="text-sm lg:text-base text-gray-700 dark:text-slate-300 mt-3">
            Six digits keeps the reset quick without making the form feel heavy.
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify OTP</h2>
            <p className="text-sm text-gray-700 dark:text-slate-300 mt-1">Enter the 6-digit code sent to {email || 'your email'}.</p>
          </div>

          {error && (
            <div role="alert" className="mb-4 p-3 text-sm text-red-700 dark:text-red-300 bg-red-50/90 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  aria-label={`OTP digit ${index + 1}`}
                  className="w-12 h-12 text-center text-xl font-semibold bg-white/80 dark:bg-slate-900/60 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-slate-500 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900 focus:border-blue-500"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify code'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-6">
            Didn't receive the code?{' '}
            <a href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">
              Resend code
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
