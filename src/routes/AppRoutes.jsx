import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { path } from '../common/path';
import { useAuth } from '../context/AuthContext';

// ── Lazy-loaded pages (code splitting) ──────────────────────────────────────
const HomePage           = lazy(() => import('../pages/HomePage/HomePage'));
const ExplorePage        = lazy(() => import('../pages/ExplorePage/ExplorePage'));
const SignInPage         = lazy(() => import('../pages/SignInPage/SignInPage'));
const SignUpPage         = lazy(() => import('../pages/SignUpPage/SignUpPage'));
const BookDetailPage     = lazy(() => import('../pages/BookDetailPage/BookDetailPage'));
const PdfReaderPage      = lazy(() => import('../pages/PdfReaderPage/PdfReaderPage'));
const AdminPage          = lazy(() => import('../pages/AdminPage/AdminPage'));
const Dashboard          = lazy(() => import('../pages/AdminPage/Dashboard/Dashboard'));
const UploadBook         = lazy(() => import('../pages/AdminPage/Upload/UploadBook'));
const CategoryManagement = lazy(() => import('../pages/AdminPage/Categories/CategoryManagement'));
const UserManagement     = lazy(() => import('../pages/AdminPage/Users/User'));
const CommentManagement  = lazy(() => import('../pages/AdminPage/Comments/CommentManagement'));
const RatingManagement   = lazy(() => import('../pages/AdminPage/Ratings/RatingManagement'));
const ChapterManagement  = lazy(() => import('../pages/AdminPage/Chapters/ChapterManagement'));
const NotificationManagement = lazy(() => import('../pages/AdminPage/Notifications/NotificationManagement'));
const Statistics         = lazy(() => import('../pages/AdminPage/Statistics/Statistics'));
const AuthorManagement   = lazy(() => import('../pages/AdminPage/Authors/AuthorManagement'));
const LibraryPage        = lazy(() => import('../pages/LibraryPage/LibraryPage'));
const CategoriesPage     = lazy(() => import('../pages/CategoriesPage/CategoriesPage'));
const AuthorPage         = lazy(() => import('../pages/AuthorPage/AuthorPage'));

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

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={path.HOME}        element={<HomePage />} />
        <Route path={path.EXPLORE}     element={<ExplorePage />} />
        <Route path={path.SIGN_IN}     element={<SignInPage />} />
        <Route path={path.SIGN_UP}     element={<SignUpPage />} />
        <Route path={path.BOOK_DETAIL} element={<BookDetailPage />} />
        <Route path={path.BOOK_READ}   element={<PdfReaderPage />} />
        <Route path={path.MY_LIBRARY}  element={<LibraryPage />} />
        <Route path="/categories"      element={<CategoriesPage />} />
        <Route path="/author/:id"    element={<AuthorPage />} />

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
          <Route path="notifications" element={<NotificationManagement />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="authors"    element={<AuthorManagement />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
