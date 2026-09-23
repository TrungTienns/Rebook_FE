import {  useEffect  } from 'react';
import Header from '../../layouts/Header/Header';
import Footer from '../../layouts/Footer/Footer';
import BackToTop from '../../components/BackToTop/BackToTop';
import ExploreSlider from '../../layouts/ExploreSlider/ExploreSlider';
import ExploreAbout from '../../layouts/ExploreAbout/ExploreAbout';
import BestBooks from '../../layouts/BestBooks/BestBooks';
import './ExplorePage.scss';

export default function ExplorePage() {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="explore-page">
      <Header />
      <main>
        <ExploreSlider />
        <ExploreAbout />
        <BestBooks />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}
