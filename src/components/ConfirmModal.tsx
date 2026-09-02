import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LogOut } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmButtonRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        className="relative w-full max-w-sm rounded-2xl border border-white/40 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/85 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center flex-shrink-0 ring-1 ring-red-100 dark:ring-red-900/50">
            <LogOut className="w-5 h-5 text-red-700 dark:text-red-400" aria-hidden="true" />
          </div>
          <div>
            <h2 id="confirm-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p id="confirm-modal-message" className="text-sm text-gray-600 dark:text-slate-300 mt-1">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 bg-white/70 dark:bg-slate-800/60 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900 disabled:opacity-50"
          >
            {loading ? 'Logging out...' : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
