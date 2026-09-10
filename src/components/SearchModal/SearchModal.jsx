import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import productService from '../../services/productService';
import { isNewProduct } from '../../utils/dateUtils';
import './SearchModal.scss';

export default function SearchModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setBooks([]);
      fetchBooks();
    }
  }, [isOpen]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll();
      if (res && res.success && Array.isArray(res.data)) {
        setBooks(res.data);
      } else if (Array.isArray(res)) {
        setBooks(res);
      }
    } catch (err) {
      console.error('Error fetching books for search:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    if (!searchTerm.trim()) return false;
    const term = searchTerm.toLowerCase();
    const titleMatch = book.title && book.title.toLowerCase().includes(term);
    const authorMatch = book.author?.penName && book.author.penName.toLowerCase().includes(term);
    return titleMatch || authorMatch;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="overlay"
          className="search-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {isOpen && (
        <motion.div 
          key="content"
          className="search-modal-content"
          initial={{ y: -50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
          
          <div className="search-input-wrapper">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input 
              type="text" 
              className="search-input" 
              placeholder={t('search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <div className="search-results">
            {loading && (
              <div className="search-status">
                <i className="fa-solid fa-spinner fa-spin"></i> {t('search.loading')}
              </div>
            )}
            
            {!loading && searchTerm && filteredBooks.length === 0 && (
              <div className="search-status">
                <i className="fa-solid fa-face-frown-open"></i> {t('search.noResults')}
              </div>
            )}

            {!loading && searchTerm && filteredBooks.length > 0 && (
              <div className="results-list">
                <p className="results-count">
                  {t('search.resultsFor')} "{searchTerm}" ({filteredBooks.length})
                </p>
                <div className="results-grid">
                  {filteredBooks.slice(0, 10).map(book => (
                    <a href={`#book/${book.slug || book.id}`} key={book.id} className="result-item" onClick={onClose}>
                      <div className="result-img">
                        {isNewProduct(book.createdAt || book.created_at) && (
                          <div className="new-badge">NEW</div>
                        )}
                        {book.coverImageUrl || book.cover_image_url ? (
                          <img src={book.coverImageUrl || book.cover_image_url} alt={book.title} />
                        ) : (
                          <div className="no-img">
                            <i className="fa-solid fa-image"></i>
                          </div>
                        )}
                      </div>
                      <div className="result-info">
                        <h4 className="result-title" title={book.title}>{book.title}</h4>
                        <p className="result-author"><i className="fa-solid fa-pen-nib"></i> {book.author?.penName || 'Unknown'}</p>
                        <div className="result-meta">
                          <span className="rating"><i className="fa-solid fa-star"></i> {book.avg_rating || '5.0'}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
