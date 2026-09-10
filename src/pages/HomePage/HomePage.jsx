import React from 'react';
import { motion } from 'framer-motion';
import './HomePage.scss';
import Banner from '../../layouts/Banner/Banner';
import FeaturedProducts from '../../layouts/FeaturedProducts/FeaturedProducts';
import AboutUs from '../../layouts/AboutUs/AboutUs';
import WhyChooseUs from '../../layouts/WhyChooseUs/WhyChooseUs';
import Header from '../../layouts/Header/Header';
import Footer from '../../layouts/Footer/Footer';
import BackToTop from '../../components/BackToTop/BackToTop';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Banner />
        <AboutUs />
        <WhyChooseUs />
        <FeaturedProducts />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
