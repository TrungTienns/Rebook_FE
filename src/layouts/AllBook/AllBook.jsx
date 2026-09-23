import {  useState, useEffect, useCallback  } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import { toast } from 'react-toastify';
import './AllBook.scss';

// Custom Dropdown Component for Cartoon UI
const CustomDropdown = ({ value, options, onChange, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="custom-dropdown" onClick={() => setIsOpen(!isOpen)}>
      <div className="dropdown-selected">
        <i className={icon}></i>
        <span>{selectedOption.label}</span>
        <i className={`fa-solid fa-chevron-down toggle-icon ${isOpen ? 'open' : ''}`}></i>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="dropdown-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {options.map(opt => (
              <div 
                key={opt.value} 
                className={`dropdown-item ${opt.value === value ? 'active' : ''}`}
                onClick={() => onChange(opt.value)}
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function AllBook() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States cho bộ lọc
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [activeType, setActiveType] = useState(searchParams.get('type') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;
  
  // Voice search state
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryService.getAll();
      if (res?.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (debouncedSearch) params.q = debouncedSearch;
      if (activeCategory !== 'all') params.category = activeCategory;
      if (activeType !== 'all') params.type = activeType;
      if (sortBy !== 'newest') params.sort = sortBy;
      
      const res = await productService.getAll(params);
      if (res?.success) {
        setBooks(res.data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeCategory, activeType, sortBy]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t('library.voiceNotSupported', 'Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói.'));
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = i18n.language === 'en' ? 'en-US' : 'vi-VN';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
      toast.error(t('library.voiceError', 'Có lỗi xảy ra khi nghe.'));
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // Cắt bỏ dấu chấm cuối câu nếu có do Google Speech
      setSearchTerm(transcript.replace(/\.$/, ''));
    };
    
    if (isListening) {
      // Vì không thể lưu lại instance của recognition cũ dễ dàng (trừ khi dùng useRef), 
      // ta set false để UI cập nhật (nó sẽ tự stop do onend hoặc timeout)
      setIsListening(false);
    } else {
      recognition.start();
    }
  };

useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBooks();
    // Reset page to 1 when filters change
    setCurrentPage(1);
    
    // Update URL params
    const params = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (activeCategory !== 'all') params.category = activeCategory;
    if (activeType !== 'all') params.type = activeType;
    if (sortBy !== 'newest') params.sort = sortBy;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, activeCategory, activeType, sortBy, fetchBooks, setSearchParams]);


  // Pagination logic
  const totalPages = Math.ceil(books.length / itemsPerPage);
  const indexOfLastBook = currentPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Cuộn lên đầu thư viện khi chuyển trang
    if (window.lenis) {
      window.lenis.scrollTo('.library-page', { offset: -100, duration: 1 });
    } else {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <main className="library-page">
      <div className="container">
        
        <div className="library-header">
          <h1 className="title-cartoon">
            <span className="highlight">{t('library.titlePart1')}</span> {t('library.titlePart2')}
          </h1>
          <p className="subtitle">{t('library.subtitle')}</p>
        </div>

        <div className="library-layout">
          <aside className="filter-sidebar">
            <div className="filter-section neo-box">
              <div className="filter-controls">
                <div className="filter-group">
                  <label><i className="fa-solid fa-arrow-down-a-z"></i> {t('library.sortBy')}</label>
                  <CustomDropdown 
                    value={sortBy}
                    onChange={setSortBy}
                    icon="fa-solid fa-sort"
                    options={[
                      { value: 'newest', label: t('library.sortNewest') },
                      { value: 'oldest', label: t('library.sortOldest') },
                      { value: 'a-z', label: t('library.sortAZ') }
                    ]}
                  />
                </div>

                <div className="filter-group">
                  <label><i className="fa-solid fa-tags"></i> {t('library.filterCategory')}</label>
                  <CustomDropdown 
                    value={activeCategory}
                    onChange={setActiveCategory}
                    icon="fa-solid fa-list"
                    options={[
                      { value: 'all', label: t('library.filterAllCategories') },
                      ...categories.map(cat => ({ value: cat.slug, label: cat.name }))
                    ]}
                  />
                </div>

                <div className="filter-group">
                  <label><i className="fa-solid fa-book-open"></i> {t('library.filterType')}</label>
                  <CustomDropdown 
                    value={activeType}
                    onChange={setActiveType}
                    icon="fa-solid fa-filter"
                    options={[
                      { value: 'all', label: t('library.typeAll') },
                      { value: 'free', label: t('library.typeFree') },
                      { value: 'vip', label: t('library.typeVip') }
                    ]}
                  />
                </div>
              </div>

              <div className={`search-bar ${isListening ? 'listening' : ''}`}>
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                <input 
                  type="text" 
                  placeholder={isListening ? 'Đang nghe...' : t('library.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  className={`voice-btn ${isListening ? 'active' : ''}`} 
                  onClick={handleVoiceSearch}
                  title="Tìm kiếm bằng giọng nói"
                >
                  <i className={`fa-solid ${isListening ? 'fa-microphone-lines fa-fade' : 'fa-microphone'}`}></i>
                </button>
              </div>
            </div>
          </aside>

        <div className="library-content">
          {loading ? (
            <div className="loading-state">
              <i className="fa-solid fa-spinner fa-spin"></i>
            </div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><i className="fa-solid fa-box-open"></i></div>
              <p>{t('library.noResults')}</p>
              <button 
                className="btn-cartoon"
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                  setActiveType('all');
                  setSortBy('newest');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <motion.div 
              className="books-grid"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              <AnimatePresence>
                {currentBooks.map((book) => (
                  <motion.div 
                    key={book.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                  >
                    <Link to={`/book/${book.slug}`} className="book-card-neo">
                      <div className="book-cover-wrapper">
                        {book.isVip || book.is_vip ? (
                          <div className="vip-badge"><i className="fa-solid fa-crown"></i></div>
                        ) : (
                          <div className="free-badge">FREE</div>
                        )}
                        
                        {book.coverImageUrl || book.cover_image_url ? (
                          <img src={book.coverImageUrl || book.cover_image_url} alt={book.title} loading="lazy" />
                        ) : (
                          <div className="no-cover">
                            <i className="fa-solid fa-image"></i>
                          </div>
                        )}
                        
                        <div className="hover-action">
                          <span className="btn-cartoon-sm">{t('library.readNow')}</span>
                        </div>
                      </div>
                      <div className="book-info">
                        <h3 className="book-title" title={book.title}>{book.title}</h3>
                        <p className="book-author">
                          <i className="fa-solid fa-pen-nib"></i> {book.author?.penName || t('bookDetail.anonymousAuthor')}
                        </p>
                        <div className="book-stats">
                          <span><i className="fa-solid fa-eye"></i> {book.totalViews || book.total_views || 0}</span>
                          <span><i className="fa-solid fa-star"></i> {book.avgRating || book.avg_rating || 0}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Render Pagination controls if not loading and totalPages > 1 */}
          {!loading && totalPages > 1 && (
            <div className="pagination-container">
              <button 
                className="pagination-btn neo-btn-sm" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              
              <div className="pagination-pages">
                {[...Array(totalPages)].map((_, idx) => {
                  const page = idx + 1;
                  // Chỉ hiển thị tối đa 5 trang (đơn giản hóa: xung quanh trang hiện tại)
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button 
                        key={page}
                        className={`pagination-btn neo-btn-sm ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="pagination-ellipsis">...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                className="pagination-btn neo-btn-sm" 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
        </div>

      </div>
    </main>
  );
}
