import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { authApi } from './api';
import { useAuthStore } from './store/auth.store';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MatchesPage from './pages/MatchesPage';
import RankingsPage from './pages/RankingsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, isAdmin } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppContent() {
  const { token, setAuth, user, logout } = useAuthStore();
  const [verifying, setVerifying] = useState(!!token && !user);

  useEffect(() => {
    if (token && !user) {
      setVerifying(true);
      authApi.me()
        .then(u => setAuth(u, token))
        .catch(() => logout())
        .finally(() => setVerifying(false));
    }
  }, [token]);

  if (verifying) {
    return <div style={{ minHeight: '100vh', background: '#0c1527' }} />;
  }

  return (
    <BrowserRouter>
      {token && user && <Navbar />}
      <main className={token && user ? 'main-with-nav' : ''}>
        <Routes>
          <Route path="/login" element={token && user ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/register" element={token && user ? <Navigate to="/" replace /> : <RegisterPage />} />
          <Route path="/" element={token && user ? <HomePage /> : <LandingPage />} />
          <Route path="/matches" element={<PrivateRoute><MatchesPage /></PrivateRoute>} />
          <Route path="/rankings" element={<PrivateRoute><RankingsPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AppContent />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
