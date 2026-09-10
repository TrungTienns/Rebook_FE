import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Lenis from 'lenis';
import './App.css';
import HomePage from './pages/HomePage/HomePage';
import ExplorePage from './pages/ExplorePage/ExplorePage';
import SignInPage from './pages/SignInPage/SignInPage';
import SignUpPage from './pages/SignUpPage/SignUpPage';
import BookDetailPage from './pages/BookDetailPage/BookDetailPage';
import PdfReaderPage from './pages/PdfReaderPage/PdfReaderPage';
import { path } from './common/path';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AdminPage from './pages/AdminPage/AdminPage';
import Dashboard from './pages/AdminPage/Dashboard/Dashboard';
import UploadBook from './pages/AdminPage/Upload/UploadBook';
import CategoryManagement from './pages/AdminPage/Categories/CategoryManagement';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Protected Route for Admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner
  
  if (!user || user.role !== 'admin') {
    return <Navigate to={path.HOME} replace />;
  }
  
  return children;
};

function App() {
  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard ease out
      direction: 'vertical', 
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Clean up on component unmount
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path={path.HOME} element={<HomePage />} />
        <Route path={path.EXPLORE} element={<ExplorePage />} />
        <Route path={path.SIGN_IN} element={<SignInPage />} />
        <Route path={path.SIGN_UP} element={<SignUpPage />} />
        <Route path={path.BOOK_DETAIL} element={<BookDetailPage />} />
        <Route path={path.BOOK_READ} element={<PdfReaderPage />} />
        
        {/* Admin Routes */}
        <Route path={path.ADMIN} element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }>
          {/* Default redirect to dashboard */}
          <Route index element={<Navigate to={path.ADMIN_DASHBOARD} replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="books" element={<UploadBook />} />
          <Route path="categories" element={<CategoryManagement />} />
          {/* Add more admin sub-routes here */}
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
    </div>
  );
}

export default App;
