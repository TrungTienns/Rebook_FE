import {  useState, useRef, useEffect  } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { path } from '../../common/path';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import 'flag-icons/css/flag-icons.min.css';
import './Header.scss';
import Logo from '../../components/Logo/Logo';
import SearchModal from '../../components/SearchModal/SearchModal';
import notificationService from '../../services/notificationService';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      if (res?.success) setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchNotifications();
      // Poll notifications every 30 seconds to show red dot in near real-time
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await notificationService.deleteNotification(id);
      if (res?.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };


  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const seconds = Math.round((new Date() - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return 'Vài giây trước';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
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
          <Link to="/categories" className={`nav-link ${location.pathname.startsWith('/categories') ? 'active' : ''}`}>{t('header.categories')}</Link>
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
            <div className="user-section">
              {/* Notifications */}
              <div className="notif-wrapper" ref={notifRef}>
                <button className={`btn-notif ${unreadCount > 0 ? 'has-unread' : ''}`} onClick={() => setIsNotifOpen(!isNotifOpen)}>
                  <i className="fa-solid fa-bell"></i>
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                </button>

                {isNotifOpen && (
                  <div className="notif-dropdown neo-box">
                    <div className="notif-header">
                      <h3>Thông báo</h3>
                      {unreadCount > 0 && (
                        <button className="mark-read-btn" onClick={handleMarkAllRead}>Đánh dấu đã đọc</button>
                      )}
                    </div>
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">Chưa có thông báo nào.</div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                            onClick={() => {
                              if (!notif.isRead) handleMarkAsRead(notif.id);
                            }}
                          >
                            <div className="notif-icon">
                              {notif.type === 'system' && <i className="fa-solid fa-circle-info text-blue"></i>}
                              {notif.type === 'promotion' && <i className="fa-solid fa-tag text-yellow"></i>}
                              {notif.type === 'new_book' && <i className="fa-solid fa-book-open text-green"></i>}
                            </div>
                            <div className="notif-content">
                              <h4>{notif.title}</h4>
                              <p>{notif.message}</p>
                              {notif.link && (
                                <Link to={notif.link} className="notif-link">Xem chi tiết</Link>
                              )}
                              <div className="notif-meta">
                                <span className="notif-time">{timeAgo(notif.created_at)}</span>
                                <button className="delete-notif-btn" onClick={(e) => handleDeleteNotif(e, notif.id)} title="Xóa thông báo">
                                  <i className="fa-solid fa-trash-can"></i>
                                </button>
                              </div>
                            </div>
                            {!notif.isRead && <div className="unread-dot"></div>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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