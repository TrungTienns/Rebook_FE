import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../services/axiosClient';
import { Document, Page, pdfjs } from 'react-pdf';
import { ReactReader, ReactReaderStyle } from 'react-reader';
import { motion, AnimatePresence } from 'framer-motion';
import CommentSection from '../../components/CommentSection/CommentSection';
import userService from '../../services/userService';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PdfReaderPage.scss';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfReaderPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lang = searchParams.get('lang') || 'vi'; // Default is Vietnamese
  const chapterQuery = searchParams.get('chapter') || '1';
  
  const [pdfUrl, setPdfUrl] = useState('');
  const [epubUrl, setEpubUrl] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTurning, setIsTurning] = useState(false);
  
  const [scale, setScale] = useState(1.0);
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.4));

  const [bookId, setBookId] = useState(null);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [hasNewComments, setHasNewComments] = useState(false);
  
  // Reader states
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [direction, setDirection] = useState(0);
  const [location, setLocation] = useState(null); // For EPUB
  const renditionRef = React.useRef(null);
  const [epubPercentage, setEpubPercentage] = useState(0);

  const containerRef = React.useRef();

  // Storage key for saving progress
  const progressKey = `reading_progress_${slug}_ch${chapterQuery}_${lang}`;

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/books/${slug}`);
        if (res?.success) {
          const chapters = res.data.chapters;
          const targetChapterNum = parseInt(chapterQuery, 10);
          
          if (res.data.isVip === true || res.data.isVip === 'true') {
            setError(t('pdfReader.vipError', 'Đây là sách VIP. Tính năng thanh toán đang phát triển nên bạn chưa thể đọc.'));
            setLoading(false);
            return;
          }

          if (chapters && chapters.length > 0) {
              setBookId(res.data.id);
              const currentChapter = chapters.find(c => c.chapterNumber === targetChapterNum) || chapters[0];
              setBookTitle(`${lang === 'en' && res.data.titleEn ? res.data.titleEn : res.data.title} - ${t('bookDetail.chapter', 'Chương')} ${currentChapter.chapterNumber}`);
              let targetPdf = null;
            let targetEpub = null;
            
            if (lang === 'en') {
              targetPdf = currentChapter.pdfUrlEn;
              targetEpub = currentChapter.epubUrlEn;
            } else {
              targetPdf = currentChapter.pdfUrl;
              targetEpub = currentChapter.epubUrl;
            }

            // Fallback logic
            if (!targetEpub && !targetPdf) {
              targetEpub = currentChapter.epubUrl || currentChapter.epubUrlEn;
              targetPdf = currentChapter.pdfUrl || currentChapter.pdfUrlEn;
            }

            if (targetEpub) {
              setEpubUrl(targetEpub);
              setPdfUrl('');
              const savedProgress = localStorage.getItem(progressKey);
              if (savedProgress && savedProgress.includes('epubcfi')) {
                setLocation(savedProgress);
              }
            } else if (targetPdf) {
              setPdfUrl(targetPdf);
              setEpubUrl('');
              const savedProgress = localStorage.getItem(progressKey);
              if (savedProgress && !savedProgress.includes('epubcfi')) {
                setPageNumber(parseInt(savedProgress, 10) || 1);
              }
            } else {
              setError(t('pdfReader.pdfError'));
            }
          } else {
            setError(t('pdfReader.pdfError'));
          }
        } else {
          setError(t('pdfReader.pdfError'));
        }
      } catch (err) {
        console.error(err);
        setError(t('pdfReader.pdfError'));
      } finally {
        setLoading(false);
      }
    };
    fetchPdf();
  }, [slug, lang, chapterQuery]);

  useEffect(() => {
    if (bookId) {
      userService.getCommentsByBook(bookId).then(res => {
        if (res?.success) {
           const count = res.data.length;
           const lastViewed = parseInt(localStorage.getItem(`viewed_comments_${bookId}`) || '0', 10);
           if (count > lastViewed) setHasNewComments(true);
        }
      }).catch(err => console.error(err));
    }
  }, [bookId]);

  const handleBack = () => {
    navigate(-1);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    
    // Khôi phục trang đã đọc từ LocalStorage
    const savedPage = localStorage.getItem(progressKey);
    if (savedPage) {
      const parsed = parseInt(savedPage, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= numPages) {
        setPageNumber(parsed);
      } else {
        setPageNumber(1);
      }
    } else {
      setPageNumber(1);
    }
  };

  const changePage = (offset) => {
    setDirection(offset);
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      const validPage = Math.min(Math.max(newPage, 1), numPages || 1);
      
      // Scroll to top of PDF reader box when changing page for better UX
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      return validPage;
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const pageVariants = {
    enter: (direction) => {
      return {
        x: direction > 0 ? 50 : -50,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 50 : -50,
        opacity: 0
      };
    }
  };

  // Thêm sự kiện bàn phím
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      
      if (e.key === 'ArrowRight') {
        changePage(1);
      } else if (e.key === 'ArrowLeft') {
        changePage(-1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages]);

  if (loading) {
    return (
      <div className="pdf-reader-status">
        <i className="fa-solid fa-spinner fa-spin fa-3x"></i>
        <p>{t('pdfReader.loadingPdf')}</p>
      </div>
    );
  }

  if (error || (!pdfUrl && !epubUrl)) {
    return (
      <div className="pdf-reader-status error">
        <i className="fa-solid fa-triangle-exclamation fa-3x"></i>
        <h2>{t('pdfReader.oops', 'Rất tiếc!')}</h2>
        <p>{error || t('pdfReader.pdfError')}</p>
        <button className="neo-btn" onClick={handleBack}>{t('pdfReader.back')}</button>
      </div>
    );
  }

  const handleEpubLocationChanged = (epubcifi) => {
    if (location !== epubcifi) {
      setIsTurning(true);
      setTimeout(() => setIsTurning(false), 300);
    }
    setLocation(epubcifi);
    localStorage.setItem(progressKey, epubcifi);

    if (renditionRef.current && renditionRef.current.book.locations.length() > 0) {
      const percentage = renditionRef.current.book.locations.percentageFromCfi(epubcifi);
      setEpubPercentage(Math.round(percentage * 100));
    }
  };

  const epubNext = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  const epubPrev = () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

  return (
    <div className="pdf-reader-page">
      <div className="reader-header">
        <button className="neo-btn back-btn" onClick={handleBack}>
          <i className="fa-solid fa-arrow-left"></i> <span>{t('pdfReader.back')}</span>
        </button>
        <h2 className="reader-title">{t('pdfReader.reading')} {bookTitle || slug}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!epubUrl && (
            <>
              <button className="neo-btn back-btn" onClick={zoomOut} title="Thu nhỏ" style={{ background: '#ff90e8' }}>
                <i className="fa-solid fa-magnifying-glass-minus"></i>
              </button>
              <button className="neo-btn back-btn" onClick={zoomIn} title="Phóng to" style={{ background: '#ff90e8' }}>
                <i className="fa-solid fa-magnifying-glass-plus"></i>
              </button>
            </>
          )}
          <button 
            className="neo-btn back-btn" 
            onClick={() => {
              setIsCommentDrawerOpen(true);
              setHasNewComments(false);
            }}
            style={{ background: '#ffde59', position: 'relative' }}
          >
            {hasNewComments && <span className="notification-dot"></span>}
            <i className="fa-solid fa-comments"></i> <span>Bình luận</span>
          </button>
        </div>
      </div>
      
      <div 
        className={`pdf-container ${epubUrl ? 'epub-mode' : ''}`} 
        ref={containerRef}
        style={{ 
          overflow: epubUrl ? 'hidden' : 'auto', 
          padding: epubUrl ? 0 : '1.5rem',
          display: epubUrl ? 'block' : 'flex'
        }}
      >
        {epubUrl ? (
          <div className={`epub-reader-wrapper ${isTurning ? 'is-turning' : ''}`} style={{ height: '100%', width: '100%', position: 'relative', transition: 'all 0.3s ease' }}>
            <ReactReader
              url={epubUrl}
              location={location}
              locationChanged={handleEpubLocationChanged}
              epubInitOptions={{
                openAs: 'epub'
              }}
              readerStyles={{
                ...ReactReaderStyle,
                tocArea: {
                  ...ReactReaderStyle.tocArea,
                  background: '#fdfbf7',
                  borderRight: '4px solid #1a1a1a',
                  boxShadow: '5px 0 0px #1a1a1a'
                },
                tocButton: {
                  ...ReactReaderStyle.tocButton,
                  background: '#ffde59',
                  border: '3px solid #1a1a1a',
                  borderRadius: '8px',
                  boxShadow: '3px 3px 0px #1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px'
                },
                tocButtonExpanded: {
                  ...ReactReaderStyle.tocButtonExpanded,
                  background: '#fdfbf7',
                },
                tocButtonBar: {
                  ...ReactReaderStyle.tocButtonBar,
                  background: '#1a1a1a'
                },
                tocButtonBarTop: {
                  ...ReactReaderStyle.tocButtonBarTop,
                  background: '#1a1a1a'
                },
                tocButtonBottom: {
                  ...ReactReaderStyle.tocButtonBottom,
                  background: '#1a1a1a'
                },
                arrow: {
                  display: 'none'
                }
              }}
              getRendition={(rendition) => {
                renditionRef.current = rendition;
                // Generate locations for percentage calculation
                rendition.book.ready.then(() => {
                  rendition.book.locations.generate(1600).then(() => {
                    if (location) {
                      const percentage = rendition.book.locations.percentageFromCfi(location);
                      setEpubPercentage(Math.round(percentage * 100));
                    }
                  });
                });
                
                if (rendition) {
                  rendition.themes.default({
                    'body': { background: '#fdfbf7 !important', color: '#1a1a1a !important' },
                    'p': { 'font-family': 'Fredoka, sans-serif !important', 'font-size': '1.2rem !important', 'line-height': '1.8 !important' }
                  });
                }
              }}
            />
          </div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="pdf-reader-status">
                <i className="fa-solid fa-spinner fa-spin fa-3x"></i>
                <p>{t('pdfReader.loadingPdf')}</p>
              </div>
            }
            error={
              <div className="pdf-reader-status error">
                <i className="fa-solid fa-triangle-exclamation fa-3x"></i>
                <p>{t('pdfReader.pdfError')}</p>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="neo-btn">{t('pdfReader.downloadPdf')}</a>
              </div>
            }
          >
            <div className="pdf-page-wrapper">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={pageNumber}
                  custom={direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    scale={scale} 
                    devicePixelRatio={Math.min(window.devicePixelRatio || 1, 2)}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="neo-pdf-page"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </Document>
        )}
      </div>

      {(epubUrl || numPages) && (
        <div className="reader-footer">
          <button 
            className="neo-btn nav-btn" 
            onClick={epubUrl ? epubPrev : previousPage} 
            disabled={!epubUrl && pageNumber <= 1}
          >
            <i className="fa-solid fa-chevron-left"></i> {t('pdfReader.prevPage')}
          </button>
          <span className="page-info">
            {epubUrl ? (
              <span>Tiến độ: <strong>{epubPercentage}%</strong></span>
            ) : (
              <>{t('pdfReader.page')} <strong>{pageNumber}</strong> / {numPages}</>
            )}
          </span>
          <button 
            className="neo-btn nav-btn" 
            onClick={epubUrl ? epubNext : nextPage} 
            disabled={!epubUrl && pageNumber >= numPages}
          >
            {t('pdfReader.nextPage')} <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}
      
      <AnimatePresence>
        {isCommentDrawerOpen && (
          <div className="comment-drawer-overlay" onClick={() => setIsCommentDrawerOpen(false)}>
            <motion.div 
              className="comment-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()} // Prevent clicking inside drawer from closing it
            >
              <div className="drawer-header">
                <h3><i className="fa-solid fa-comments"></i> Thảo luận</h3>
                <button className="close-btn" onClick={() => setIsCommentDrawerOpen(false)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="drawer-content">
                {bookId && <CommentSection bookId={bookId} />}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
