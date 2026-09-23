import {  useState, useEffect  } from 'react';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './FavoriteButton.scss';
import { useTranslation } from 'react-i18next';

export default function FavoriteButton({ bookId, size = 'medium' }) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (user && bookId) {
      let cancelled = false;
      userService.checkFavorite(bookId)
        .then(res => { if (!cancelled && res?.success) setIsFavorited(res.isFavorited); })
        .catch(() => {});
      return () => { cancelled = true; };
    }
  }, [user, bookId]);

  const handleToggle = async () => {
    if (!user) {
      toast.warning(t('favoriteButton.loginRequired'));
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const res = await userService.toggleFavorite(bookId);
      if (res?.success) {
        setIsFavorited(res.isFavorited);
        toast.success(res.message);
      }
    } catch {
      toast.error(t('favoriteButton.toggleError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`favorite-btn ${isFavorited ? 'active' : ''} ${size}`}
      onClick={handleToggle}
      disabled={loading}
      title={isFavorited ? t('favoriteButton.unfavorite') : t('favoriteButton.favorite')}
    >
      <i className={`fa-${isFavorited ? 'solid' : 'regular'} fa-heart`}></i>
      {size !== 'small' && <span>{isFavorited ? t('favoriteButton.favorited') : t('favoriteButton.favorite')}</span>}
    </button>
  );
}
