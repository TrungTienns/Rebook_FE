import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../services/axiosClient';
import Header from '../../layouts/Header/Header';
import Footer from '../../layouts/Footer/Footer';
import './BookDetailPage.scss';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import MaybeYouLike from '../../layouts/MaybeYouLike/MaybeYouLike';

export default function BookDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/books/${slug}`);
        if (res?.success) {
          setBook(res.data);
        } else {
          setError('Không thể tải thông tin sách.');
        }
      } catch (err) {
        console.error(err);
        setError('Lỗi khi tải thông tin sách.');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleReadNow = () => {
    navigate(`/book/${slug}/read`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="book-detail-loading">
          <i className="fa-solid fa-spinner fa-spin fa-3x"></i>
          <p>Đang tải thông tin sách...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !book) {
    return (
      <>
        <Header />
        <div className="book-detail-error">
          <i className="fa-solid fa-triangle-exclamation fa-3x"></i>
          <h2>Oops!</h2>
          <p>{error || 'Không tìm thấy sách.'}</p>
          <button className="neo-btn" onClick={() => navigate('/')}>Quay Về Trang Chủ</button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="book-detail-page">
        <div className="container">
          <motion.div 
            className="book-detail-box neo-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="book-cover-section">
              <div className="cover-wrapper">
                {book.coverImageUrl || book.cover_image_url ? (
                  <img src={book.coverImageUrl || book.cover_image_url} alt={book.title} />
                ) : (
                  <div className="no-cover">
                    <i className="fa-solid fa-image fa-4x"></i>
                  </div>
                )}
                {book.is_vip && <div className="vip-badge"><i className="fa-solid fa-crown"></i> VIP</div>}
              </div>
            </div>

            <div className="book-info-section">
              <h1 className="book-title">{book.title}</h1>
              
              <div className="book-meta">
                <span className="author">
                  <i className="fa-solid fa-pen-nib"></i> {book.author?.penName || t('bookDetail.anonymousAuthor')}
                </span>
                
                <span className="categories">
                  <i className="fa-solid fa-tags"></i> 
                  {book.categories && book.categories.length > 0 
                    ? book.categories.map(c => c.name).join(', ') 
                    : t('bookDetail.uncategorized')}
                </span>
              </div>
              
              <div className="book-stats">
                <div className="stat-item" title={t('bookDetail.views')}>
                  <i className="fa-solid fa-eye"></i> {book.total_views || 0}
                </div>
                <div className="stat-item" title={t('bookDetail.rating')}>
                  <i className="fa-solid fa-star"></i> {book.avg_rating || '0.0'}
                </div>
                <div className="stat-item" title={t('bookDetail.totalChapters')}>
                  <i className="fa-solid fa-list-ol"></i> {book.total_chapters || 0} {t('bookDetail.chapters')}
                </div>
                <div className="stat-item" title={t('bookDetail.status')}>
                  <i className="fa-solid fa-signal"></i> {book.status === 'completed' ? t('bookDetail.completed') : t('bookDetail.ongoing')}
                </div>
              </div>

              <div className="book-description">
                <h3><i className="fa-solid fa-book-open"></i> {t('bookDetail.intro')}</h3>
                <p>{book.description || 'Chưa có thông tin giới thiệu cho sách này.'}</p>
              </div>

              <div className="book-actions">
                <button className="neo-btn primary-action" onClick={handleReadNow}>
                  <i className="fa-solid fa-book-reader"></i> {t('bookDetail.readNow')}
                </button>
                <button className="neo-btn secondary-action">
                  <i className="fa-solid fa-bookmark"></i> {t('bookDetail.save')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <MaybeYouLike currentBook={book} />
      <Footer />
    </>
  );
}
