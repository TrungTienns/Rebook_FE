import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import authorService from '../../services/authorService';
import Header from '../../layouts/Header/Header';
import Footer from '../../layouts/Footer/Footer';
import { motion } from 'framer-motion';
import './AuthorPage.scss';

export default function AuthorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        setLoading(true);
        const authorRes = await authorService.getById(id);
        if (authorRes?.success) {
          setAuthor(authorRes.data);
          // Books are now bundled inside the author response
          setBooks(authorRes.data?.books || []);
        } else {
          setError('Không tìm thấy tác giả.');
        }
      } catch {
        setError('Lỗi khi tải thông tin tác giả.');
      } finally {
        setLoading(false);
      }
    };
    fetchAuthor();
  }, [id]);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const res = await authorService.getFollowStatus(id);
        if (res?.success) setIsFollowing(res.data?.isFollowing ?? false);
      } catch { /* not authenticated */ }
    };
    if (id) fetchFollowStatus();
  }, [id]);

  const handleToggleFollow = async () => {
    try {
      setFollowLoading(true);
      const res = await authorService.toggleFollow(id);
      if (res?.success) setIsFollowing(res.data?.isFollowing ?? !isFollowing);
    } catch { /* not authenticated */ }
    finally { setFollowLoading(false); }
  };

  if (loading) return (
    <>
      <Header />
      <div className="author-page-loading">
        <i className="fa-solid fa-spinner fa-spin" /><span>Đang tải...</span>
      </div>
      <Footer />
    </>
  );

  if (error || !author) return (
    <>
      <Header />
      <div className="author-page-error">
        <i className="fa-solid fa-circle-exclamation" />
        <p>{error || 'Không tìm thấy tác giả.'}</p>
        <button className="neo-btn" onClick={() => navigate(-1)}>Quay lại</button>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <main className="author-page">
        <motion.section
          className="author-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="author-avatar-wrap">
            {author.avatarUrl ? (
              <img src={author.avatarUrl} alt={author.penName} className="author-avatar" />
            ) : (
              <div className="author-avatar-placeholder">
                <i className="fa-solid fa-user-pen" />
              </div>
            )}
          </div>

          <div className="author-info">
            <h1 className="author-name">{author.penName}</h1>
            {author.realName && <p className="author-realname"><i className="fa-solid fa-id-card" /> {author.realName}</p>}
            {author.nationality && <p className="author-nationality"><i className="fa-solid fa-earth-asia" /> {author.nationality}</p>}
            {author.birthYear && (
              <p className="author-birth">
                <i className="fa-solid fa-cake-candles" /> {author.birthYear}
                {author.deathYear ? ` – ${author.deathYear}` : ''}
              </p>
            )}
            {author.bio && <div className="author-bio"><p>{author.bio}</p></div>}

            <button
              className={`neo-btn follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleToggleFollow}
              disabled={followLoading}
            >
              <i className={`fa-solid fa-${isFollowing ? 'user-check' : 'user-plus'}`} />
              {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
            </button>
          </div>
        </motion.section>

        <section className="author-books-section">
          <h2 className="author-books-title">
            <i className="fa-solid fa-book-open-reader" /> Tác phẩm ({books.length})
          </h2>

          {books.length === 0 ? (
            <div className="author-no-books">
              <i className="fa-solid fa-book-open" />
              <p>Chưa có tác phẩm nào.</p>
            </div>
          ) : (
            <div className="author-books-grid">
              {books.map((book) => (
                <motion.div
                  key={book.id || book._id}
                  className="author-book-card neo-box"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/book/${book.slug}`} className="author-book-link">
                    <div className="author-book-cover">
                      {book.coverImageUrl ? (
                        <img src={book.coverImageUrl} alt={book.title} />
                      ) : (
                        <div className="no-cover"><i className="fa-solid fa-book fa-2x" /></div>
                      )}
                      {book.isVip && <span className="vip-badge"><i className="fa-solid fa-crown" /> VIP</span>}
                    </div>
                    <div className="author-book-info">
                      <h3 className="author-book-title">{book.title}</h3>
                      {book.categories?.length > 0 && (
                        <p className="author-book-cats">{book.categories.map((c) => c.name).join(' · ')}</p>
                      )}
                      <div className="author-book-stats">
                        <span><i className="fa-solid fa-eye" /> {book.totalViews || 0}</span>
                        <span><i className="fa-solid fa-star" /> {book.avgRating || '0.0'}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
