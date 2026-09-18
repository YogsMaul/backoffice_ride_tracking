import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { User, Mail, Shield, Fingerprint, Copy, Check, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { usersAPI, type UserUpdatePayload } from '../lib/api';

interface MeResponse {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface EditProfileModalProps {
  open: boolean;
  me: MeResponse | null | undefined;
  onClose: () => void;
  onSaved: () => void;
}

function extractError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: string } }; message?: string };
  return e?.response?.data?.error || e?.message || fallback;
}

export default function EditProfileModal({ open, me, onClose, onSaved }: EditProfileModalProps) {
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(me?.name ?? '');
      setLocalError(null);
      setCopied(false);
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open, me]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !mut.isPending) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  const mut = useMutation({
    mutationFn: (payload: UserUpdatePayload) =>
      usersAPI.update(me!.id, payload).then((r) => r.data),
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: (err) => {
      setLocalError(extractError(err, 'Gagal menyimpan profil.'));
    },
  });

  if (!open || !me) return null;

  const initial = me.name ?? '';
  const trimmed = name.trim();
  const dirty = trimmed !== initial;
  const nameValid = trimmed.length > 0 && trimmed.length <= 100;
  const canSubmit = !mut.isPending && dirty && nameValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLocalError(null);
    try {
      await mut.mutateAsync({ name: trimmed });
    } catch (err) {
      setLocalError(extractError(err, 'Gagal menyimpan profil.'));
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(me.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API kadang ditolak (insecure context). Gak apa-apa — silent.
    }
  };

  const activeError = localError || (mut.isError ? extractError(mut.error, 'Gagal menyimpan profil.') : null);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        onClick={mut.isPending ? undefined : onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-card p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-moss-soft text-moss">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 id="edit-profile-title" className="font-display text-lg font-semibold text-ink">
              Edit Profil
            </h2>
            <p className="text-xs text-muted">Ubah nama tampilan kamu. Email & role dikunci.</p>
          </div>
        </div>

        {activeError && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-warn-line bg-warn-fill p-3 text-xs text-warn-ink">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{activeError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Nama — editable */}
          <div>
            <label className="block text-xs font-medium text-muted">
              Nama lengkap <span className="text-warn-ink">*</span>
            </label>
            <div className="relative mt-1">
              <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted/60" />
              <input
                ref={firstInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                maxLength={100}
                disabled={mut.isPending}
                className="w-full rounded-lg border border-line bg-paper py-2 pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-moss"
              />
            </div>
          </div>

          {/* Email — read-only */}
          <div>
            <label className="block text-xs font-medium text-muted">Email</label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted/60" />
              <input
                type="email"
                value={me.email}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-line bg-paper py-2 pl-9 pr-3 text-sm text-muted"
              />
            </div>
            <p className="mt-1 text-[11px] text-muted">Email login tidak dapat diubah.</p>
          </div>

          {/* Role — read-only */}
          <div>
            <label className="block text-xs font-medium text-muted">Role</label>
            <div className="relative mt-1">
              <Shield className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted/60" />
              <input
                type="text"
                value={me.role || 'admin'}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-line bg-paper py-2 pl-9 pr-3 text-sm capitalize text-muted"
              />
            </div>
          </div>

          {/* User ID — read-only + copy */}
          <div>
            <label className="block text-xs font-medium text-muted">User ID</label>
            <div className="relative mt-1">
              <Fingerprint className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted/60" />
              <input
                type="text"
                value={me.id}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
                className="w-full cursor-not-allowed rounded-lg border border-line bg-paper py-2 pl-9 pr-20 font-mono text-xs text-muted"
              />
              <button
                type="button"
                onClick={copyId}
                tabIndex={-1}
                aria-label="Copy user ID"
                className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted hover:bg-paper hover:text-ink"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Salin
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={mut.isPending}
              className="rounded-lg border border-line px-3.5 py-1.5 text-xs font-medium text-muted hover:bg-paper hover:text-ink disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg bg-moss px-3.5 py-1.5 text-xs font-medium text-card shadow-sm hover:bg-moss/90 disabled:opacity-50"
            >
              {mut.isPending ? 'Menyimpan…' : 'Simpan perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
