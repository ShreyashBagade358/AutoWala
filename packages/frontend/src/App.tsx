import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import HomePage from './pages/Home/HomePage';
import BookingPage from './pages/Booking/BookingPage';
import RideStatusPage from './pages/RideStatus/RideStatusPage';
import DriverHomePage from './pages/DriverHome/DriverHomePage';
import DriverAcceptPage from './pages/DriverAccept/DriverAcceptPage';
import LoginPage from './pages/Login/LoginPage';
import OnboardingPage from './pages/Onboarding/OnboardingPage';
import NameEntryPage from './pages/NameEntry/NameEntryPage';

function PrivateRoute({ children, driverOnly = false }: { children: React.ReactNode; driverOnly?: boolean }) {
  const { user, driver, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (driverOnly) {
    return driver ? <>{children}</> : <Navigate to="/driver/login" replace state={{ from: location }} />;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace state={{ from: location }} />;
}

export default function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/name" element={<NameEntryPage />} />
      <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/booking/:rideId?" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
      <Route path="/ride/:rideId" element={<PrivateRoute><RideStatusPage /></PrivateRoute>} />
      <Route path="/driver/login" element={<LoginPage isDriver />} />
      <Route path="/driver" element={<PrivateRoute driverOnly><DriverHomePage /></PrivateRoute>} />
      <Route path="/driver/ride/:rideId" element={<PrivateRoute driverOnly><DriverAcceptPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
  );
}
