import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './routes/AppRoutes';

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
      <AppRoutes />

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
