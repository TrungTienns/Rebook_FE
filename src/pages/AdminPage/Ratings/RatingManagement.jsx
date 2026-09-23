import {  useState, useEffect, useCallback  } from 'react';
import ratingService from '../../../services/ratingService';
import productService from '../../../services/productService';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import './RatingManagement.scss';

import CustomSearchableDropdown from '../../../components/CustomSearchableDropdown/CustomSearchableDropdown';

export default function RatingManagement() {
  const [ratings, setRatings] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterBookId, setFilterBookId] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchBooks = useCallback(async () => {
    try {
      const res = await productService.getAll();
      if (res?.success) {
        setBooks(res.data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  }, []);

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterBookId) params.bookId = filterBookId;
      if (filterStatus !== 'all') params.status = filterStatus;

      const res = await ratingService.getAllAdmin(params);
      if (res?.success) {
        setRatings(res.data);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  }, [filterBookId, filterStatus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBooks();
    fetchRatings();
  }, [filterBookId, filterStatus, fetchBooks, fetchRatings]);

  const handleDelete = (id, currentStatus) => {
    if (currentStatus === 'deleted') {
      toast.info('Đánh giá này đã bị xóa.');
      return;
    }

    Swal.fire({
      title: 'Xóa đánh giá vĩnh viễn?',
      text: "Đánh giá này sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu và không thể khôi phục.",
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
          const res = await ratingService.delete(id);
          if (res?.success) {
            toast.success('Đã xóa đánh giá vĩnh viễn!');
            fetchRatings(); // Reload danh sách
          }
        } catch {
          toast.error('Lỗi khi xóa đánh giá');
        }
      }
    });
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await ratingService.toggleStatus(id);
      if (res?.success) {
        toast.success(res.message);
        fetchRatings();
      }
    } catch {
      toast.error('Lỗi khi thay đổi trạng thái đánh giá');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="admin-rating-container">
      <h2 className="admin-title">
        <i className="fa-solid fa-star"></i> Quản Lý Đánh Giá
      </h2>

      <div className="rating-filters neo-box">
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
        <h3>Danh Sách Đánh Giá</h3>
        
        {loading ? (
          <div className="loading-state"><i className="fa-solid fa-spinner fa-spin"></i> Đang tải...</div>
        ) : ratings.length === 0 ? (
          <div className="empty-state">Không có đánh giá nào phù hợp.</div>
        ) : (
          <div className="table-responsive">
            <table className="neo-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Người Dùng</th>
                  <th>Sách</th>
                  <th>Số Sao</th>
                  <th>Nội Dung</th>
                  <th>Ngày Đăng</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((rating) => (
                  <tr key={rating.id} className={rating.status === 'deleted' ? 'deleted-row' : ''}>
                    <td>#{rating.id}</td>
                    <td>
                      <div className="user-cell">
                        {rating.user?.avatarUrl ? (
                          <img src={rating.user.avatarUrl} alt="avatar" className="mini-avatar" />
                        ) : (
                          <div className="mini-avatar placeholder"><i className="fa-solid fa-user"></i></div>
                        )}
                        <div className="user-info">
                          <span className="user-name">{rating.user?.fullName || rating.user?.username || 'Unknown'}</span>
                          <span className="user-email">{rating.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="book-title">{rating.book?.title || 'Unknown Book'}</span></td>
                    <td>
                      <div className="stars">
                        {[...Array(5)].map((_, index) => (
                          <i key={index} className={`fa-star ${index < rating.stars ? 'fa-solid' : 'fa-regular'}`} style={{ color: '#FFD700' }}></i>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="rating-content-cell">
                        {rating.review || <span style={{ fontStyle: 'italic', color: '#999' }}>(Không có nội dung)</span>}
                      </div>
                    </td>
                    <td>{formatDate(rating.created_at)}</td>
                    <td>
                      <span className={`status-badge ${rating.status}`}>
                        {rating.status === 'visible' ? 'Hiển thị' : rating.status === 'deleted' ? 'Đã xóa' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`action-btn ${rating.status === 'hidden' ? 'view' : 'edit'}`} 
                        onClick={() => handleToggleStatus(rating.id, rating.status)} 
                        title={rating.status === 'hidden' ? 'Hiển thị đánh giá' : 'Ẩn đánh giá'}
                        style={{ marginRight: '8px' }}
                      >
                        <i className={`fa-solid ${rating.status === 'hidden' ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDelete(rating.id, rating.status)} 
                        title="Xóa vĩnh viễn đánh giá"
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
