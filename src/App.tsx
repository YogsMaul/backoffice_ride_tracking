import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IdleSessionModal from './components/IdleSessionModal';
import { setOnAuthExpired } from './lib/api';
import { useAuth } from './contexts/AuthContext';
import { useIdleDetection } from './hooks/useIdleDetection';

const ActiveRides = lazy(() => import('./pages/ActiveRides'));
const Users = lazy(() => import('./pages/Users'));
const RideHistory = lazy(() => import('./pages/RideHistory'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/forgot-password/otp',
  '/forgot-password/reset',
];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loggedOut' && !PUBLIC_PATHS.includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  const { status, setLoggedOut } = useAuth();
  const navigate = useNavigate();

  // Pasang callback: refresh gagal → logout + redirect.
  useEffect(() => {
    setOnAuthExpired(() => {
      setLoggedOut();
      navigate('/login', { replace: true });
    });
  }, [setLoggedOut, navigate]);

  // Track idle. Hook ini cuma update AuthContext; modal di-render di bawah.
  useIdleDetection();

  return (
    <>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-paper"><div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div></div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot-password/otp" element={<VerifyOTP />} />
          <Route path="/forgot-password/reset" element={<ResetPassword />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="active-rides" element={<ActiveRides />} />
            <Route path="users" element={<Users />} />
            <Route path="ride-history" element={<RideHistory />} />
          </Route>
        </Routes>
      </Suspense>
      {status === 'idleWarning' && <IdleSessionModal />}
    </>
  );
}

export default App;
