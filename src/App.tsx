import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ActiveRides from './pages/ActiveRides';
import Users from './pages/Users';
import RideHistory from './pages/RideHistory';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password/otp" element={<VerifyOTP />} />
      <Route path="/forgot-password/reset" element={<ResetPassword />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="active-rides" element={<ActiveRides />} />
        <Route path="users" element={<Users />} />
        <Route path="ride-history" element={<RideHistory />} />
      </Route>
    </Routes>
  );
}

export default App;
