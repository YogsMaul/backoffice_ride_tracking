import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { User, Mail, Shield, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { UserFormPayload, UserRow, UserUpdatePayload } from '../lib/api';

interface UserFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: UserRow | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (data: UserFormPayload | UserUpdatePayload) => Promise<void>;
}

function passwordIssues(pw: string): string[] {
  const issues: string[] = [];
  if (pw.length < 8) issues.push('minimal 8 karakter');
  if (!/[A-Z]/.test(pw)) issues.push('huruf besar');
  if (!/[a-z]/.test(pw)) issues.push('huruf kecil');
  if (!/\d/.test(pw)) issues.push('angka');
  return issues;
}

export default function UserFormModal({
  open,
  mode,
  initial,
  loading = false,
  error = null,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setEmail(initial?.email ?? '');
      setRole((initial?.role as 'user' | 'admin') ?? 'user');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirm(false);
      setLocalError(null);
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  const isCreate = mode === 'create';
  const pwIssues = isCreate ? passwordIssues(password) : [];
  const pwValid = !isCreate || pwIssues.length === 0;
  const confirmMatch = !isCreate || password === confirmPassword;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const nameValid = name.trim().length > 0 && name.trim().length <= 100;

  const canSubmit =
    !loading &&
    nameValid &&
    emailValid &&
    pwValid &&
    confirmMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLocalError(null);

    try {
      if (isCreate) {
        await onSubmit({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          password,
        });
      } else {
        // Edit: kirim hanya yang berubah
        const payload: UserUpdatePayload = {};
        if (name.trim() !== (initial?.name ?? '')) payload.name = name.trim();
        if (email.trim().toLowerCase() !== (initial?.email ?? '').toLowerCase()) {
          payload.email = email.trim().toLowerCase();
        }
        if (role !== (initial?.role ?? 'user')) payload.role = role;

        if (Object.keys(payload).length === 0) {
          setLocalError('Tidak ada perubahan untuk disimpan.');
          return;
        }
        await onSubmit(payload);
      }
    } catch (err: any) {
      setLocalError(err?.response?.data?.error || err?.message || 'Gagal menyimpan.');
    }
  };

  const activeError = localError || error;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-form-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        onClick={loading ? undefined : onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-card p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-moss-soft text-moss">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 id="user-form-title" className="font-display text-lg font-semibold text-ink">
              {isCreate ? 'Tambah User' : 'Edit User'}
            </h2>
            <p className="text-xs text-muted">
              {isCreate
                ? 'Buat akun user baru untuk akses mobile app atau backoffice.'
                : 'Ubah informasi profil atau role user.'}
            </p>
          </div>
        </div>

        {activeError && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-warn-line bg-warn-fill p-3 text-xs text-warn-ink">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{activeError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Nama */}
          <div>
            <label className="block text-xs font-medium text-muted">
              Nama lengkap <span className="text-warn-ink">*</span>
            </label>
            <div className="relative mt-1">
              <input
                ref={firstInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="mis. Budi Santoso"
                maxLength={100}
                disabled={loading}
                className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-moss"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-muted">
              Email <span className="text-warn-ink">*</span>
            </label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                disabled={loading}
                className="w-full rounded-lg border border-line bg-paper py-2 pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-moss"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-muted">Role</label>
            <div className="relative mt-1">
              <Shield className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted/60" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                disabled={loading}
                className="w-full appearance-none rounded-lg border border-line bg-paper py-2 pl-9 pr-8 text-sm text-ink outline-none transition-colors focus:border-moss"
              >
                <option value="user">User (mobile rider)</option>
                <option value="admin">Admin (backoffice access)</option>
              </select>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Role admin punya akses ke seluruh fitur backoffice.
            </p>
          </div>

          {/* Password (hanya create) */}
          {isCreate && (
            <>
              <div>
                <label className="block text-xs font-medium text-muted">
                  Password <span className="text-warn-ink">*</span>
                </label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 karakter"
                    disabled={loading}
                    className="w-full rounded-lg border border-line bg-paper py-2 pl-9 pr-9 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-moss"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-2 top-2 p-1 text-muted hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password.length > 0 && pwIssues.length > 0 && (
                  <p className="mt-1 text-[11px] text-warn-ink">
                    Kurang: {pwIssues.join(', ')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted">
                  Konfirmasi password <span className="text-warn-ink">*</span>
                </label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted/60" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password"
                    disabled={loading}
                    className="w-full rounded-lg border border-line bg-paper py-2 pl-9 pr-9 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-moss"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                    className="absolute right-2 top-2 p-1 text-muted hover:text-ink"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && !confirmMatch && (
                  <p className="mt-1 text-[11px] text-warn-ink">Password tidak cocok.</p>
                )}
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-line px-3.5 py-1.5 text-xs font-medium text-muted hover:bg-paper hover:text-ink disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg bg-moss px-3.5 py-1.5 text-xs font-medium text-card shadow-sm hover:bg-moss/90 disabled:opacity-50"
            >
              {loading ? 'Menyimpan…' : isCreate ? 'Tambah user' : 'Simpan perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
