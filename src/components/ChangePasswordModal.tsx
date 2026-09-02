import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { authAPI } from '../lib/api';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Syarat password sama dengan middleware.IsStrongPassword di backend
// (backend/internal/middleware/validate.go:19).
function passwordIssues(pw: string): string[] {
  const issues: string[] = [];
  if (pw.length < 8) issues.push('minimal 8 karakter');
  if (!/[A-Z]/.test(pw)) issues.push('huruf besar');
  if (!/[a-z]/.test(pw)) issues.push('huruf kecil');
  if (!/\d/.test(pw)) issues.push('angka');
  return issues;
}

export default function ChangePasswordModal({ open, onClose, onSuccess }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
      // Delay focus biar transition modal keburu selesai
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  const newPwIssues = passwordIssues(newPassword);
  const newPwValid = newPwIssues.length === 0;
  const confirmMatch = newPassword === confirmPassword;
  const canSubmit =
    !loading &&
    oldPassword.length > 0 &&
    newPwValid &&
    confirmMatch &&
    oldPassword !== newPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      await authAPI.changePassword(oldPassword, newPassword);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Gagal mengubah password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Portal ke document.body supaya fixed positioning mengacu ke viewport,
  // bukan ke stacking context parent (header TopBar yang fixed z-20).
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-pw-title"
        className="relative w-full max-w-md rounded-2xl border border-line bg-card shadow-xl p-6"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-moss-soft flex items-center justify-center flex-shrink-0">
            <KeyRound className="w-5 h-5 text-moss" aria-hidden="true" />
          </div>
          <div>
            <h2 id="change-pw-title" className="text-lg font-semibold text-ink">
              Ubah Password
            </h2>
            <p className="text-sm text-muted mt-1">
              Masukkan password lama dan password baru kamu.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="old-pw" className="block text-sm font-medium text-ink mb-1.5">
              Password Lama
            </label>
            <div className="relative">
              <input
                ref={firstInputRef}
                id="old-pw"
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                className="w-full px-3 py-2 pr-10 rounded-lg border border-line bg-paper text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-moss disabled:opacity-50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowOld((v) => !v)}
                tabIndex={-1}
                aria-label={showOld ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="new-pw" className="block text-sm font-medium text-ink mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <input
                id="new-pw"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                className="w-full px-3 py-2 pr-10 rounded-lg border border-line bg-paper text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-moss disabled:opacity-50"
                placeholder="Minimal 8 karakter, ada huruf besar, kecil, dan angka"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                tabIndex={-1}
                aria-label={showNew ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword.length > 0 && !newPwValid && (
              <p className="text-xs text-warn-ink mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Belum lengkap: {newPwIssues.join(', ')}.
              </p>
            )}
            {newPwValid && newPassword !== oldPassword && (
              <p className="text-xs text-moss mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Password baru memenuhi syarat.
              </p>
            )}
            {newPassword.length > 0 && newPassword === oldPassword && (
              <p className="text-xs text-warn-ink mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Password baru harus berbeda dari yang lama.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirm-pw" className="block text-sm font-medium text-ink mb-1.5">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                id="confirm-pw"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                className="w-full px-3 py-2 pr-10 rounded-lg border border-line bg-paper text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-moss disabled:opacity-50"
                placeholder="Ketik ulang password baru"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
                aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && !confirmMatch && (
              <p className="text-xs text-warn-ink mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Konfirmasi tidak cocok.
              </p>
            )}
            {confirmMatch && newPassword.length > 0 && (
              <p className="text-xs text-moss mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Cocok.
              </p>
            )}
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-warn-fill border border-warn-line">
              <AlertCircle className="w-4 h-4 text-warn-ink flex-shrink-0 mt-0.5" />
              <p className="text-sm text-warn-ink">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-ink bg-card border border-line rounded-lg hover:bg-paper transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-moss disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 text-sm font-medium text-card bg-moss hover:opacity-90 rounded-lg transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-moss disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
