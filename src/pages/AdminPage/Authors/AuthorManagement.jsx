import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useDropzone } from 'react-dropzone';
import authorService from '../../../services/authorService';
import './AuthorManagement.scss';

// ── Dropzone component ────────────────────────────────────────────────────────
function AvatarDropzone({ onFileSelect, currentAvatar, previewUrl }) {
  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) onFileSelect(accepted[0]);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1
  });

  const displayImg = previewUrl || currentAvatar;

  return (
    <div {...getRootProps()} className={`avatar-dropzone ${isDragActive ? 'drag-over' : ''}`}>
      <input {...getInputProps()} />
      {displayImg ? (
        <div className="avatar-preview">
          <img src={displayImg} alt="Preview" />
          <div className="avatar-overlay">
            <i className="fa-solid fa-camera"></i>
            <span>Đổi ảnh</span>
          </div>
        </div>
      ) : (
        <div className="avatar-placeholder">
          <i className="fa-solid fa-user-circle"></i>
          <p>{isDragActive ? 'Thả ảnh vào đây...' : 'Kéo & thả hoặc click để chọn ảnh'}</p>
          <span>JPG, PNG, WEBP</span>
        </div>
      )}
    </div>
  );
}

// ── Add / Edit Form Modal ────────────────────────────────────────────────────
function AuthorFormModal({ author, onClose, onSaved }) {
  const isEdit = !!author;
  const [formData, setFormData] = useState({
    penName: author?.penName || '',
    bio: author?.bio || '',
    country: author?.country || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFileSelect = (file) => {
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.penName.trim()) {
      return toast.warning('Tên bút danh là bắt buộc!');
    }

    const fd = new FormData();
    fd.append('penName', formData.penName.trim());
    fd.append('bio', formData.bio);
    fd.append('country', formData.country);
    if (avatarFile) fd.append('avatar', avatarFile);

    try {
      setSaving(true);
      let res;
      if (isEdit) {
        res = await authorService.update(author.id, fd);
      } else {
        res = await authorService.create(fd);
      }
      if (res?.success) {
        toast.success(isEdit ? 'Đã cập nhật tác giả!' : 'Đã thêm tác giả mới!');
        onSaved();
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="modal-header">
          <h2>
            <i className={`fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-user-plus'}`}></i>
            {isEdit ? 'Chỉnh Sửa Tác Giả' : 'Thêm Tác Giả Mới'}
          </h2>
          <button className="btn-close" onClick={onClose} aria-label="Đóng">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form className="author-form" onSubmit={handleSubmit}>
          <div className="form-layout">
            {/* Avatar Upload */}
            <div className="avatar-section">
              <label>Ảnh Đại Diện</label>
              <AvatarDropzone
                onFileSelect={handleFileSelect}
                currentAvatar={author?.avatarUrl}
                previewUrl={previewUrl}
              />
            </div>

            {/* Form Fields */}
            <div className="fields-section">
              <div className="form-group">
                <label htmlFor="penName">
                  <i className="fa-solid fa-pen-nib"></i> Tên Bút Danh <span className="required">*</span>
                </label>
                <input
                  id="penName"
                  type="text"
                  placeholder="Nhập tên bút danh..."
                  value={formData.penName}
                  onChange={(e) => setFormData({ ...formData, penName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">
                  <i className="fa-solid fa-earth-asia"></i> Quốc Gia
                </label>
                <input
                  id="country"
                  type="text"
                  placeholder="Ví dụ: Việt Nam, Nhật Bản..."
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">
                  <i className="fa-solid fa-align-left"></i> Giới Thiệu
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  placeholder="Mô tả ngắn về tác giả..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              <i className="fa-solid fa-xmark"></i> Hủy
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving
                ? <><i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...</>
                : <><i className="fa-solid fa-floppy-disk"></i> {isEdit ? 'Lưu Thay Đổi' : 'Thêm Tác Giả'}</>
              }
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Author Card (Grid view) ──────────────────────────────────────────────────
function AuthorCard({ author, onEdit, onDelete }) {
  return (
    <motion.div
      className="author-card neo-box"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="card-avatar">
        {author.avatarUrl ? (
          <img src={author.avatarUrl} alt={author.penName} />
        ) : (
          <div className="avatar-fallback">
            <i className="fa-solid fa-user"></i>
          </div>
        )}
      </div>

      <div className="card-info">
        <h3 className="author-name">{author.penName}</h3>
        {author.country && (
          <p className="author-country">
            <i className="fa-solid fa-earth-asia"></i> {author.country}
          </p>
        )}
        {author.bio && (
          <p className="author-bio">{author.bio}</p>
        )}
        <div className="author-stats">
          <span className="stat-badge">
            <i className="fa-solid fa-book"></i> {Number(author.dataValues?.bookCount ?? author.bookCount ?? 0)} sách
          </span>
          <span className="stat-badge follower">
            <i className="fa-solid fa-heart"></i> {Number(author.dataValues?.followerCount ?? author.followerCount ?? 0)} theo dõi
          </span>
        </div>
      </div>

      <div className="card-actions">
        <button className="btn-action btn-edit" onClick={() => onEdit(author)} title="Chỉnh sửa">
          <i className="fa-solid fa-pen-to-square"></i>
        </button>
        <button className="btn-action btn-delete" onClick={() => onDelete(author)} title="Xóa">
          <i className="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AuthorManagement() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);

  const fetchAuthors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authorService.getAll({ page, limit: 12, search });
      if (res?.success) {
        setAuthors(res.data);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách tác giả');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleOpenAdd = () => {
    setEditingAuthor(null);
    setShowModal(true);
  };

  const handleOpenEdit = (author) => {
    setEditingAuthor(author);
    setShowModal(true);
  };

  const handleDelete = (author) => {
    Swal.fire({
      title: `Xóa "${author.penName}"?`,
      text: 'Không thể xóa nếu tác giả đang có sách liên kết!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa luôn',
      cancelButtonText: 'Hủy',
      buttonsStyling: false,
      customClass: {
        popup: 'neo-swal-popup',
        title: 'neo-swal-title',
        confirmButton: 'neo-swal-btn confirm',
        cancelButton: 'neo-swal-btn cancel'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await authorService.remove(author.id);
          if (res?.success) {
            toast.success('Đã xóa tác giả!');
            fetchAuthors();
          }
        } catch (err) {
          const msg = err?.response?.data?.message || 'Lỗi khi xóa tác giả';
          toast.error(msg);
        }
      }
    });
  };

  return (
    <div className="author-management-container">
      {/* Header */}
      <div className="admin-header-box">
        <h1>
          <i className="fa-solid fa-pen-nib"></i> Quản Lý Tác Giả
        </h1>
        <p>Tổng cộng <strong>{total}</strong> tác giả trong hệ thống</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar neo-box">
        <div className="filter-group search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Tìm theo tên bút danh..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <button className="btn-add" onClick={handleOpenAdd}>
          <i className="fa-solid fa-user-plus"></i> Thêm Tác Giả
        </button>
      </div>

      {/* Author Grid */}
      {loading ? (
        <div className="loading-spinner">
          <i className="fa-solid fa-spinner fa-spin fa-3x"></i>
          <p>Đang tải...</p>
        </div>
      ) : authors.length === 0 ? (
        <div className="empty-state neo-box">
          <i className="fa-solid fa-user-slash"></i>
          <h3>Chưa có tác giả nào</h3>
          <p>{search ? `Không tìm thấy kết quả cho "${search}"` : 'Hãy thêm tác giả đầu tiên!'}</p>
          {!search && (
            <button className="btn-add" onClick={handleOpenAdd}>
              <i className="fa-solid fa-user-plus"></i> Thêm Tác Giả
            </button>
          )}
        </div>
      ) : (
        <motion.div className="authors-grid" layout>
          <AnimatePresence>
            {authors.map((author) => (
              <AuthorCard
                key={author.id}
                author={author}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <span className="page-info">Trang {page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <AuthorFormModal
            author={editingAuthor}
            onClose={() => setShowModal(false)}
            onSaved={fetchAuthors}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
