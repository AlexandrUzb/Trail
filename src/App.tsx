import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import SearchPage from './pages/SearchPage';
import TemplatesPage from './pages/TemplatesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages that should NOT have Navbar/Footer
const NO_LAYOUT_PAGES = ['/login', '/register', '/admin'];

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const location = useLocation();
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function PublicOnlyRoute({ children }: { children: React.ReactElement }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/chat" replace />;
  }
  return children;
}

function Layout() {
  const location = useLocation();
  const noLayout = NO_LAYOUT_PAGES.includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      {!noLayout && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          {/* Redirect all legacy pricing and payment routes to home */}
          <Route path="/pricing" element={<Navigate to="/" replace />} />
          <Route path="/prices" element={<Navigate to="/" replace />} />
          <Route path="/payment" element={<Navigate to="/" replace />} />
          <Route path="/transactions" element={<Navigate to="/" replace />} />
          <Route path="/plans" element={<Navigate to="/" replace />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!noLayout && <Footer />}
    </>
  );
}

export default function App() {
  const base = import.meta.env.BASE_URL || '/';
  // Avoid relative './' or '/./' from viteSingleFile breaking React Router matching on root URLs
  const routerBasename = (base === './' || base === '/./' || base === '.' || base === '/') 
    ? undefined 
    : base.replace(/\/+$/, '');

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router basename={routerBasename}>
          <Layout />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
