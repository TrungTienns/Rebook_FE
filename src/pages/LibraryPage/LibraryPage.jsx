import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../../layouts/Header/Header';
import Footer from '../../layouts/Footer/Footer';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import './LibraryPage.scss';

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

export default function LibraryPage() {
  const { t } = useTranslation();
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

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
    // Update URL params
    const params = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (activeCategory !== 'all') params.category = activeCategory;
    if (activeType !== 'all') params.type = activeType;
    if (sortBy !== 'newest') params.sort = sortBy;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, activeCategory, activeType, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      if (res?.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        category: activeCategory,
        type: activeType,
        sort: sortBy,
        q: debouncedSearch
      };
      const res = await productService.getAll(params);
      if (res?.success) {
        setBooks(res.data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      
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

                <div className="search-bar">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <input 
                    type="text" 
                    placeholder={t('library.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
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
                  {books.map((book) => (
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
          </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}