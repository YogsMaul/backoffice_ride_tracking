import { useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Sun, Moon, ChevronDown, LogOut, Menu, User as UserIcon, X, ChevronsLeft, ChevronsRight, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from './ConfirmModal';
import ChangePasswordModal from './ChangePasswordModal';
import EditProfileModal from './EditProfileModal';
import { useSnackbar } from './Snackbar';

interface MeResponse {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface TopBarProps {
  sidebarOpen?: boolean;
  onMenuToggle?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function TopBar({ sidebarOpen = false, onMenuToggle, collapsed = false, onToggleCollapse }: TopBarProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('admin_theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [pwSuccessMessage, setPwSuccessMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!pwSuccessMessage) return;
    const t = setTimeout(() => setPwSuccessMessage(null), 3000);
    return () => clearTimeout(t);
  }, [pwSuccessMessage]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await authAPI.me()).data as MeResponse,
    retry: false,
  });

  const user = data;
  const displayName = user?.name || user?.email?.split('@')[0] || 'Admin';
  const initials = (user?.name?.[0] || user?.email?.[0] || 'A').toUpperCase();

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = (prev: 'light' | 'dark') => (prev === 'light' ? 'dark' : 'light');

    // Fallback: browser tanpa View Transitions API, atau user minta
    // reduced motion — langsung swap, tanpa animasi.
    if (
      typeof document.startViewTransition !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setTheme(next);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = document.startViewTransition(() => {
      setTheme(next);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 650,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    });
  };

  const { setLoggedOut } = useAuth();
  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await authAPI.logout();
    } catch {
    } finally {
      // Pakai AuthContext biar App.tsx juga denger & redirect halus (no full reload).
      setLoggedOut();
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className={`fixed top-0 right-0 z-20 h-16 bg-card/90 backdrop-blur border-b border-line flex items-center justify-between px-4 sm:px-6 transition-all duration-300 md:rounded-l-2xl ${
      collapsed ? 'md:left-[4.5rem]' : 'md:left-[17rem]'
    } left-0`}>
      <div className="flex items-center gap-2">
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:bg-paper hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-moss"
          >
            {collapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
          </button>
        )}
        {onMenuToggle && (
          <button
            type="button"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
            onClick={onMenuToggle}
            className="md:hidden p-2 -ml-2 rounded-lg text-ink hover:bg-paper transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-moss"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
        <div className="flex items-center gap-2 ml-1" aria-hidden="true">
          <span className="block w-2 h-2 rounded-full bg-moss" />
          <span className="block h-0.5 w-5 bg-moss rounded-full" />
        </div>
        <h2 className="hidden sm:block text-sm font-semibold text-ink">Ride Tracking</h2>
        <span className="hidden md:inline-flex items-center px-2 py-0.5 text-xs font-medium text-moss bg-moss-soft rounded-full">
          Panel Admin
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          role="switch"
          aria-checked={theme === 'dark'}
          aria-label={theme === 'light' ? 'Aktifkan mode gelap' : 'Aktifkan mode terang'}
          className={`group relative inline-flex h-7 w-[3.25rem] items-center rounded-full border border-line/80 shadow-inner transition-colors duration-[450ms] ease-out hover:border-line focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-1 active:scale-[0.97] ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-moss/90 to-moss shadow-moss/20'
              : 'bg-gradient-to-r from-paper to-paper'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none relative inline-flex h-5 w-5 items-center justify-center rounded-full shadow-md ring-1 ring-line/60 transition-[transform,background-color,box-shadow] duration-[450ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105 ${
              theme === 'dark'
                ? 'translate-x-[1.375rem] bg-card text-moss'
                : 'translate-x-[3px] bg-card text-amber-ink'
            }`}
          >
            <Sun
              className={`absolute h-3 w-3 transition-all duration-[450ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
              }`}
            />
            <Moon
              className={`absolute h-3 w-3 transition-all duration-[450ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
              }`}
            />
          </span>
        </button>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label="Notifikasi"
            aria-expanded={notifOpen}
            className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-muted hover:bg-paper hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-moss"
          >
            <Bell className="w-5 h-5" />
          </button>
          {notifOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] rounded-xl border border-line bg-card shadow-xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-line">
                <p className="text-sm font-semibold text-ink">Notifikasi</p>
              </div>
              <ul className="max-h-80 overflow-y-auto divide-y divide-line">
                <li className="px-4 py-3">
                  <p className="text-sm text-ink font-medium">Belum ada notifikasi baru</p>
                  <p className="text-xs text-muted mt-1">
                    Pemberitahuan akan muncul di sini saat ada aktivitas penting.
                  </p>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Menu pengguna"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-paper transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-moss"
          >
            <span className="w-8 h-8 rounded-full bg-moss text-card text-sm font-semibold inline-flex items-center justify-center" aria-hidden="true">
              {initials}
            </span>
            <span className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-medium text-ink max-w-[10rem] truncate">{displayName}</span>
              <span className="text-xs text-muted max-w-[10rem] truncate">{user?.email || 'admin'}</span>
            </span>
            <ChevronDown className="w-4 h-4 text-muted hidden sm:block" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1rem)] rounded-xl border border-line bg-card shadow-xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-line">
                <p className="text-sm font-semibold text-ink truncate">{displayName}</p>
                <p className="text-xs text-muted truncate">{user?.email || 'admin'}</p>
                <p className="text-xs text-moss mt-1 font-medium uppercase tracking-wide">{user?.role || 'admin'}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setShowEditProfileModal(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-paper transition-colors focus:outline-none focus-visible:bg-paper"
              >
                <UserIcon className="w-4 h-4" />
                Profil Saya
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setShowChangePasswordModal(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-paper transition-colors focus:outline-none focus-visible:bg-paper"
              >
                <KeyRound className="w-4 h-4" />
                Ubah Password
              </button>
              <div className="border-t border-line" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-warn-ink hover:bg-warn-fill transition-colors focus:outline-none focus-visible:bg-warn-fill"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari panel admin?"
        confirmText="Keluar"
        cancelText="Batal"
        loading={loggingOut}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
      <ChangePasswordModal
        open={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => setPwSuccessMessage('Password berhasil diubah.')}
      />
      <EditProfileModal
        open={showEditProfileModal}
        me={user}
        onClose={() => setShowEditProfileModal(false)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['me'] });
          queryClient.invalidateQueries({ queryKey: ['users'] });
          snackbar.success('Profil berhasil diperbarui.');
        }}
      />
      {pwSuccessMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-moss text-card shadow-xl text-sm font-medium"
        >
          {pwSuccessMessage}
        </div>
      )}
    </header>
  );
}
