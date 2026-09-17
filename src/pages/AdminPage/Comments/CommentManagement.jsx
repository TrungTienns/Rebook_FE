import React, { useState, useEffect } from 'react';
import commentService from '../../../services/commentService';
import productService from '../../../services/productService';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import './CommentManagement.scss';

import CustomSearchableDropdown from '../../../components/CustomSearchableDropdown/CustomSearchableDropdown';

export default function CommentManagement() {
  const [comments, setComments] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterBookId, setFilterBookId] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBooks();
    fetchComments();
  }, [filterBookId, filterStatus]);

  const fetchBooks = async () => {
    try {
      const res = await productService.getAll();
      if (res?.success) {
        setBooks(res.data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterBookId) params.bookId = filterBookId;
      if (filterStatus !== 'all') params.status = filterStatus;

      const res = await commentService.getAllAdmin(params);
      if (res?.success) {
        setComments(res.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Không thể tải danh sách bình luận');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, currentStatus) => {
    if (currentStatus === 'deleted') {
      toast.info('Bình luận này đã bị xóa.');
      return;
    }

    Swal.fire({
      title: 'Xóa bình luận vĩnh viễn?',
      text: "Bình luận này sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu và không thể khôi phục.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý, Xóa',
      cancelButtonText: 'Hủy',
      customClass: {
        popup: 'neo-swal-popup',
        title: 'neo-swal-title',
        confirmButton: 'neo-swal-btn confirm',
        cancelButton: 'neo-swal-btn cancel'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await commentService.delete(id);
          if (res?.success) {
            toast.success('Đã xóa bình luận vĩnh viễn!');
            fetchComments(); // Reload danh sách
          }
        } catch (error) {
          toast.error('Lỗi khi xóa bình luận');
        }
      }
    });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await commentService.toggleStatus(id);
      if (res?.success) {
        toast.success(res.message);
        fetchComments();
      }
    } catch (error) {
      toast.error('Lỗi khi thay đổi trạng thái bình luận');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="admin-comment-container">
      <h2 className="admin-title">
        <i className="fa-solid fa-comments"></i> Quản Lý Bình Luận
      </h2>

      <div className="comment-filters neo-box">
        <div className="filter-group">
          <label>Lọc theo Sách:</label>
          <CustomSearchableDropdown 
            value={filterBookId}
            onChange={setFilterBookId}
            placeholder="-- Tất cả các sách --"
            searchable={true}
            icon="fa-solid fa-book"
            options={[
              { value: '', label: '-- Tất cả các sách --' },
              ...books.map(book => ({ value: book.id, label: book.title }))
            ]}
          />
        </div>
        
        <div className="filter-group">
          <label>Trạng thái:</label>
          <CustomSearchableDropdown 
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="-- Tất cả trạng thái --"
            searchable={false}
            icon="fa-solid fa-filter"
            options={[
              { value: 'all', label: '-- Tất cả trạng thái --' },
              { value: 'visible', label: 'Hiển thị (Visible)' },
              { value: 'hidden', label: 'Đã ẩn (Hidden)' },
              { value: 'deleted', label: 'Đã xóa (Deleted)' }
            ]}
          />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="neo-box list-box">
        <h3>Danh Sách Bình Luận</h3>
        
        {loading ? (
          <div className="loading-state"><i className="fa-solid fa-spinner fa-spin"></i> Đang tải...</div>
        ) : comments.length === 0 ? (
          <div className="empty-state">Không có bình luận nào phù hợp.</div>
        ) : (
          <div className="table-responsive">
            <table className="neo-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Người Dùng</th>
                  <th>Sách</th>
                  <th>Nội Dung</th>
                  <th>Ngày Đăng</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((comment) => (
                  <tr key={comment.id} className={comment.status === 'deleted' ? 'deleted-row' : ''}>
                    <td>#{comment.id}</td>
                    <td>
                      <div className="user-cell">
                        {comment.user?.avatarUrl ? (
                          <img src={comment.user.avatarUrl} alt="avatar" className="mini-avatar" />
                        ) : (
                          <div className="mini-avatar placeholder"><i className="fa-solid fa-user"></i></div>
                        )}
                        <div className="user-info">
                          <span className="user-name">{comment.user?.fullName || comment.user?.username || 'Unknown'}</span>
                          <span className="user-email">{comment.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="book-title">{comment.book?.title || 'Unknown Book'}</span></td>
                    <td>
                      <div className="comment-content-cell">
                        {comment.parentId && <span className="reply-badge">Trả lời #{comment.parentId}</span>}
                        {comment.content}
                      </div>
                    </td>
                    <td>{formatDate(comment.created_at)}</td>
                    <td>
                      <span className={`status-badge ${comment.status}`}>
                        {comment.status === 'visible' ? 'Hiển thị' : comment.status === 'deleted' ? 'Đã xóa' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`action-btn ${comment.status === 'hidden' ? 'view' : 'edit'}`} 
                        onClick={() => handleToggleStatus(comment.id, comment.status)} 
                        title={comment.status === 'hidden' ? 'Hiển thị bình luận' : 'Ẩn bình luận'}
                        style={{ marginRight: '8px' }}
                      >
                        <i className={`fa-solid ${comment.status === 'hidden' ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDelete(comment.id, comment.status)} 
                        title="Xóa vĩnh viễn bình luận"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
