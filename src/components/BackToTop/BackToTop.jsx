import {  useState, useEffect  } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import './BackToTop.scss';

export default function BackToTop() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeoutId = null;
    const handleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        setVisible(window.scrollY > 300);
        timeoutId = null;
      }, 100); // 100ms throttle
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          className="back-to-top"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.9, y: 4 }}
          title={t('backToTop.title', 'Lên đầu trang')}
        >
          <span className="btt-arrow">↑</span>
          <span className="btt-label">{t('backToTop.label', 'TOP')}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
