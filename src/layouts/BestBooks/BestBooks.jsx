import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import { isNewProduct } from '../../utils/dateUtils';
import './BestBooks.scss';

export default function BestBooks() {
  const { t } = useTranslation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestBooks = async () => {
      try {
        setLoading(true);
        // Fetch top rated books (assuming backend supports these params)
        const response = await productService.getAll({ limit: 4, sort: 'rating' }); 
        
        if (response && response.success && Array.isArray(response.data)) {
          setBooks(response.data);
        } else if (Array.isArray(response)) {
          setBooks(response);
        } else {
          setBooks([]);
        }
      } catch (err) {
        console.error('Error fetching best books:', err);
        setError(t('featuredProducts.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchBestBooks();
  }, [t]);

  return (
    <section className="best-books">
      <div className="container">
        <div className="best-books-header">
          <h2 className="section-title">
            <span className="highlight">{t('bestBooks.titlePart1')}</span> {t('bestBooks.titlePart2')}
          </h2>
          <p className="section-subtitle">{t('bestBooks.subtitle')}</p>
        </div>

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

        {!loading && !error && books.length === 0 && (
          <div className="status-message">
            <i className="fa-solid fa-book-open"></i> {t('featuredProducts.noProducts')}
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <div className="books-list">
            {books.map((book, index) => (
              <Link to={`/book/${book.slug}`} className="book-item" key={book.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="rank-badge">#{index + 1}</div>
                <div className="book-cover">
                  {isNewProduct(book.createdAt || book.created_at) && (
                    <div className="new-badge">NEW</div>
                  )}
                  {book.coverImageUrl || book.cover_image_url ? (
                    <img src={book.coverImageUrl || book.cover_image_url} alt={book.title} />
                  ) : (
                    <div className="no-cover">
                      <i className="fa-solid fa-image fa-2x"></i>
                    </div>
                  )}
                  
                  <div className="hover-overlay">
                    <button className="neo-btn read-btn">
                      {t('featuredProducts.readNow')}
                    </button>
                  </div>
                </div>
                
                <div className="book-details">
                  <h3 className="book-title" title={book.title}>{book.title}</h3>
                  <p className="book-author">
                    <i className="fa-solid fa-pen-nib"></i> {book.author?.penName || book.author_id || 'Unknown'}
                  </p>
                  
                  <div className="book-meta">
                    <span className="rating">
                      <i className="fa-solid fa-star"></i> {book.avgRating || '5.0'}
                    </span>
                    <span className="views">
                      <i className="fa-solid fa-eye"></i> {book.totalViews || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
