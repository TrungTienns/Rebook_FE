import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import './ExploreSlider.scss';

import slide1Img from '../../assets/images/banner_book_forest.jpg';
import slide2Img from '../../assets/images/banner_reading_clouds.jpg';
import slide3Img from '../../assets/images/banner_cozy_library.jpg';

export default function ExploreSlider() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    { id: 1, image: slide1Img, titleKey: 'exploreSlider.slide1Title', descKey: 'exploreSlider.slide1Desc', bgColor: '#ffeaa7' },
    { id: 2, image: slide2Img, titleKey: 'exploreSlider.slide2Title', descKey: 'exploreSlider.slide2Desc', bgColor: '#d0f0fd' },
    { id: 3, image: slide3Img, titleKey: 'exploreSlider.slide3Title', descKey: 'exploreSlider.slide3Desc', bgColor: '#ffb8b8' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000); // 3 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="explore-slider-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="explore-slide"
          style={{ backgroundColor: slides[currentIndex].bgColor }}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="slide-image">
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              src={slides[currentIndex].image} 
              alt="Slider Image" 
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="slider-indicators">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          ></button>
        ))}
      </div>
    </div>
  );
}
