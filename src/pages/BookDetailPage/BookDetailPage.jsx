import {  useState, useEffect  } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../services/axiosClient';
import Header from '../../layouts/Header/Header';
import Footer from '../../layouts/Footer/Footer';
import './BookDetailPage.scss';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import MaybeYouLike from '../../layouts/MaybeYouLike/MaybeYouLike';
import FavoriteButton from '../../components/FavoriteButton/FavoriteButton';
import RatingSection from '../../components/RatingSection/RatingSection';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const LanguageBadge = ({ chapter, t }) => {
  const hasVi = !!chapter.pdfUrl || !!chapter.epubUrl;
  const hasEn = !!chapter.pdfUrlEn || !!chapter.epubUrlEn;
  
  if (hasVi && hasEn) {
    return <div className="lang-badge bilingual">{t('bookDetail.bilingual', 'Song ngữ (EN-VI)')}</div>;
  } else if (hasVi) {
    return <div className="lang-badge vi">{t('bookDetail.langVi', 'Tiếng Việt')}</div>;
  } else if (hasEn) {
    return <div className="lang-badge en">{t('bookDetail.langEn', 'Tiếng Anh')}</div>;
  }
  return null;
};

export default function BookDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let timeoutId;

    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/books/${slug}`, {
          signal: controller.signal
        });
        if (res?.success) {
          setBook(res.data);
        } else {
          setError(t('bookDetail.loadError', 'Không thể tải thông tin sách.'));
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        console.error(err);
        setError(t('bookDetail.loadError', 'Lỗi khi tải thông tin sách.'));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          // Force scroll to top after layout paints
          requestAnimationFrame(() => {
            if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          });
          timeoutId = setTimeout(() => {
            if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
            window.scrollTo(0, 0);
          }, 150);
        }
      }
    };
    fetchBook();

    return () => {
      controller.abort();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [slug, t]);

  const showLanguageDialog = (chapter) => {
    const hasVi = !!chapter.pdfUrl || !!chapter.epubUrl;
    const hasEn = !!chapter.pdfUrlEn || !!chapter.epubUrlEn;
    
    if (hasVi && hasEn) {
      Swal.fire({
        title: t('bookDetail.langSelectTitle', 'Chọn Ngôn Ngữ'),
        text: t('bookDetail.langSelectDesc', 'Cuốn sách này có 2 phiên bản. Bạn muốn đọc bản nào?'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: t('bookDetail.langVi', 'Tiếng Việt'),
        cancelButtonText: t('bookDetail.langEn', 'Tiếng Anh'),
        customClass: {
          popup: 'neo-popup',
          confirmButton: 'neo-btn-swal neo-btn-primary',
          cancelButton: 'neo-btn-swal neo-btn-secondary'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/book/${slug}/read?chapter=${chapter.chapterNumber}&lang=vi`);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          navigate(`/book/${slug}/read?chapter=${chapter.chapterNumber}&lang=en`);
        }
      });
    } else if (hasEn) {
      navigate(`/book/${slug}/read?chapter=${chapter.chapterNumber}&lang=en`);
    } else {
      navigate(`/book/${slug}/read?chapter=${chapter.chapterNumber}&lang=vi`);
    }
  };

  const handleReadNow = () => {
    if (book?.chapters && book.chapters.length > 0) {
      // Tìm chương đầu tiên có file (pdf hoặc epub)
      const chapter = book.chapters.find(c => c.pdfUrl || c.epubUrl || c.pdfUrlEn || c.epubUrlEn);
      
      if (chapter) {
        showLanguageDialog(chapter);
      } else {
        toast.info(t('bookDetail.noContent', 'Sách này chưa có nội dung để đọc.'));
      }
    } else {
      toast.info(t('bookDetail.noContent', 'Sách này chưa có nội dung để đọc.'));
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
                <div className="lang-badges-wrapper">
                  {book.chapters.map(chap => {
                    if (chap.chapterNumber === 1) {
                      return <LanguageBadge key="badges" chapter={chap} t={t} />;
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>

            <div className="book-info-section">
              <h1 className="book-title">{book.title}</h1>
              {book.titleEn && <h2 className="book-title-en">{book.titleEn}</h2>}
              
              <div className="book-meta">
                <span className="author">
                  <i className="fa-solid fa-pen-nib"></i>
                  {book.author ? (
                    <Link
                      to={`/author/${book.author.id || book.author._id}`}
                      className="author-tag-link"
                    >
                      {book.author.penName}
                    </Link>
                  ) : (
                    <span>{t('bookDetail.anonymousAuthor')}</span>
                  )}
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

              <div className="book-actions">
                {book.isVip ? (
                  <button className="neo-btn primary-action btn-vip" onClick={() => toast.info(t('bookDetail.paymentDev', 'Tính năng thanh toán đang được phát triển!'))}>
                    <i className="fa-solid fa-unlock-keyhole"></i> {t('bookDetail.unlockVip', { price: book.vipPrice || 0 })}
                  </button>
                ) : (
                  <button className="neo-btn primary-action" onClick={handleReadNow}>
                    <i className="fa-solid fa-book-reader"></i> {t('bookDetail.readFirst', 'Đọc Từ Đầu')}
                  </button>
                )}
                
                {book.chapters && book.chapters.length > 0 && (
                  <div 
                    className="chapter-dropdown-wrapper"
                    tabIndex={0} 
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setIsChapterDropdownOpen(false);
                      }
                    }}
                  >
                    <button 
                      className="neo-btn chapter-dropdown-btn"
                      onClick={() => setIsChapterDropdownOpen(!isChapterDropdownOpen)}
                      aria-expanded={isChapterDropdownOpen}
                      aria-haspopup="listbox"
                      aria-label={t('bookDetail.chooseChapter', 'Chọn chương')}
                    >
                      <span className="btn-text">{t('bookDetail.chooseChapter', 'Chọn chương...')}</span>
                      <i className={`fa-solid fa-chevron-${isChapterDropdownOpen ? 'up' : 'down'}`}></i>
                    </button>

                    {/* Custom Dropdown Menu */}
                    {isChapterDropdownOpen && (
                      <div 
                        className="chapter-dropdown-menu"
                        role="listbox"
                      >
                        {book.chapters.map(chapter => (
                          <button
                            key={chapter.id}
                            className="chapter-item-btn"
                            role="option"
                            aria-selected="false"
                            onClick={() => {
                              setIsChapterDropdownOpen(false);
                              if (book.isVip) {
                                toast.info(t('bookDetail.paymentDev', 'Tính năng thanh toán đang được phát triển!'));
                                return;
                              }
                              
                              const hasVi = !!chapter.pdfUrl || !!chapter.epubUrl;
                              const hasEn = !!chapter.pdfUrlEn || !!chapter.epubUrlEn;
                              
                              if (!hasVi && !hasEn) {
                                toast.info(t('bookDetail.noContentChapter', 'Chương này chưa có nội dung để đọc.'));
                                return;
                              }

                              showLanguageDialog(chapter);
                            }}
                          >
                            <div className="chapter-item-header">
                              <span className="chapter-number">{t('bookDetail.chapter')} {chapter.chapterNumber}</span>
                              <div className="chapter-lang-tags">
                                {(chapter.pdfUrl || chapter.epubUrl) && <span className="tag vi">VI</span>}
                                {(chapter.pdfUrlEn || chapter.epubUrlEn) && <span className="tag en">EN</span>}
                              </div>
                            </div>
                            {chapter.title && (
                              <span className="chapter-title">{chapter.title}</span>
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
          <div className="book-detail-bottom-section">
            <RatingSection bookId={book.id} />
          </div>
        </div>
      </main>
      <MaybeYouLike currentBook={book} />
      <Footer />
    </>
  );
}
