import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from '@/pages/dashboard';
import LoginPage from '@/pages/login';
import MeetingRoom from '@/pages/meeting-room';
import { ProtectedRoute, ProtectedAuth } from './ProtectedRoutes';
import RegisterPage from '@/pages/register';

function MeetingAppRoute() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <ProtectedAuth>
              <LoginPage />
            </ProtectedAuth>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedAuth>
              <RegisterPage />
            </ProtectedAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/room/:room_code"
          element={
            <ProtectedRoute>
              <MeetingRoom />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div className="flex items-center justify-center text-5xl h-screen">Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default MeetingAppRoute;
