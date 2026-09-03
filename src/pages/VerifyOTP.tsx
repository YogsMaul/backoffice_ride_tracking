import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../lib/api';
import DispatchIllustration from '../components/DispatchIllustration';

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
              Verify OTP
            </h1>
            <p className="mt-2 text-sm text-muted">
              Enter the 6-digit code sent to {email || 'your email'}.
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
                  className="h-12 w-12 rounded-lg border-2 border-line bg-paper text-center text-xl font-semibold text-ink focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-moss px-4 py-2.5 font-medium text-card transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify code'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Didn't receive the code?{' '}
            <a href="/forgot-password" className="font-medium text-moss hover:underline">
              Resend code
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
