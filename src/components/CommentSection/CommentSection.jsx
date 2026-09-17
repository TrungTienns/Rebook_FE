import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { path } from '../../common/path';
import './CommentSection.scss';

export default function CommentSection({ bookId }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (!bookId) return;
    fetchComments();
  }, [bookId]);

  const fetchComments = async () => {
    try {
      const res = await userService.getCommentsByBook(bookId);
      if (res?.success) {
        setComments(res.data);
        localStorage.setItem(`viewed_comments_${bookId}`, res.data.length.toString());
      }
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async () => {
    if (!user) { toast.warning(t('commentSection.loginRequired')); return; }
    if (!newComment.trim()) { toast.warning(t('commentSection.emptyWarning')); return; }
    try {
      const res = await userService.createComment(bookId, newComment.trim());
      if (res?.success) {
        toast.success(t('commentSection.submitSuccess'));
        setNewComment('');
        fetchComments();
      }
    } catch { toast.error(t('commentSection.submitError')); }
  };

  const handleReply = async (parentId) => {
    if (!user) { toast.warning(t('commentSection.loginRequired')); return; }
    if (!replyText.trim()) return;
    try {
      const res = await userService.createComment(bookId, replyText.trim(), parentId);
      if (res?.success) {
        toast.success(t('commentSection.replySuccess'));
        setReplyText('');
        setReplyingTo(null);
        fetchComments();
      }
    } catch { toast.error(t('commentSection.replyError')); }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('commentSection.timeJustNow');
    if (mins < 60) return t('commentSection.timeMinutes', { count: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('commentSection.timeHours', { count: hours });
    const days = Math.floor(hours / 24);
    if (days < 30) return t('commentSection.timeDays', { count: days });
    return new Date(dateStr).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US');
  };

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  const CommentItem = ({ comment, isReply = false }) => (
    <div className={`comment-item ${isReply ? 'reply' : ''}`}>
      <div className="comment-header">
        <div className="user-info">
          <div className="avatar">
            {comment.user?.avatarUrl
              ? <img src={comment.user.avatarUrl} alt={comment.user.fullName} />
              : <i className="fa-solid fa-user" />}
          </div>
          <span className="username">
            {comment.user?.fullName || comment.user?.username || t('commentSection.anonymous')}
          </span>
          <span className="time">{timeAgo(comment.created_at)}</span>
        </div>

        {/* Reply button only — delete is handled server-side with auth guard */}
        {!isReply && user && (
          <div className="comment-actions">
            <button
              className="action-btn"
              title={t('commentSection.replyBtn')}
              onClick={() => {
                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                setReplyText('');
              }}
            >
              <i className="fa-solid fa-reply" />
            </button>
          </div>
        )}
      </div>

      <p className="comment-content">{comment.content}</p>

      {replyingTo === comment.id && (
        <div className="reply-form">
          <input
            type="text"
            placeholder={t('commentSection.replyPlaceholder', {
              name: comment.user?.fullName || comment.user?.username || t('commentSection.anonymous'),
            })}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleReply(comment.id)}
            autoFocus
          />
          <button className="neo-btn-sm primary" onClick={() => handleReply(comment.id)}>
            {t('commentSection.send')}
          </button>
        </div>
      )}

      {comment.replies?.length > 0 && (
        <div className="replies-list">
          {comment.replies.map(reply => <CommentItem key={reply.id} comment={reply} isReply />)}
        </div>
      )}
    </div>
  );

  return (
    <div className="comment-section">
      <h3>
        <i className="fa-solid fa-comments" /> {t('commentSection.title')} ({totalCount})
      </h3>

      {user ? (
        <div className="comment-input-box">
          <div className="avatar">
            {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <i className="fa-solid fa-user" />}
          </div>
          <input
            type="text"
            placeholder={t('commentSection.placeholder')}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <button className="send-btn" onClick={handleSubmit} title={t('commentSection.send')}>
            <i className="fa-solid fa-paper-plane" />
          </button>
        </div>
      ) : (
        <p className="login-prompt">
          <i className="fa-solid fa-lock" />{' '}
          <Link to={path.SIGN_IN}>{t('commentSection.login')}</Link>{' '}
          {t('commentSection.loginPrompt')}
        </p>
      )}

      {comments.length === 0 ? (
        <p className="empty-text">
          <i className="fa-regular fa-comments" />
          {t('commentSection.empty')}
        </p>
      ) : (
        <div className="comments-list">
          {comments.map(c => <CommentItem key={c.id} comment={c} />)}
        </div>
      )}
    </div>
  );
}
