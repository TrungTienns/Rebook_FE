import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import './App.css';
import { path } from './common/path';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ── Lazy-loaded pages (code splitting) ──────────────────────────────────────
const HomePage           = lazy(() => import('./pages/HomePage/HomePage'));
const ExplorePage        = lazy(() => import('./pages/ExplorePage/ExplorePage'));
const SignInPage         = lazy(() => import('./pages/SignInPage/SignInPage'));
const SignUpPage         = lazy(() => import('./pages/SignUpPage/SignUpPage'));
const BookDetailPage     = lazy(() => import('./pages/BookDetailPage/BookDetailPage'));
const PdfReaderPage      = lazy(() => import('./pages/PdfReaderPage/PdfReaderPage'));
const AdminPage          = lazy(() => import('./pages/AdminPage/AdminPage'));
const Dashboard          = lazy(() => import('./pages/AdminPage/Dashboard/Dashboard'));
const UploadBook         = lazy(() => import('./pages/AdminPage/Upload/UploadBook'));
const CategoryManagement = lazy(() => import('./pages/AdminPage/Categories/CategoryManagement'));
const UserManagement     = lazy(() => import('./pages/AdminPage/Users/User'));
const CommentManagement  = lazy(() => import('./pages/AdminPage/Comments/CommentManagement'));
const RatingManagement   = lazy(() => import('./pages/AdminPage/Ratings/RatingManagement'));
const ChapterManagement  = lazy(() => import('./pages/AdminPage/Chapters/ChapterManagement'));
const LibraryPage        = lazy(() => import('./pages/LibraryPage/LibraryPage'));

// ── Page loading fallback ────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', fontFamily: "'Fredoka', sans-serif", fontSize: '1.2rem',
      fontWeight: 700, gap: '0.5rem',
    }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ color: '#ffd700' }} />
      Đang tải...
    </div>
  );
}

// ── Protected Route for Admin ────────────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || user.role !== 'admin') return <Navigate to={path.HOME} replace />;
  return children;
};

// ── Scroll to Top on Route Change ────────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Lenis handles scrolling, so we must tell Lenis to scroll to top
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    }
    // Fallback for native scroll
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also try again after a small delay for heavy layouts
    const timer = setTimeout(() => {
      if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    }, 150);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });
    
    window.lenis = lenis; // Expose globally for scroll restoration

    let rafId;

    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    // Pause Lenis when tab is hidden to save CPU on low-end devices
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(raf);
      }
    }

    rafId = requestAnimationFrame(raf);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="App">
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path={path.HOME}        element={<HomePage />} />
          <Route path={path.EXPLORE}     element={<ExplorePage />} />
          <Route path={path.SIGN_IN}     element={<SignInPage />} />
          <Route path={path.SIGN_UP}     element={<SignUpPage />} />
          <Route path={path.BOOK_DETAIL} element={<BookDetailPage />} />
          <Route path={path.BOOK_READ}   element={<PdfReaderPage />} />
          <Route path={path.MY_LIBRARY}  element={<LibraryPage />} />

          {/* Admin Routes */}
          <Route path={path.ADMIN} element={
            <AdminRoute><AdminPage /></AdminRoute>
          }>
            <Route index element={<Navigate to={path.ADMIN_DASHBOARD} replace />} />
            <Route path="dashboard"  element={<Dashboard />} />
            <Route path="users"      element={<UserManagement />} />
            <Route path="books"      element={<UploadBook />} />
            <Route path="chapters"   element={<ChapterManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="comments"   element={<CommentManagement />} />
            <Route path="ratings"    element={<RatingManagement />} />
          </Route>
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App;
