import React, { useState, useEffect } from 'react';
import axiosClient from '../../../services/axiosClient';
import './UploadBook.scss';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useDropzone } from 'react-dropzone';

export default function UploadBook() {
  const [activeTab, setActiveTab] = useState('book'); // 'book' hoặc 'chapter'
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // State form Sách
  const [bookData, setBookData] = useState({ title: '', authorName: '', categoryId: '', description: '', coverImage: null });
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [editBookId, setEditBookId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State form Chương
  const [chapterData, setChapterData] = useState({ bookId: '', chapterNumber: '', title: '', file_pdf: null });

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

  // Dropzone cho file PDF
  const onDropPdf = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setChapterData({...chapterData, file_pdf: acceptedFiles[0]});
      setErrors({...errors, file_pdf: false});
    }
  };

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = useDropzone({ 
    onDrop: onDropPdf,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  // Tải danh sách sách để chọn khi up chương và hiển thị danh sách
  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axiosClient.get('/books');
      if (res?.success) setBooks(res.data); // <-- Đã sửa
    } catch (error) {
      console.error('Lỗi khi tải danh sách sách:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/categories');
      if (res?.success) setCategories(res.data);
    } catch (error) {
      console.error('Lỗi khi tải thể loại:', error);
    }
  };

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
    if (bookData.authorName) formData.append('authorName', bookData.authorName); 
    if (bookData.categoryId) formData.append('categoryId', bookData.categoryId); 
    formData.append('description', bookData.description);
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
          setBookData({ title: '', authorName: '', categoryId: '', description: '', coverImage: null });
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
          setBookData({ title: '', authorName: '', categoryId: '', description: '', coverImage: null });
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
      authorName: book.author?.penName || '',
      categoryId: book.categories && book.categories.length > 0 ? book.categories[0].id : '',
      description: book.description || '',
      coverImage: null
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
        } catch (error) {
          toast.error('Lỗi khi xóa sách');
        }
      }
    });
  };

  const handleChapterSubmit = async (e) => {
    e.preventDefault();

    // Custom Validation
    let newErrors = {};
    if (!chapterData.bookId) newErrors.bookId = true;
    if (!chapterData.chapterNumber) newErrors.chapterNumber = true;
    if (!chapterData.title) newErrors.chapterTitle = true;
    if (!chapterData.file_pdf) newErrors.file_pdf = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(' Vui lòng điền đầy đủ thông tin chương (Sách, Số chương, Tên, File PDF)!');
      return;
    }

    const formData = new FormData();
    formData.append('bookId', chapterData.bookId);
    formData.append('chapterNumber', chapterData.chapterNumber);
    formData.append('title', chapterData.title);
    if (chapterData.file_pdf) formData.append('file_pdf', chapterData.file_pdf);

    // Bật Loading Swal
    Swal.fire({
      title: 'Đang tải PDF...',
      text: 'File PDF đang được upload, vui lòng không tắt trang!',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'neo-popup'
      }
    });

    try {
      const res = await axiosClient.post('/chapters', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res?.success) { // <-- Đã sửa
        Swal.close();
        toast.success('🎉 Tải chương truyện (PDF) thành công!');
        setChapterData({ ...chapterData, chapterNumber: '', title: '', file_pdf: null });
        setErrors({});
      }
    } catch (error) {
      Swal.close();
      const errorMessage = error.response?.data?.message || 'Lỗi khi tải chương mới';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="admin-upload-container">
      <h2 className="admin-title">
        <i className="fa-solid fa-book-open"></i> Quản Lý Nội Dung
      </h2>
      
      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`} onClick={() => { setActiveTab('book'); setErrors({}); }}>
          <i className="fa-solid fa-plus-circle"></i> Tạo Sách Mới
        </button>
        <button className={`tab-btn ${activeTab === 'chapter' ? 'active' : ''}`} onClick={() => { setActiveTab('chapter'); setErrors({}); }}>
          <i className="fa-solid fa-file-pdf"></i> Upload Chương (PDF)
        </button>
      </div>

      <motion.div 
        key={activeTab} 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="form-wrapper neo-box"
      >
        {activeTab === 'book' ? (
          <form onSubmit={handleBookSubmit} className="upload-form" noValidate>
            <div className="form-group row-group">
              <div className="col">
                <label>Tên Sách</label>
                <input type="text" className={errors.title ? 'error-input' : ''} value={bookData.title} onChange={e => { setBookData({...bookData, title: e.target.value}); setErrors({...errors, title: false}); }} required placeholder="Nhập tên sách..." />
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
        ) : (
          <form onSubmit={handleChapterSubmit} className="upload-form" noValidate>
            <div className="form-group">
              <label>Chọn Sách</label>
              <select className={errors.bookId ? 'error-input' : ''} value={chapterData.bookId} onChange={e => { setChapterData({...chapterData, bookId: e.target.value}); setErrors({...errors, bookId: false}); }} required>
                <option value="">-- Chọn một cuốn sách --</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>{book.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group row-group">
              <div className="col">
                <label>Chương Số</label>
                <input type="number" min="1" className={errors.chapterNumber ? 'error-input' : ''} value={chapterData.chapterNumber} onChange={e => { setChapterData({...chapterData, chapterNumber: e.target.value}); setErrors({...errors, chapterNumber: false}); }} required placeholder="VD: 1" />
              </div>
              <div className="col">
                <label>Tên Chương</label>
                <input type="text" className={errors.chapterTitle ? 'error-input' : ''} value={chapterData.title} onChange={e => { setChapterData({...chapterData, title: e.target.value}); setErrors({...errors, chapterTitle: false}); }} required placeholder="VD: Khởi nguyên" />
              </div>
            </div>
            <div className="form-group">
              <label>File Nội Dung (PDF)</label>
              <div 
                {...getPdfRootProps()} 
                className={`neo-dropzone ${isPdfDragActive ? 'active' : ''} ${errors.file_pdf ? 'error-input' : ''}`}
                style={{ height: 'auto', minHeight: '150px' }}
              >
                <input {...getPdfInputProps()} />
                {chapterData.file_pdf ? (
                  <div className="dropzone-preview" style={{ gap: '0.5rem' }}>
                    <i className="fa-solid fa-file-pdf fa-3x" style={{ color: '#ff5252' }}></i>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem' }}>{chapterData.file_pdf.name}</p>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{(chapterData.file_pdf.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button type="button" className="neo-btn" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', marginTop: '0.5rem', background: '#ffd700', color: 'black' }} onClick={(e) => { e.stopPropagation(); setChapterData({...chapterData, file_pdf: null}); }}>Đổi File Khác</button>
                  </div>
                ) : (
                  <div className="dropzone-placeholder">
                    <i className="fa-solid fa-file-pdf fa-3x" style={{ color: '#1a1a1a' }}></i>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem', color: '#1a1a1a' }}>
                      {isPdfDragActive ? "Thả file PDF vào đây..." : "Kéo thả file PDF hoặc click để chọn"}
                    </p>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Chỉ chấp nhận định dạng .pdf</p>
                  </div>
                )}
              </div>
            </div>
            <button type="submit" className="neo-btn pdf-btn">
              <i className="fa-solid fa-upload"></i> Upload PDF
            </button>
          </form>
        )}
      </motion.div>

      {/* Danh sách sách hiện có */}
      {activeTab === 'book' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="neo-box book-list-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '3px solid #1a1a1a', paddingBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Danh Sách Sách Hiện Có</h3>
            <div className="search-bar" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <i className="fa-solid fa-search" style={{ color: '#1a1a1a', fontSize: '1.2rem' }}></i>
              <input 
                type="text" 
                placeholder="Tìm kiếm sách..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.6rem 1rem',
                  border: '3px solid #1a1a1a',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  background: '#2d2d2d',
                  color: '#ffffff',
                  fontWeight: '600',
                  boxShadow: '4px 4px 0px #1a1a1a',
                  width: '250px'
                }}
              />
            </div>
          </div>
          
          {books.length === 0 ? (
            <div className="empty-state" style={{ minHeight: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Chưa có sách nào. Hãy tạo mới!</div>
          ) : (
            <div className="book-list">
              {books
                .filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.id.toString().includes(searchQuery))
                .length === 0 ? (
                  <div className="empty-state" style={{ minHeight: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Không tìm thấy sách phù hợp!</div>
                ) : (
                  books
                    .filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.id.toString().includes(searchQuery))
                    .map(book => (
                <div key={book.id} className="book-item">
                  <div className="book-info">
                    {book.coverImageUrl || book.cover_image_url ? (
                      <img src={book.coverImageUrl || book.cover_image_url} alt={book.title} className="book-cover" />
                    ) : (
                      <div className="book-cover no-cover"><i className="fa-solid fa-image"></i></div>
                    )}
                    <div className="book-details">
                      <span className="book-title">{book.title} <span style={{ fontSize: '0.8rem', color: '#666', background: '#eee', padding: '2px 6px', borderRadius: '4px', marginLeft: '0.5rem', border: '1px solid #1a1a1a' }}>ID: {book.id}</span></span>
                      <span className="book-category">
                        {book.categories && book.categories.length > 0 ? book.categories.map(c => c.name).join(', ') : 'Chưa phân loại'}
                      </span>
                    </div>
                  </div>
                  <div className="book-actions">
                    <button type="button" className="action-btn edit" onClick={() => handleEditBook(book)} title="Sửa">
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" className="action-btn delete" onClick={() => handleDeleteBook(book.id)} title="Xóa">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              )))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
