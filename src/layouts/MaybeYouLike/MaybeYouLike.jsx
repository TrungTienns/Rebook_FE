import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import './MaybeYouLike.scss';

export default function MaybeYouLike({ currentBook }) {
  const { t } = useTranslation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentBook) return;

    const fetchRelatedBooks = async () => {
      try {
        setLoading(true);
        // Fetch all books
        const response = await productService.getAll();
        
        let allBooks = [];
        if (response && response.success && Array.isArray(response.data)) {
          allBooks = response.data;
        } else if (Array.isArray(response)) {
          allBooks = response;
        }

        // Current book's category IDs
        const currentCategoryIds = currentBook.categories?.map(c => c.id) || [];

        // Filter related books: 
        // 1. Not the current book
        // 2. Has at least one overlapping category (if current book has categories)
        let related = allBooks.filter(b => b.id !== currentBook.id);
        
        if (currentCategoryIds.length > 0) {
          related = related.filter(b => {
            const bCategoryIds = b.categories?.map(c => c.id) || [];
            return bCategoryIds.some(id => currentCategoryIds.includes(id));
          });
        }

        // Limit to 4-5 books max
        setBooks(related.slice(0, 4));

      } catch (err) {
        console.error('Error fetching related books:', err);
        setError(t('maybeYouLike.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedBooks();
  }, [currentBook]);

  if (!currentBook) {
    return null;
  }

  return (
    <section className="maybe-you-like">
      <div className="container">
        <div className="maybe-you-like-header">
          <h2 className="section-title">
            {t('maybeYouLike.titlePart1')} <span className="highlight">{t('maybeYouLike.titlePart2')}</span>
          </h2>
          <p className="section-subtitle">{t('maybeYouLike.subtitle')} {currentBook.title}</p>
        </div>

        {loading && (
          <div className="status-message">
            <i className="fa-solid fa-spinner fa-spin"></i> {t('maybeYouLike.loading')}
          </div>
        )}

        {!loading && error && (
          <div className="status-message error">
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
        )}

        {!loading && !error && books.length === 0 && (
          <div className="status-message">
            <i className="fa-solid fa-book-open"></i> {t('maybeYouLike.empty')}
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <div className="books-list">
            {books.map((book) => (
              <Link to={`/book/${book.slug}`} className="book-item" key={book.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="book-cover">
                  {book.coverImageUrl || book.cover_image_url ? (
                    <img src={book.coverImageUrl || book.cover_image_url} alt={book.title} />
                  ) : (
                    <div className="no-cover">
                      <i className="fa-solid fa-image fa-2x"></i>
                    </div>
                  )}
                  
                  <div className="hover-overlay">
                    <button className="neo-btn read-btn">
                      {t('maybeYouLike.readNow')}
                    </button>
                  </div>
                </div>
                
                <div className="book-details">
                  <h3 className="book-title" title={book.title}>{book.title}</h3>
                  <p className="book-author">
                    <i className="fa-solid fa-pen-nib"></i> {book.author?.penName || t('maybeYouLike.anonymousAuthor')}
                  </p>
                  
                  <div className="book-meta">
                    <span className="rating">
                      <i className="fa-solid fa-star"></i> {book.avg_rating || '0.0'}
                    </span>
                    <span className="views">
                      <i className="fa-solid fa-eye"></i> {book.total_views || 0}
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
