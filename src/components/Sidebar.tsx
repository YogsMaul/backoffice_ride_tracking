import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Radio, Users, History, LogOut, X } from 'lucide-react';
import { useState } from 'react';
import { authAPI } from '../lib/api';
import ConfirmModal from './ConfirmModal';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ collapsed = false, open = false, onClose }: SidebarProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
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

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/active-rides', icon: Radio, label: 'Active Rides' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/ride-history', icon: History, label: 'Ride History' },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 group ${
      isActive
        ? 'bg-moss-soft text-moss font-medium shadow-sm'
        : 'text-ink hover:bg-paper hover:translate-x-0.5'
    }`;

  return (
    <>
      {/* Scrim when mobile menu is open */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-ink/30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="primary-nav"
        className={`fixed top-16 md:top-0 left-0 bottom-0 z-40 ${
          collapsed ? 'md:w-16' : 'md:w-64'
        } w-64 bg-card/95 backdrop-blur border-r border-line md:rounded-r-2xl flex flex-col transform transition-all duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Mobile-only close row */}
        <div className="flex items-center justify-between p-4 border-b border-line md:hidden">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="block w-2 h-2 rounded-full bg-moss" />
            <span className="block h-0.5 w-5 bg-moss rounded-full" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 -mr-2 rounded-lg text-ink hover:bg-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-moss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop brand header */}
        <div className={`hidden md:block border-b border-line bg-moss-soft ${collapsed ? 'p-3' : 'p-5'}`}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2" aria-hidden="true">
              <span className="block w-2 h-2 rounded-full bg-moss" />
              <span className="block h-0.5 w-5 bg-moss rounded-full" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2" aria-hidden="true">
                <span className="block w-2 h-2 rounded-full bg-moss" />
                <span className="block h-0.5 w-5 bg-moss rounded-full" />
              </div>
              <h1 className="text-lg font-bold text-ink">Ride Tracking</h1>
              <p className="text-xs text-muted">Admin Dashboard</p>
            </>
          )}
        </div>

        {/* Collapse toggle (desktop) moved to TopBar */}

        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={linkClass}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-line">
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg text-ink hover:bg-warn-fill hover:text-warn-ink transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

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
    </>
  );
}
