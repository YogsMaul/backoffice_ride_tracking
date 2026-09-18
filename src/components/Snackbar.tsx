import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export type SnackbarVariant = 'success' | 'error' | 'info';

interface SnackbarMessage {
  id: number;
  text: string;
  variant: SnackbarVariant;
  duration: number;
}

interface SnackbarContextValue {
  show: (text: string, variant?: SnackbarVariant, durationMs?: number) => void;
  success: (text: string, durationMs?: number) => void;
  error: (text: string, durationMs?: number) => void;
  info: (text: string, durationMs?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

const ICONS: Record<SnackbarVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES: Record<SnackbarVariant, string> = {
  success: 'border-moss-line bg-moss text-card',
  error: 'border-warn-line bg-warn-fill text-warn-ink',
  info: 'border-line bg-card text-ink',
};

const ICON_COLOR: Record<SnackbarVariant, string> = {
  success: 'text-card',
  error: 'text-warn-ink',
  info: 'text-moss',
};

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SnackbarMessage[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const show = useCallback(
    (text: string, variant: SnackbarVariant = 'info', durationMs = 3000) => {
      // Id monotonic — cukup pake Date.now + counter sederhana.
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, text, variant, duration: durationMs }]);
    },
    [],
  );

  useEffect(() => {
    if (items.length === 0) return;
    const timers = items.map((it) =>
      window.setTimeout(() => remove(it.id), it.duration),
    );
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [items, remove]);

  const value: SnackbarContextValue = {
    show,
    success: (t, d) => show(t, 'success', d),
    error: (t, d) => show(t, 'error', d),
    info: (t, d) => show(t, 'info', d),
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          aria-atomic="true"
          className="pointer-events-none fixed right-4 top-20 z-[200] flex flex-col gap-2 sm:right-6"
        >
          {items.map((it) => {
            const Icon = ICONS[it.variant];
            return (
              <div
                key={it.id}
                role="status"
                className={`pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_18px_40px_-20px_rgba(12,31,26,0.45)] snackbar-enter ${STYLES[it.variant]}`}
              >
                <Icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${ICON_COLOR[it.variant]}`}
                  aria-hidden="true"
                />
                <p className="text-sm font-medium">{it.text}</p>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used inside SnackbarProvider');
  return ctx;
}
