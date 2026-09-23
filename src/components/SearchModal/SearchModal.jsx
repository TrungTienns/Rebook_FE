import {  useState, useEffect, useCallback  } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import productService from '../../services/productService';
import { isNewProduct } from '../../utils/dateUtils';
import { Link } from 'react-router-dom';
import './SearchModal.scss';

export default function SearchModal({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Speech Recognition ────────────────────────────────────────────────────
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Sync transcript → searchTerm khi user nói
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (transcript) setSearchTerm(transcript);
  }, [transcript]);

  const toggleVoice = useCallback(() => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      const lang = (i18n.resolvedLanguage || i18n.language || '').startsWith('vi')
        ? 'vi-VN'
        : 'en-US';
      SpeechRecognition.startListening({
        continuous: false,
        language: lang,
      });
    }
  }, [listening, resetTranscript, i18n.language, i18n.resolvedLanguage]);


  useEffect(() => {
    if (isOpen) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchTerm('');
      setBooks([]);
      resetTranscript();
    } else {
      SpeechRecognition.stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSearch = async (query) => {
    if (!query.trim()) { setBooks([]); return; }
    try {
      setLoading(true);
      const res = await productService.searchBooks(query);
      if (res?.success) setBooks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Debounced search ──────────────────────────────────────────────────────
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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
            <i className="fa-solid fa-xmark" />
          </button>

          <div className="search-input-wrapper">
            <i className="fa-solid fa-magnifying-glass search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder={listening ? t('search.voiceListen') : t('search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />

            {/* ── Voice Search Button ─────────────────────────────────── */}
            {browserSupportsSpeechRecognition ? (
              <button
                className={`voice-btn ${listening ? 'listening' : ''}`}
                onClick={toggleVoice}
                title={listening ? t('search.voiceListen') : t('search.voiceStart')}
                type="button"
              >
                <i className={`fa-solid ${listening ? 'fa-stop' : 'fa-microphone'}`} />
                {listening && <span className="pulse-ring" />}
              </button>
            ) : (
              <button className="voice-btn disabled" title={t('search.voiceNotSupported')} disabled>
                <i className="fa-solid fa-microphone-slash" />
              </button>
            )}
          </div>

          <div className="search-results">
            {loading && (
              <div className="search-status">
                <i className="fa-solid fa-spinner fa-spin" /> {t('search.loading')}
              </div>
            )}

            {!loading && searchTerm && books.length === 0 && (
              <div className="search-status">
                <i className="fa-solid fa-face-frown-open" /> {t('search.noResults')}
              </div>
            )}

            {!loading && searchTerm && books.length > 0 && (
              <div className="results-list">
                <p className="results-count">
                  {t('search.resultsFor')} "{searchTerm}" ({books.length})
                </p>
                <div className="results-grid">
                  {books.slice(0, 10).map(book => (
                    <Link
                      to={`/book/${book.slug || book.id}`}
                      key={book.id}
                      className="result-item"
                      onClick={onClose}
                    >
                      <div className="result-img">
                        {isNewProduct(book.createdAt || book.created_at) && (
                          <div className="new-badge">NEW</div>
                        )}
                        {book.coverImageUrl || book.cover_image_url ? (
                          <img
                            src={book.coverImageUrl || book.cover_image_url}
                            alt={book.title}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="no-img">
                            <i className="fa-solid fa-image" />
                          </div>
                        )}
                      </div>
                      <div className="result-info">
                        <h4 className="result-title" title={book.title}>{book.title}</h4>
                        <p className="result-author">
                          <i className="fa-solid fa-pen-nib" /> {book.author?.penName || t('search.unknownAuthor', 'Unknown')}
                        </p>
                        <div className="result-meta">
                          <span className="rating">
                            <i className="fa-solid fa-star" /> {book.avg_rating || '5.0'}
                          </span>
                        </div>
                      </div>
                    </Link>
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
