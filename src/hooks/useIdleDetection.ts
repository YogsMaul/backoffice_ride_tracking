import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll'] as const;

//   grace       = 2 menit — silent, gak ngapa-ngapain
//   warnAfter   = 5 menit — munculin modal konfirmasi
//   hardLogout  = 10 menit — auto-logout
const GRACE_MS = 2 * 60 * 1000;
const WARN_AFTER_MS = 5 * 60 * 1000;
const HARD_LOGOUT_MS = 10 * 60 * 1000;

/**
 * Pasang di root app. Track aktivitas user + visibility.
 * - Tab refocus + idle > WARN_AFTER_MS  → status = idleWarning
 * - Tab refocus + idle > HARD_LOGOUT_MS → langsung logout
 * - User melakukan aktivitas           → reset timer
 *
 * Catatan: hook ini cuma update AuthContext. UI modal di-handle
 * komponen lain (lihat IdleSessionModal) yang listen ke status.
 */
export function useIdleDetection() {
  const { setIdleWarning, setLoggedOut, status } = useAuth();
  // Pakai ref supaya event listener gak di-re-add tiap render.
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (status !== 'loggedIn') return;

    const onActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const idle = Date.now() - lastActivityRef.current;
      if (idle >= HARD_LOGOUT_MS) {
        setLoggedOut();
      } else if (idle >= WARN_AFTER_MS) {
        setIdleWarning();
      }
      // idle < WARN_AFTER = silent, gak ngapa-ngapain.
    };

    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, onActivity, { passive: true })
    );
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [status, setIdleWarning, setLoggedOut]);

  // Expose constants kalau UI perlu (mis. countdown modal).
  return {
    GRACE_MS,
    WARN_AFTER_MS,
    HARD_LOGOUT_MS,
  };
}
