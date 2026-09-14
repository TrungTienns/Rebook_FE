import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './RatingSection.scss';

export default function RatingSection({ bookId }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    fetchRatings();
    if (user) fetchMyRating();
  }, [bookId, user]);

  const fetchRatings = async () => {
    try {
      const res = await userService.getRatingsByBook(bookId);
      if (res?.success) setRatings(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMyRating = async () => {
    try {
      const res = await userService.getMyRating(bookId);
      if (res?.success && res.data) {
        setMyRating(res.data);
        setSelectedStar(res.data.stars);
        setReviewText(res.data.review || '');
      }
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async () => {
    if (!user) { toast.warning(t('ratingSection.loginRequired')); return; }
    if (selectedStar === 0) { toast.warning(t('ratingSection.starRequired')); return; }
    try {
      const res = await userService.submitRating(bookId, selectedStar, reviewText);
      if (res?.success) {
        toast.success(res.message);
        setShowForm(false);
        fetchRatings();
        fetchMyRating();
      }
    } catch {
      toast.error(t('ratingSection.submitError'));
    }
  };

  const avgRating = ratings.length
    ? (ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length).toFixed(1)
    : null;

  const totalRatings = ratings.length;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach(r => {
    if (distribution[r.stars] !== undefined) distribution[r.stars]++;
  });

  // starLabels is an array in the locale — t() returns it directly
  const starLabels = t('ratingSection.starLabels', { returnObjects: true });

  const renderStars = (count, interactive = false) =>
    [1, 2, 3, 4, 5].map(i => (
      <i
        key={i}
        className={`fa-star ${i <= (interactive ? (hoveredStar || selectedStar) : count) ? 'fa-solid' : 'fa-regular'}`}
        style={{
          color: i <= (interactive ? (hoveredStar || selectedStar) : count) ? '#FFC900' : '#ccc',
          cursor: interactive ? 'pointer' : 'default',
          fontSize: interactive ? '1.9rem' : '1rem',
          transition: 'all 0.15s',
        }}
        onMouseEnter={() => interactive && setHoveredStar(i)}
        onMouseLeave={() => interactive && setHoveredStar(0)}
        onClick={() => interactive && setSelectedStar(i)}
      />
    ));

  return (
    <div className="rating-section">
      {/* ── Header ── */}
      <div className="rating-header">
        <h3>
          <i className="fa-solid fa-star" /> {t('ratingSection.title')}
          {avgRating && (
            <span className="avg-badge">
              {avgRating} <i className="fa-solid fa-star" />
            </span>
          )}
        </h3>
        {user && (
          <button className="neo-btn-sm" onClick={() => setShowForm(!showForm)}>
            <i className={`fa-solid ${myRating ? 'fa-pen' : 'fa-plus'}`} />
            {myRating ? t('ratingSection.editBtn') : t('ratingSection.writeBtn')}
          </button>
        )}
      </div>

      {/* ── Write / Edit form ── */}
      {showForm && (
        <div className="rating-form">
          <div className="star-picker">
            <span>{t('ratingSection.chooseStar')}</span>
            <div className="stars">{renderStars(selectedStar, true)}</div>
            {selectedStar > 0 && (
              <span className="star-label">
                {Array.isArray(starLabels) ? starLabels[selectedStar] : ''}
              </span>
            )}
          </div>
          <textarea
            placeholder={t('ratingSection.reviewPlaceholder')}
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            rows={3}
          />
          <div className="form-actions">
            <button className="neo-btn-sm primary" onClick={handleSubmit}>
              <i className="fa-solid fa-paper-plane" /> {t('ratingSection.send')}
            </button>
            <button className="neo-btn-sm" onClick={() => setShowForm(false)}>
              {t('ratingSection.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* ── Rating Overview ── */}
      <div className="rating-overview neo-box">
        <div className="overview-left">
          <div className="big-avg">{avgRating || '0.0'}</div>
          <div className="stars-avg">{renderStars(Math.round(avgRating || 0))}</div>
          <div className="total-count">
            {totalRatings} {t('ratingSection.title')}
          </div>
        </div>
        
        <div className="overview-right">
          {[5, 4, 3, 2, 1].map(star => {
            const count = distribution[star];
            const percent = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
            return (
              <div key={star} className="dist-row">
                <span className="dist-star">{star} <i className="fa-solid fa-star" /></span>
                <div className="dist-bar-container">
                  <div className="dist-bar-fill" style={{ width: `${percent}%` }}></div>
                </div>
                <span className="dist-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Rating list ── */}
      {ratings.length > 0 && (
        <div className="rating-list">
          {ratings.map(r => (
            <div key={r.id} className="rating-item">
              <div className="rating-user">
                <div className="avatar">
                  {r.user?.avatarUrl
                    ? <img src={r.user.avatarUrl} alt={r.user.fullName} />
                    : <i className="fa-solid fa-user" />}
                </div>
                <div className="info">
                  <span className="username">
                    {r.user?.fullName || r.user?.username || t('ratingSection.anonymous')}
                    {user && r.userId === user.id && (
                      <span className="you-badge">{t('ratingSection.you')}</span>
                    )}
                  </span>
                  <div className="stars">{renderStars(r.stars)}</div>
                </div>
                <span className="date">
                  {new Date(r.created_at).toLocaleDateString(
                    i18n.language === 'vi' ? 'vi-VN' : 'en-US'
                  )}
                </span>
              </div>
              {r.review && <p className="review-text">{r.review}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
