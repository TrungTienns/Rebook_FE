import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Header from '../../layouts/Header/Header';
import Footer from '../../layouts/Footer/Footer';
import axiosClient from '../../services/axiosClient';
import './CategoriesPage.scss';
import { path } from '../../common/path';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/categories');
      if (res?.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  const handleCategoryClick = (slug) => {
    navigate(`${path.MY_LIBRARY}?category=${slug}`);
  };

  return (
    <div className="categories-page neo-layout">
      <Header />
      <main className="categories-content">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-header"
          >
            <h1 className="page-title">
              <i className="fa-solid fa-layer-group"></i> {t('header.categories', 'Thể loại')}
            </h1>
            <p className="page-desc">Khám phá kho tàng sách đa dạng qua các thể loại phong phú.</p>
          </motion.div>

          {loading ? (
            <div className="loading-state">
              <i className="fa-solid fa-spinner fa-spin fa-3x"></i>
              <p>Đang tải thể loại...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-box-open fa-3x"></i>
              <p>Chưa có thể loại nào được thêm.</p>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  className="category-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                  onClick={() => handleCategoryClick(cat.slug)}
                >
                  <div className="card-image-wrapper">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} loading="lazy" />
                    ) : (
                      <div className="no-image-placeholder">
                        <i className="fa-solid fa-shapes"></i>
                      </div>
                    )}
                    <div className="book-count-badge">
                      <i className="fa-solid fa-book"></i> {cat.bookCount || 0}
                    </div>
                  </div>
                  <div className="card-content">
                    <h3 className="cat-name">{cat.name}</h3>
                    <button className="go-btn">
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
