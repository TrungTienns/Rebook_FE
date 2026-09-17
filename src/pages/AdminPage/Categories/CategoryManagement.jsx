import React, { useState, useEffect } from 'react';
import axiosClient from '../../../services/axiosClient';
import './CategoryManagement.scss';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useDropzone } from 'react-dropzone';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', image: null });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles[0]) {
      setFormData({ ...formData, image: acceptedFiles[0] });
      setPreviewImage(URL.createObjectURL(acceptedFiles[0]));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/categories');
      if (res?.success) setCategories(res.data);
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Custom Validation
    if (!formData.name) {
      toast.error('Vui lòng nhập Tên Thể Loại!');
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      if (formData.description) formPayload.append('description', formData.description);
      if (formData.image) formPayload.append('image', formData.image);

      if (isEditing) {
        const res = await axiosClient.put(`/categories/${editId}`, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res?.success) {
          toast.success('Cập nhật thể loại thành công!');
          setIsEditing(false);
          setEditId(null);
          setFormData({ name: '', description: '', image: null });
          setPreviewImage(null);
          fetchCategories();
        }
      } else {
        const res = await axiosClient.post('/categories', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res?.success) {
          toast.success('Tạo thể loại mới thành công!');
          setFormData({ name: '', description: '', image: null });
          setPreviewImage(null);
          fetchCategories();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (cat) => {
    setIsEditing(true);
    setEditId(cat.id);
    setFormData({ name: cat.name, description: cat.description || '', image: null });
    setPreviewImage(cat.imageUrl || null);
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Xóa thể loại?',
      text: "Bạn có chắc chắn muốn xóa thể loại này? Hành động không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa ngay',
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
          const res = await axiosClient.delete(`/categories/${id}`);
          if (res?.success) {
            toast.success('Đã xóa thể loại!');
            fetchCategories();
            if (editId === id) {
              setIsEditing(false);
              setEditId(null);
              setFormData({ name: '', description: '', image: null });
              setPreviewImage(null);
            }
          }
        } catch (error) {
          toast.error('Lỗi khi xóa thể loại');
        }
      }
    });
  };

  return (
    <div className="admin-category-container">
      <h2 className="admin-title">
        <i className="fa-solid fa-tags"></i> Quản Lý Thể Loại (Categories)
      </h2>

      <div className="category-content">
        {/* Form tạo/sửa */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="neo-box form-box">
          <h3>{isEditing ? 'Sửa Thể Loại' : 'Tạo Thể Loại Mới'}</h3>
          <form onSubmit={handleSubmit} className="upload-form" noValidate>
            <div className="form-group">
              <label>Tên Thể Loại</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="VD: Tiên Hiệp, Huyền Huyễn..." />
            </div>
            <div className="form-group">
              <label>Mô tả ngắn</label>
              <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Giới thiệu về thể loại này..."></textarea>
            </div>
            <div className="form-group">
              <label>Ảnh đại diện thể loại</label>
              <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                {previewImage ? (
                  <div className="image-preview">
                    <img src={previewImage} alt="Preview" />
                    <button type="button" className="remove-img-btn" onClick={(e) => { e.stopPropagation(); setPreviewImage(null); setFormData({...formData, image: null}) }}>
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <div className="dropzone-text">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <p>Kéo thả ảnh vào đây, hoặc click để chọn ảnh</p>
                  </div>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="neo-btn">
                <i className={`fa-solid ${isEditing ? 'fa-save' : 'fa-plus'}`}></i> 
                {isEditing ? 'Lưu Thay Đổi' : 'Thêm Mới'}
              </button>
              {isEditing && (
                <button type="button" className="neo-btn cancel-btn" onClick={() => { setIsEditing(false); setEditId(null); setFormData({ name: '', description: '', image: null }); setPreviewImage(null); }}>
                  Hủy
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Danh sách */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="neo-box list-box">
          <h3>Danh Sách Thể Loại Hiện Có</h3>
          {categories.length === 0 ? (
            <div className="empty-state">Chưa có thể loại nào. Hãy tạo mới!</div>
          ) : (
            <div className="category-list">
              {categories.map(cat => (
                <div key={cat.id} className="category-item">
                  <div className="cat-image-wrapper">
                    {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} /> : <div className="no-image"><i className="fa-solid fa-image"></i></div>}
                  </div>
                  <div className="cat-info">
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-slug">/{cat.slug}</span>
                    <span className="cat-count">({cat.bookCount || 0} sách)</span>
                  </div>
                  <div className="cat-desc">{cat.description || 'Không có mô tả'}</div>
                  <div className="cat-actions">
                    <button className="action-btn edit" onClick={() => handleEdit(cat)} title="Sửa">
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(cat.id)} title="Xóa">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
