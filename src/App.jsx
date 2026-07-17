import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAppState } from './AppState';
import SiteLayout from './components/SiteLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import TopUpPage from './pages/TopUpPage';

function ProtectedRoute() {
  const { access } = useAppState();
  const location = useLocation();

  if (!access.loggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function GuestRoute() {
  const { access } = useAppState();

  if (access.loggedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/top-up" element={<TopUpPage />} />
        </Route>

        <Route element={<GuestRoute />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
