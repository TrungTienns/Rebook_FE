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
        const response = await productService.getAll();

        let allBooks = [];
        if (response && response.success && Array.isArray(response.data)) {
          allBooks = response.data;
        } else if (Array.isArray(response)) {
          allBooks = response;
        }

        const currentCategoryIds = currentBook.categories?.map(c => c.id) || [];

        let related = allBooks.filter(b => b.id !== currentBook.id);

        if (currentCategoryIds.length > 0) {
          related = related.filter(b => {
            const bCategoryIds = b.categories?.map(c => c.id) || [];
            return bCategoryIds.some(id => currentCategoryIds.includes(id));
          });
        }

        // Tăng số lượng hiển thị vì mỗi item giờ nhỏ gọn hơn
        setBooks(related.slice(0, 10));

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
              <Link to={`/book/${book.slug}`} className="book-item" key={book.id}>
                <div className="book-cover">
                  {book.coverImageUrl || book.cover_image_url ? (
                    <img src={book.coverImageUrl || book.cover_image_url} alt={book.title} />
                  ) : (
                    <div className="no-cover">
                      <i className="fa-solid fa-image fa-2x"></i>
                    </div>
                  )}

                  <div className="hover-overlay">
                    <span className="read-tag">
                      <i className="fa-solid fa-book-open"></i> {t('maybeYouLike.readNow')}
                    </span>
                  </div>
                </div>

                <h3 className="book-title" title={book.title}>{book.title}</h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}