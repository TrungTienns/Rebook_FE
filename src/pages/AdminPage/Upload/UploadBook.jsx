import React, { useState, useEffect } from 'react';
import axiosClient from '../../../services/axiosClient';
import './UploadBook.scss';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useDropzone } from 'react-dropzone';

export default function UploadBook() {
  const [activeTab, setActiveTab] = useState('create'); // 'create' hoặc 'manage'
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [bookData, setBookData] = useState({ title: '', titleEn: '', authorName: '', categoryId: '', description: '', coverImage: null, isVip: 'false', vipPrice: 0 });
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [editBookId, setEditBookId] = useState(null);
  
  // Filters for book list
  const [searchQuery, setSearchQuery] = useState('');
  const [sortFilter, setSortFilter] = useState('newest'); // 'newest', 'oldest', 'a-z'
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // State lỗi validation
  const [errors, setErrors] = useState({});

  // Dropzone cho ảnh bìa
  const onDropCover = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setBookData({...bookData, coverImage: acceptedFiles[0]});
      setErrors({...errors, coverImage: false});
    }
  };

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDragActive } = useDropzone({ 
    onDrop: onDropCover,
    accept: { 'image/*': [] },
    multiple: false
  });




  const fetchBooks = async () => {
    try {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (sortFilter !== 'newest') params.sort = sortFilter;
      
      // If user selected a specific category ID, we need its slug because backend uses category=slug
      if (categoryFilter !== 'all') {
        const cat = categories.find(c => c.id.toString() === categoryFilter.toString());
        if (cat) params.category = cat.slug;
      }
      
      const res = await axiosClient.get('/books', { params });
      if (res?.success) setBooks(res.data);
    } catch {
      console.error('Lỗi khi tải danh sách sách');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/categories');
      if (res?.success) setCategories(res.data);
    } catch {
      console.error('Lỗi khi tải thể loại');
    }
  };

  useEffect(() => {
    fetchBooks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortFilter, categoryFilter, categories]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleBookSubmit = async (e) => {
    e.preventDefault();

    // Custom Validation
    let newErrors = {};
    if (!bookData.title) newErrors.title = true;
    if (!bookData.categoryId) newErrors.categoryId = true;
    if (!bookData.description) newErrors.description = true;
    if (!isEditingBook && !bookData.coverImage) newErrors.coverImage = true; // Ảnh bìa chỉ bắt buộc khi tạo mới

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc (Tên sách, Thể loại, Ảnh bìa, Mô tả)!');
      return;
    }

    const formData = new FormData();
    formData.append('title', bookData.title);
    if (bookData.titleEn) formData.append('titleEn', bookData.titleEn);
    if (bookData.authorName) formData.append('authorName', bookData.authorName); 
    if (bookData.categoryId) formData.append('categoryId', bookData.categoryId); 
    formData.append('description', bookData.description);
    formData.append('isVip', bookData.isVip);
    formData.append('vipPrice', bookData.vipPrice);
    if (bookData.coverImage) formData.append('coverImage', bookData.coverImage);

    // Bật Loading Swal
    Swal.fire({
      title: 'Đang tải lên...',
      text: 'Vui lòng chờ trong lúc chúng tôi xử lý dữ liệu sách của bạn!',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'neo-popup'
      }
    });

    try {
      if (isEditingBook) {
        const res = await axiosClient.put(`/books/${editBookId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res?.success) {
          Swal.close();
          toast.success(' Cập nhật sách thành công!');
          setIsEditingBook(false);
          setEditBookId(null);
          setBookData({ title: '', titleEn: '', authorName: '', categoryId: '', description: '', coverImage: null, isVip: 'false', vipPrice: 0 });
          setErrors({});
          fetchBooks();
        }
      } else {
        const res = await axiosClient.post('/books', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res?.success) { 
          Swal.close();
          toast.success('🎉 Đăng sách thành công!');
          setBookData({ title: '', titleEn: '', authorName: '', categoryId: '', description: '', coverImage: null, isVip: 'false', vipPrice: 0 });
          setErrors({});
          fetchBooks();
        }
      }
    } catch (error) {
      Swal.close();
      toast.error(' Lỗi khi lưu sách');
    }
  };

  const handleEditBook = (book) => {
    setIsEditingBook(true);
    setEditBookId(book.id);
    setBookData({
      title: book.title || '',
      titleEn: book.titleEn || '',
      authorName: book.author?.penName || '',
      categoryId: book.categories?.[0]?.id || '',
      description: book.description || '',
      coverImage: null,
      isVip: book.isVip ? 'true' : 'false',
      vipPrice: book.vipPrice || 0
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBook = (id) => {
    Swal.fire({
      title: 'Xóa sách này?',
      text: "Hành động này sẽ xóa cuốn sách và tất cả các chương liên quan. Bạn không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy',
      buttonsStyling: false,
      customClass: {
        popup: 'neo-popup',
        confirmButton: 'neo-btn-swal neo-btn-danger',
        cancelButton: 'neo-btn-swal neo-btn-cancel'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosClient.delete(`/books/${id}`);
          if (res?.success) {
            toast.success('Đã xóa sách thành công!');
            fetchBooks();
            if (editBookId === id) {
              setIsEditingBook(false);
              setEditBookId(null);
              setBookData({ title: '', authorId: '', categoryId: '', description: '', coverImage: null });
            }
          }
        } catch {
          toast.error('Lỗi khi xóa sách');
        }
      }
    });
  };


  return (
    <div className="admin-upload-container">
      <h2 className="admin-title">
        <i className="fa-solid fa-book-open"></i> Quản Lý Nội Dung
      </h2>
      
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => { setActiveTab('create'); setErrors({}); }}>
          <i className="fa-solid fa-plus-circle"></i> {isEditingBook ? 'Chỉnh Sửa Sách' : 'Tạo Sách Mới'}
        </button>
        <button className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => { setActiveTab('manage'); setErrors({}); }}>
          <i className="fa-solid fa-list"></i> Quản Lý Sách
        </button>
      </div>

      <motion.div 
        key={activeTab} 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
      >
        {activeTab === 'create' ? (
          <div className="form-wrapper neo-box">
            <form onSubmit={handleBookSubmit} className="upload-form" noValidate>
            <div className="form-group row-group">
              <div className="col">
                <label>Tên Sách (Tiếng Việt)</label>
                <input type="text" className={errors.title ? 'error-input' : ''} value={bookData.title} onChange={e => { setBookData({...bookData, title: e.target.value}); setErrors({...errors, title: false}); }} required placeholder="Nhập tên sách..." />
              </div>
              <div className="col">
                <label>Tên Sách (Tiếng Anh) <span style={{fontSize: '0.8rem', color: '#666'}}>- Tuỳ chọn</span></label>
                <input type="text" value={bookData.titleEn} onChange={e => setBookData({...bookData, titleEn: e.target.value})} placeholder="English Title..." />
              </div>
              <div className="col">
                <label>Tác Giả</label>
                <input type="text" className={errors.authorName ? 'error-input' : ''} value={bookData.authorName} onChange={e => { setBookData({...bookData, authorName: e.target.value}); setErrors({...errors, authorName: false}); }} placeholder="Nhập tên tác giả..." />
              </div>
              <div className="col">
                <label>Thể Loại</label>
                <select className={errors.categoryId ? 'error-input' : ''} value={bookData.categoryId} onChange={e => { setBookData({...bookData, categoryId: e.target.value}); setErrors({...errors, categoryId: false}); }} required>
                  <option value="">-- Chọn thể loại chính --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group row-group" style={{ marginBottom: '1.5rem' }}>
              <div className="col">
                <label>Loại Sách</label>
                <select 
                  value={bookData.isVip} 
                  onChange={e => { 
                    const isVipValue = e.target.value;
                    setBookData({
                      ...bookData, 
                      isVip: isVipValue, 
                      vipPrice: isVipValue === 'false' ? 0 : bookData.vipPrice 
                    }); 
                  }}
                >
                  <option value="false">Miễn Phí (Free)</option>
                  <option value="true">Sách VIP</option>
                </select>
              </div>
              <div className="col">
                <label>Giá VIP (Xu) {bookData.isVip === 'false' && <small>(Khóa)</small>}</label>
                <input 
                  type="number" 
                  min="0"
                  disabled={bookData.isVip === 'false'}
                  value={bookData.vipPrice} 
                  onChange={e => setBookData({...bookData, vipPrice: e.target.value})} 
                  placeholder={bookData.isVip === 'true' ? "Nhập giá VIP..." : "0"} 
                />
              </div>
            </div>
            <div className="form-group">
              <label>Mô tả (Giới thiệu)</label>
              <textarea rows="4" className={errors.description ? 'error-input' : ''} value={bookData.description} onChange={e => { setBookData({...bookData, description: e.target.value}); setErrors({...errors, description: false}); }} placeholder="Vài dòng giới thiệu sách..."></textarea>
            </div>
            <div className="form-group">
              <label>Ảnh Bìa (Cover) {isEditingBook && <small>(Bỏ trống nếu không đổi ảnh)</small>}</label>
              <div 
                {...getCoverRootProps()} 
                className={`neo-dropzone ${isCoverDragActive ? 'active' : ''} ${errors.coverImage ? 'error-input' : ''}`}
              >
                <input {...getCoverInputProps()} />
                {bookData.coverImage ? (
                  <div className="dropzone-preview">
                    <img src={URL.createObjectURL(bookData.coverImage)} alt="Preview" />
                    <p>{bookData.coverImage.name}</p>
                  </div>
                ) : (
                  <div className="dropzone-placeholder">
                    <i className="fa-solid fa-cloud-arrow-up fa-3x"></i>
                    <p>{isCoverDragActive ? "Thả ảnh vào đây..." : "Kéo thả ảnh bìa vào đây, hoặc click để chọn ảnh"}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
              <button type="submit" className="neo-btn" style={{ flex: 1 }}>
                <i className={`fa-solid ${isEditingBook ? 'fa-save' : 'fa-rocket'}`}></i> {isEditingBook ? 'Lưu Sách' : 'Tạo Sách Ngay'}
              </button>
              {isEditingBook && (
                <button type="button" className="neo-btn cancel-btn" style={{ flex: 1, background: '#9e9e9e', color: 'white' }} onClick={() => { setIsEditingBook(false); setEditBookId(null); setBookData({ title: '', authorName: '', categoryId: '', description: '', coverImage: null }); setErrors({}); }}>
                  Hủy
                </button>
              )}
            </div>
          </form>
          </div>
        ) : (
          <div className="neo-box book-list-box">
            <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '3px solid #1a1a1a', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}><i className="fa-solid fa-list-ul"></i> Sách Hiện Có ({books.length})</h3>
              
              <div className="filter-controls" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="search-box" style={{ position: 'relative' }}>
                  <i className="fa-solid fa-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}></i>
                  <input 
                    type="text" 
                    placeholder="Tìm theo tên..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '2rem', padding: '0.5rem 0.5rem 0.5rem 2.5rem', borderRadius: '8px', border: '3px solid #1a1a1a', fontWeight: 'bold' }}
                  />
                </div>
                
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '8px', border: '3px solid #1a1a1a', fontWeight: 'bold' }}
                >
                  <option value="all">Tất cả thể loại</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                
                <select 
                  value={sortFilter} 
                  onChange={(e) => setSortFilter(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '8px', border: '3px solid #1a1a1a', fontWeight: 'bold' }}
                >
                  <option value="newest">Mới nhất trước</option>
                  <option value="oldest">Cũ nhất trước</option>
                  <option value="a-z">Tên: A-Z</option>
                  <option value="z-a">Tên: Z-A</option>
                </select>
              </div>
            </div>
            
            <div className="book-table-wrapper">
              <table className="neo-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Sách</th>
                    <th>Tác Giả</th>
                    <th>Chương</th>
                    <th>Trạng Thái</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toString().includes(searchQuery)).map(book => (
                    <tr key={book.id}>
                      <td>#{book.id}</td>
                      <td className="book-name-cell">
                        {book.coverImageUrl || book.cover_image_url ? (
                          <img src={book.coverImageUrl || book.cover_image_url} alt={book.title} className="tiny-cover"/>
                        ) : (
                          <div className="tiny-cover" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e0e0'}}>
                            <i className="fa-solid fa-image" style={{color: '#999'}}></i>
                          </div>
                        )}
                        <span>{book.title}</span>
                      </td>
                      <td>{book.author?.penName || 'Không rõ'}</td>
                      <td><b>{book.totalChapters || 0}</b></td>
                      <td>
                        {book.isVip ? <span className="tag tag-vip"><i className="fa-solid fa-crown"></i> VIP</span> : <span className="tag tag-free">Free</span>}
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-edit" onClick={() => { handleEditBook(book); setActiveTab('create'); }}>
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteBook(book.id)}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {books.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Chưa có cuốn sách nào. Hãy tạo mới!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
