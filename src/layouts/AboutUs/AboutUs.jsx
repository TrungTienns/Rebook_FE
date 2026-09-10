import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './AboutUs.scss';

export default function AboutUs() {
  const { t } = useTranslation();

  return (
    <section className="cartoon-about" id="about">
      <div className="about-container">
        
        {/* Main Split Section */}
        <div className="about-split">
          
          {/* Left Text */}
          <motion.div 
            className="about-content"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <h2 className="section-title">
              <span className="highlight-box">{t('aboutUs.title')}</span>
            </h2>
            <p className="about-desc">
              {t('aboutUs.desc')}
            </p>
            
            <div className="mission-box">
              <h3 className="mission-title">{t('aboutUs.missionTitle')}</h3>
              <p>{t('aboutUs.missionDesc')}</p>
            </div>
          </motion.div>

          {/* Right Image Generated from Prompt */}
          <motion.div 
            className="about-visual"
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -2 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.2 }}
            whileHover={{ rotate: 0, scale: 1.02 }}
          >
             <img src="/images/about-us-illustration.jpg" alt="Cozy reading corner cartoon illustration" className="visual-img" />
          </motion.div>
          
        </div>

        {/* Stats Bento Grid (Asymmetric) */}
        <motion.div 
          className="about-stats"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          <motion.div className="stat-card stat-primary" variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} whileHover={{ y: -5 }}>
            <div className="stat-num">50K+</div>
            <div className="stat-label">{t('aboutUs.stats.readers')}</div>
          </motion.div>
          
          <motion.div className="stat-card stat-secondary" variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} whileHover={{ y: -5 }}>
            <div className="stat-num">100K+</div>
            <div className="stat-label">{t('aboutUs.stats.books')}</div>
          </motion.div>
          
          <motion.div className="stat-card stat-tertiary" variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} whileHover={{ y: -5 }}>
            <div className="stat-num">5K+</div>
            <div className="stat-label">{t('aboutUs.stats.authors')}</div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
