import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../services/axiosClient';
import Header from '../../layouts/Header/Header';
import Footer from '../../layouts/Footer/Footer';
import './BookDetailPage.scss';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import MaybeYouLike from '../../layouts/MaybeYouLike/MaybeYouLike';
import FavoriteButton from '../../components/FavoriteButton/FavoriteButton';
import RatingSection from '../../components/RatingSection/RatingSection';
import CommentSection from '../../components/CommentSection/CommentSection';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
export default function BookDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/books/${slug}`);
        if (res?.success) {
          setBook(res.data);
        } else {
          setError(t('bookDetail.loadError', 'Không thể tải thông tin sách.'));
        }
      } catch (err) {
        console.error(err);
        setError(t('bookDetail.loadError', 'Lỗi khi tải thông tin sách.'));
      } finally {
        setLoading(false);
        // Force scroll to top after layout paints
        requestAnimationFrame(() => {
          if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        });
        setTimeout(() => {
          if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
          window.scrollTo(0, 0);
        }, 150);
      }
    };
    fetchBook();
  }, [slug]);

  const handleReadNow = () => {
    if (book?.chapters && book.chapters.length > 0) {
      const chapter = book.chapters[0];
      const hasVi = !!chapter.pdfUrl;
      const hasEn = !!chapter.pdfUrlEn;
      
      if (hasVi && hasEn) {
        Swal.fire({
          title: 'Chọn Ngôn Ngữ',
          text: 'Cuốn sách này có 2 phiên bản. Bạn muốn đọc bản nào?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Tiếng Việt',
          cancelButtonText: 'Tiếng Anh',
          customClass: {
            popup: 'neo-popup',
            confirmButton: 'neo-btn-swal neo-btn-primary',
            cancelButton: 'neo-btn-swal neo-btn-secondary'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(`/book/${slug}/read?lang=vi`);
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            navigate(`/book/${slug}/read?lang=en`);
          }
        });
      } else if (hasEn) {
        navigate(`/book/${slug}/read?lang=en`);
      } else {
        navigate(`/book/${slug}/read?lang=vi`);
      }
    } else {
      toast.info('Sách này chưa có nội dung để đọc.');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="book-detail-loading">
          <i className="fa-solid fa-spinner fa-spin fa-3x"></i>
          <p>{t('bookDetail.loading', 'Đang tải thông tin sách...')}</p>
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
          <p>{error || t('bookDetail.notFound', 'Không tìm thấy sách.')}</p>
          <button className="neo-btn" onClick={() => navigate('/')}>{t('bookDetail.backToHome', 'Quay Về Trang Chủ')}</button>
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
                {book.coverImageUrl ? (
                  <>
                    <img src={book.coverImageUrl} alt={book.title} />
                    {book.isVip && (
                      <div className="vip-lock-overlay">
                        <i className="fa-solid fa-lock fa-3x"></i>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-cover">
                    <i className="fa-solid fa-image fa-4x"></i>
                    {book.isVip && (
                      <div className="vip-lock-overlay">
                        <i className="fa-solid fa-lock fa-3x"></i>
                      </div>
                    )}
                  </div>
                )}
                {book.isVip && <div className="vip-badge"><i className="fa-solid fa-crown"></i> VIP</div>}
                {/* Language Badges */}
                  <div className="lang-badges" style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {book.chapters.map(chap => {
                      if (chap.chapterNumber === 1) {
                        return (
                          <React.Fragment key="badges">
                            {chap.pdfUrl && chap.pdfUrlEn && (
                              <div className="lang-badge" style={{ background: '#3498db', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '20px', fontWeight: '800', fontSize: '0.75rem', border: '2px solid #1a1a1a', boxShadow: '2px 2px 0px rgba(26, 26, 26, 0.5)' }}>Song ngữ (EN-VI)</div>
                            )}
                            {chap.pdfUrl && !chap.pdfUrlEn && (
                              <div className="lang-badge" style={{ background: '#ff5252', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '20px', fontWeight: '800', fontSize: '0.75rem', border: '2px solid #1a1a1a', boxShadow: '2px 2px 0px rgba(26, 26, 26, 0.5)' }}>Tiếng Việt</div>
                            )}
                            {!chap.pdfUrl && chap.pdfUrlEn && (
                              <div className="lang-badge" style={{ background: '#9b59b6', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '20px', fontWeight: '800', fontSize: '0.75rem', border: '2px solid #1a1a1a', boxShadow: '2px 2px 0px rgba(26, 26, 26, 0.5)' }}>Tiếng Anh</div>
                            )}
                          </React.Fragment>
                        );
                      }
                      return null;
                    })}
                  </div>
              </div>
            </div>

            <div className="book-info-section">
              <h1 className="book-title">{book.title}</h1>
              {book.titleEn && <h2 className="book-title-en" style={{ fontSize: '1.2rem', color: '#666', marginTop: '-0.5rem', marginBottom: '1rem', fontStyle: 'italic' }}>{book.titleEn}</h2>}
              
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
                  <i className="fa-solid fa-eye"></i> {book.totalViews || 0}
                </div>
                <div className="stat-item" title={t('bookDetail.rating')}>
                  <i className="fa-solid fa-star"></i> {book.avgRating || '0.0'}
                </div>
                <div className="stat-item" title={t('bookDetail.totalChapters')}>
                  <i className="fa-solid fa-list-ol"></i> {book.chapters?.length || book.totalChapters || 0} {t('bookDetail.chapters')}
                </div>
                <div className="stat-item" title={t('bookDetail.status')}>
                  <i className="fa-solid fa-signal"></i> {book.status === 'completed' ? t('bookDetail.completed') : t('bookDetail.ongoing')}
                </div>
              </div>

              <div className="book-description">
                <h3><i className="fa-solid fa-book-open"></i> {t('bookDetail.intro')}</h3>
                <p>{book.description || t('bookDetail.noDescription', 'Chưa có thông tin giới thiệu cho sách này.')}</p>
              </div>

              <div className="book-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {book.isVip ? (
                  <button className="neo-btn primary-action" onClick={() => toast.info('Tính năng thanh toán đang được phát triển!')} style={{ background: '#ffc107', color: '#1a1a1a' }}>
                    <i className="fa-solid fa-unlock-keyhole"></i> {t('bookDetail.unlockVip', `Mở khóa (${book.vipPrice || 0} xu)`)}
                  </button>
                ) : (
                  <button className="neo-btn primary-action" onClick={() => {
                    const firstChapter = book.chapters && book.chapters.length > 0 ? book.chapters[0] : null;
                    if (firstChapter) {
                      navigate(`/book/${slug}/read?chapter=${firstChapter.chapterNumber}&lang=vi`);
                    } else {
                      handleReadNow();
                    }
                  }}>
                    <i className="fa-solid fa-book-reader"></i> Đọc Từ Đầu
                  </button>
                )}
                
                {book.chapters && book.chapters.length > 0 && (
                  <div 
                    style={{ position: 'relative', width: '220px' }} 
                    tabIndex={0} 
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setIsChapterDropdownOpen(false);
                      }
                    }}
                  >
                    <button 
                      className="neo-btn"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f8f9fa',
                        color: '#1a1a1a',
                        fontWeight: '800',
                        fontSize: '1rem',
                        border: '3px solid #1a1a1a',
                        borderRadius: '12px',
                        boxShadow: '4px 4px 0px #1a1a1a',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setIsChapterDropdownOpen(!isChapterDropdownOpen)}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px #1a1a1a'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'translate(0px, 0px)'; e.currentTarget.style.boxShadow = '4px 4px 0px #1a1a1a'; }}
                    >
                      <span>Chọn chương...</span>
                      <i className={`fa-solid fa-chevron-${isChapterDropdownOpen ? 'up' : 'down'}`}></i>
                    </button>

                    {/* Custom Dropdown Menu */}
                    {isChapterDropdownOpen && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '110%',
                          left: '0',
                          width: '100%',
                          maxHeight: '250px',
                          overflowY: 'auto',
                          background: 'white',
                          border: '3px solid #1a1a1a',
                          borderRadius: '12px',
                          boxShadow: '6px 6px 0px rgba(26, 26, 26, 0.2)',
                          zIndex: 100,
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '0.5rem',
                          gap: '0.3rem'
                        }}
                      >
                        {book.chapters.map(chapter => (
                          <button
                            key={chapter.id}
                            style={{
                              padding: '0.8rem',
                              textAlign: 'left',
                              background: 'transparent',
                              border: 'none',
                              borderBottom: '2px dashed #eee',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.2rem',
                              borderRadius: '6px',
                              transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            onClick={() => {
                              setIsChapterDropdownOpen(false);
                              if (book.isVip) {
                                toast.info('Tính năng thanh toán đang được phát triển!');
                              } else {
                                navigate(`/book/${slug}/read?chapter=${chapter.chapterNumber}&lang=vi`);
                              }
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#1a1a1a' }}>Chương {chapter.chapterNumber}</span>
                              <div style={{ display: 'flex', gap: '0.2rem' }}>
                                {chapter.pdfUrl && <span style={{ padding: '0.15rem 0.3rem', background: '#ff5252', color: 'white', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>VI</span>}
                                {chapter.pdfUrlEn && <span style={{ padding: '0.15rem 0.3rem', background: '#3498db', color: 'white', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>EN</span>}
                              </div>
                            </div>
                            {chapter.title && (
                              <span style={{ fontSize: '0.8rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chapter.title}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <FavoriteButton bookId={book.id} />
              </div>
            </div>
          </motion.div>

        </div>
      </main>
      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '0 1rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <RatingSection bookId={book.id} />
      </div>
      <MaybeYouLike currentBook={book} />
      <Footer />
    </>
  );
}
