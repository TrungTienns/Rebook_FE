import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../services/axiosClient';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PdfReaderPage.scss';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfReaderPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Reader states
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/books/${slug}`);
        if (res?.success) {
          setBookTitle(res.data.title);
          const chapters = res.data.chapters;
          if (chapters && chapters.length > 0 && chapters[0].pdfUrl) {
            setPdfUrl(chapters[0].pdfUrl);
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
  }, [slug]);

  const handleBack = () => {
    navigate(-1);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    setDirection(offset);
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.min(Math.max(newPage, 1), numPages || 1);
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

  if (error || !pdfUrl) {
    return (
      <div className="pdf-reader-status error">
        <i className="fa-solid fa-triangle-exclamation fa-3x"></i>
        <h2>Rất tiếc!</h2>
        <p>{error || t('pdfReader.pdfError')}</p>
        <button className="neo-btn" onClick={handleBack}>{t('pdfReader.back')}</button>
      </div>
    );
  }

  return (
    <div className="pdf-reader-page">
      <div className="reader-header">
        <button className="neo-btn back-btn" onClick={handleBack}>
          <i className="fa-solid fa-arrow-left"></i> <span>{t('pdfReader.back')}</span>
        </button>
        <h2 className="reader-title">{t('pdfReader.reading')} {bookTitle || slug}</h2>
      </div>
      
      <div className="pdf-container">
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
                  scale={1.0} 
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="neo-pdf-page"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </Document>
      </div>

      {numPages && (
        <div className="reader-footer">
          <button 
            className="neo-btn nav-btn" 
            onClick={previousPage} 
            disabled={pageNumber <= 1}
          >
            <i className="fa-solid fa-chevron-left"></i> {t('pdfReader.prevPage')}
          </button>
          <span className="page-info">
            {t('pdfReader.page')} <strong>{pageNumber}</strong> / {numPages}
          </span>
          <button 
            className="neo-btn nav-btn" 
            onClick={nextPage} 
            disabled={pageNumber >= numPages}
          >
            {t('pdfReader.nextPage')} <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}
