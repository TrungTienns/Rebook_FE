import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './Banner.scss';

export default function Banner() {
  const containerRef = useRef(null);
  const { t } = useTranslation();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const yLeft = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const yRight = useTransform(scrollYProgress, [0, 1], ["0%", "70%"]);
  const opacityFade = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section className="cartoon-banner" ref={containerRef}>
      
      {/* WATERMARK */}
      <motion.div 
        className="banner-background"
        style={{ opacity: opacityFade, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        <div className="watermark-wrapper">
          <div className="watermark-container">
            <motion.div 
              className="watermark-text"
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
            >
              Rebook
            </motion.div>
          </div>
        </div>

        {/* Floating Shapes */}
        <motion.div 
          className="shape float-shape shape-star"
          animate={{ y: [0, -20, 0], rotate: [45, 135, 45] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="shape float-shape shape-circle"
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="shape float-shape shape-square"
          animate={{ x: [0, -20, 0], rotate: [15, -15, 15] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* NỘI DUNG CHÍNH (2 CỘT) */}
      <div className="banner-grid">
        
        {/* Cột Trái */}
        <motion.div 
          className="banner-content-left"
          style={{ y: yLeft, opacity: opacityFade }}
        >
          <motion.div 
            className="hero-heading-container"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <div className="shared-t">{t('banner.sharedLetter')}</div>
            <div className="heading-text">
              <h1 className="line-1">{t('banner.line1')}</h1>
              <h1 className="line-2"><span className="highlight">{t('banner.line2')}</span></h1>
            </div>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          >
            {t('banner.description')}
          </motion.p>
          
          <motion.button 
            className="banner-btn"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95, y: 4, boxShadow: "0px 0px 0px black" }}
          >
            {t('banner.cta')}
          </motion.button>
        </motion.div>

        {/* Cột Phải: Sách */}
        <motion.div 
          className="banner-image-right"
          style={{ y: yRight, opacity: opacityFade }}
        >
          <div className="illustration-container">
            <motion.div 
              className="book-mockup soul-book-style"
              initial={{ opacity: 0, scale: 0.8, rotate: 15 }}
              animate={{ opacity: 1, scale: 1, rotate: -5 }}
              transition={{ duration: 1, type: "spring", bounce: 0.5, delay: 0.2 }}
              whileHover={{ rotate: 0, scale: 1.05, transition: { duration: 0.3 } }}
            >
              <div className="book-cover">
                <div className="book-spine">
                  <div className="spine-line"></div>
                  <div className="spine-line"></div>
                  <div className="spine-line"></div>
                </div>
                <div className="book-ribbon"></div>
                
                <div className="book-title-plate">
                  <div className="book-title">
                    {t('banner.bookTitle').split('\n').map((line, i) => (
                      <React.Fragment key={i}>{line}{i === 0 && <br />}</React.Fragment>
                    ))}
                  </div>
                  <div className="book-subtitle">{t('banner.bookSubtitle')}</div>
                </div>
                
                <div className="book-graphic"></div>
                
                <div className="book-author">{t('banner.bookAuthor')}</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
