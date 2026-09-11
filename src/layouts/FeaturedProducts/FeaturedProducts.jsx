import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import productService from '../../services/productService';
import { isNewProduct } from '../../utils/dateUtils';
import { Link } from 'react-router-dom';
import './FeaturedProducts.scss';

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAll({ limit: 6, sort: 'newest' }); // Fetch some recent books
        
        // Handle different backend response structures
        if (response && response.success && Array.isArray(response.data)) {
          setProducts(response.data);
        } else if (Array.isArray(response)) {
          setProducts(response);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(t('featuredProducts.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);  // Không thêm `t` — không cần refetch khi đổi ngôn ngữ

  return (
    <section className="featured-products">
      <div className="container">
        <h2 className="section-title">
          <span className="highlight">{t('featuredProducts.titlePart1')}</span> {t('featuredProducts.titlePart2')}
        </h2>

        {loading && (
          <div className="status-message">
            <i className="fa-solid fa-spinner fa-spin"></i> {t('featuredProducts.loading')}
          </div>
        )}

        {!loading && error && (
          <div className="status-message error">
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="status-message">
            <i className="fa-solid fa-book-open"></i> {t('featuredProducts.noProducts')}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="products-grid">
            {products.map((product) => (
              <Link to={`/book/${product.slug}`} className="product-card" key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-image">
                  {isNewProduct(product.createdAt || product.created_at) && (
                    <div className="new-badge">NEW</div>
                  )}
                  {product.is_vip && (
                    <div className="vip-badge">
                      <i className="fa-solid fa-crown"></i>
                    </div>
                  )}
                  {product.coverImageUrl || product.cover_image_url ? (
                    <img
                    src={product.coverImageUrl || product.cover_image_url}
                    alt={product.title}
                    loading="lazy"
                    decoding="async"
                  />
                  ) : (
                    <div className="no-image">
                      <i className="fa-solid fa-image fa-3x"></i>
                    </div>
                  )}
                  
                  <div className="hover-overlay">
                    <button className="neo-btn read-btn">
                      {t('featuredProducts.readNow')}
                    </button>
                  </div>
                </div>
                
                <div className="product-info">
                  <h3 className="product-title" title={product.title}>
                    {product.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
