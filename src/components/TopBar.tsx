import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Sun, Moon, ChevronDown, LogOut, Menu, User as UserIcon, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import ConfirmModal from './ConfirmModal';

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
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await authAPI.logout();
    } catch {
    } finally {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
  };

  return (
    <header className={`fixed top-0 right-0 z-20 h-16 bg-white/90 dark:bg-slate-950/85 backdrop-blur border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 md:rounded-l-2xl ${
      collapsed ? 'md:left-[4.5rem]' : 'md:left-[17rem]'
    } left-0`}>
      <div className="flex items-center gap-2">
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
            className="md:hidden p-2 -ml-2 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
        <div className="flex items-center gap-2 ml-1" aria-hidden="true">
          <span className="block w-2 h-2 rounded-full bg-blue-600" />
          <span className="block w-2 h-2 rounded-full bg-violet-600" />
          <span className="block h-0.5 w-5 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full" />
        </div>
        <h2 className="hidden sm:block text-sm font-semibold text-gray-800 dark:text-slate-100">Ride Tracking</h2>
        <span className="hidden md:inline-flex items-center px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 rounded-full">
          Admin
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Bell className="w-5 h-5" />
          </button>
          {notifOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Notifications</p>
              </div>
              <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
                <li className="px-4 py-3">
                  <p className="text-sm text-gray-900 dark:text-slate-100 font-medium">No new notifications</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">We will alert you when something important happens.</p>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="User menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white text-sm font-semibold inline-flex items-center justify-center" aria-hidden="true">
              {initials}
            </span>
            <span className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-medium text-gray-900 dark:text-slate-100 max-w-[10rem] truncate">{displayName}</span>
              <span className="text-xs text-gray-500 dark:text-slate-400 max-w-[10rem] truncate">{user?.email || 'admin'}</span>
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400 hidden sm:block" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1rem)] rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user?.email || 'admin'}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 font-medium uppercase tracking-wide">{user?.role || 'admin'}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:bg-gray-50 dark:focus-visible:bg-slate-800"
              >
                <UserIcon className="w-4 h-4" />
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors focus:outline-none focus-visible:bg-red-50 dark:focus-visible:bg-red-950"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari dashboard?"
        confirmText="Logout"
        cancelText="Batal"
        loading={loggingOut}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </header>
  );
}
