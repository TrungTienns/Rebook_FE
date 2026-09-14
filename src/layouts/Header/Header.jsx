import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { path } from '../../common/path';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import 'flag-icons/css/flag-icons.min.css';
import './Header.scss';
import Logo from '../../components/Logo/Logo';
import SearchModal from '../../components/SearchModal/SearchModal';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    const next = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(next);
  };

  return (
    <header className="cartoon-header">
      <div className="header-container">
        <Logo variant="header" />
        
        {/* Mobile Menu Toggle Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✖' : '☰'}
        </button>
        
        <nav className={`nav-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to={path.HOME} className={`nav-link ${location.pathname === path.HOME ? 'active' : ''}`}>{t('header.home')}</Link>
          <Link to={path.EXPLORE} className={`nav-link ${location.pathname.startsWith(path.EXPLORE) ? 'active' : ''}`}>{t('header.explore')}</Link>
          <Link to={path.MY_LIBRARY} className={`nav-link ${location.pathname.startsWith(path.MY_LIBRARY) ? 'active' : ''}`}>{t('header.library')}</Link>
          <a href="#community" className="nav-link">{t('header.community')}</a>
        </nav>

        <div className="header-actions">
          {/* Language Toggle Pill */}
          <div className="lang-toggle">
            <button
              className={`lang-option ${i18n.language === 'vi' ? 'active' : ''}`}
              onClick={() => i18n.changeLanguage('vi')}
            >
              <span className="fi fi-vn"></span> VI
            </button>
            <button
              className={`lang-option ${i18n.language === 'en' ? 'active' : ''}`}
              onClick={() => i18n.changeLanguage('en')}
            >
              <span className="fi fi-us"></span> EN
            </button>
          </div>

          <div className="search-wrapper" style={{ position: 'relative' }}>
            <button className="btn-search" onClick={() => setIsSearchOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          </div>
          
          {user ? (
            <div className="user-profile-container" ref={dropdownRef}>
              <div 
                className={`user-profile-pill ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="avatar-wrapper">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName || user.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      {(user.fullName || user.username || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.fullName || user.username}</span>
                  <i className={`fa-solid fa-chevron-down dropdown-icon ${isDropdownOpen ? 'open' : ''}`}></i>
                </div>
              </div>

              {isDropdownOpen && (
                <div className="user-dropdown-menu">
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    <i className="fa-solid fa-user"></i> {t('header.myProfile')}
                  </Link>
                  <Link to="/purchase" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    <i className="fa-solid fa-bag-shopping"></i> {t('header.myPurchase')}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <i className="fa-solid fa-shield-halved"></i> {t('header.adminDashboard')}
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button onClick={() => {
                    setIsDropdownOpen(false);
                    Swal.fire({
                      title: t('header.logoutConfirmTitle'),
                      text: t('header.logoutConfirmText'),
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonText: t('header.logoutConfirmBtn'),
                      cancelButtonText: t('header.logoutCancelBtn'),
                      customClass: {
                        popup: 'neo-popup',
                        confirmButton: 'neo-btn-swal neo-btn-danger',
                        cancelButton: 'neo-btn-swal neo-btn-cancel'
                      },
                      buttonsStyling: false
                    }).then((result) => {
                      if (result.isConfirmed) {
                        logout();
                      }
                    });
                  }} className="dropdown-item logout-btn">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i> {t('header.logoutText')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to={path.SIGN_IN} className="btn-primary" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {t('header.signIn')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}