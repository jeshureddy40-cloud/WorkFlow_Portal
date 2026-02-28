import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import LoginPage from '../pages/LoginPage';
import ManagerDashboard from '../pages/ManagerDashboard';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import ProfilePage from '../pages/ProfilePage';
import AnalyticsPage from '../pages/AnalyticsPage';

function AppRoutes() {
  const { state } = useAppContext();
  const isLoggedIn = state.session.loggedIn;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          isLoggedIn ? (
            state.session.role === 'Manager' ? (
              <ManagerDashboard />
            ) : (
              <EmployeeDashboard />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/analytics"
        element={isLoggedIn ? <AnalyticsPage /> : <Navigate to="/login" replace />}
      />
      <Route path="/" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default AppRoutes;
