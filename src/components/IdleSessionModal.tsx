import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Timer } from 'lucide-react';
import { authAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const COUNTDOWN_SECONDS = 30;

/**
 * Modal "Sesi akan berakhir" — muncul waktu idle > 5 menit pas user balik
 * ke tab. Countdown 30 detik; kalau lewat, auto logout. Tombol Lanjutkan
 * panggil /auth/refresh → silent refresh.
 */
export default function IdleSessionModal() {
  const { setResumeFromIdle, setLoggedOut } = useAuth();
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);
  const [resuming, setResuming] = useState(false);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus tombol Lanjutkan biar user bisa tekan Enter.
  useEffect(() => {
    continueButtonRef.current?.focus();
  }, []);

  // Countdown timer.
  useEffect(() => {
    if (remaining <= 0) {
      setLoggedOut();
      return;
    }
    const t = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, setLoggedOut]);

  // ESC juga logout — biar user gak stuck di modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLoggedOut();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setLoggedOut]);

  const handleResume = async () => {
    setResuming(true);
    const refresh = localStorage.getItem('admin_refresh_token');
    if (!refresh) {
      setLoggedOut();
      return;
    }
    try {
      const res = await authAPI.refresh(refresh);
      if (res.data?.access_token) {
        localStorage.setItem('admin_token', res.data.access_token);
        if (res.data.refresh_token) {
          localStorage.setItem('admin_refresh_token', res.data.refresh_token);
        }
        setResumeFromIdle();
      } else {
        setLoggedOut();
      }
    } catch {
      setLoggedOut();
    } finally {
      setResuming(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="idle-modal-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-[0_24px_60px_-30px_rgba(12,31,26,0.45)]"
      >
        <div className="flex flex-col items-center text-center">
          <Timer className="h-10 w-10 text-amber-ink" aria-hidden="true" />
          <h2
            id="idle-modal-title"
            className="mt-4 font-display text-xl font-semibold text-ink"
          >
            Sesi akan berakhir
          </h2>
          <p className="mt-2 text-sm text-muted">
            Kamu diam sebentar. Lanjutkan sesi biar gak ke-logout?
          </p>
          <p className="mt-3 font-mono text-xs text-muted">
            Otomatis logout dalam {remaining} detik
          </p>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={setLoggedOut}
            disabled={resuming}
            className="flex-1 rounded-lg border border-line bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss disabled:opacity-50"
          >
            Keluar
          </button>
          <button
            ref={continueButtonRef}
            type="button"
            onClick={handleResume}
            disabled={resuming}
            className="flex-1 rounded-lg bg-moss px-4 py-2.5 text-sm font-medium text-card transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss disabled:opacity-50"
          >
            {resuming ? 'Memuat...' : 'Lanjutkan'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
