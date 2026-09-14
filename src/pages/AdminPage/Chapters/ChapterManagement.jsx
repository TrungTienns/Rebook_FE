import React, { useState, useEffect } from 'react';
import axiosClient from '../../../services/axiosClient';
import './ChapterManagement.scss';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

export default function ChapterManagement() {
  const [activeTab, setActiveTab] = useState('manage'); // 'upload' hoặc 'manage'
  
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('desc'); // 'desc' = Mới nhất, 'asc' = Cũ nhất
  const [bookIdFilter, setBookIdFilter] = useState('');
  const [booksList, setBooksList] = useState([]);

  // Upload State
  const [chapterData, setChapterData] = useState({ bookId: '', chapterNumber: '', title: '', file_pdf: null, file_pdf_en: null });
  const [errors, setErrors] = useState({});

  // Modal Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: null,
    chapterNumber: '',
    title: '',
    file_pdf: null,
    file_pdf_en: null,
    isVip: false,
    priceCoin: 0
  });



  const fetchBooks = async () => {
    try {
      // Get all books for filter dropdown
      const res = await axiosClient.get('/books?limit=1000');
      if (res?.success) setBooksList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/chapters', {
        params: { page, limit: 10, search, sort, bookId: bookIdFilter }
      });
      if (res?.success) {
        setChapters(res.data);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách chương');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    fetchChapters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sort, bookIdFilter]);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Xóa chương này?',
      text: "Hành động này sẽ xóa dữ liệu và cả file PDF trên Cloudinary. Không thể hoàn tác!",
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
          const res = await axiosClient.delete(`/chapters/${id}`);
          if (res?.success) {
            toast.success('Xóa chương thành công');
            fetchChapters();
          }
        } catch (err) {
          toast.error('Lỗi khi xóa chương');
        }
      }
    });
  };

  const openEditModal = (chapter) => {
    setEditData({
      id: chapter.id,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      isVip: chapter.isVip,
      priceCoin: chapter.priceCoin,
      file_pdf: null,
      file_pdf_en: null
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditData({ id: null, chapterNumber: '', title: '', file_pdf: null, file_pdf_en: null, isVip: false, priceCoin: 0 });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editData.title || !editData.chapterNumber) {
      toast.error('Vui lòng điền đủ Tiêu đề và Số chương');
      return;
    }

    try {
      Swal.fire({
        title: 'Đang cập nhật...',
        text: 'Vui lòng chờ trong lúc hệ thống xử lý file PDF.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const formData = new FormData();
      formData.append('title', editData.title);
      formData.append('chapterNumber', editData.chapterNumber);
      formData.append('isVip', editData.isVip);
      formData.append('priceCoin', editData.priceCoin);
      
      if (editData.file_pdf) formData.append('file_pdf', editData.file_pdf);
      if (editData.file_pdf_en) formData.append('file_pdf_en', editData.file_pdf_en);

      const res = await axiosClient.put(`/chapters/${editData.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res?.success) {
        Swal.close();
        toast.success('Cập nhật chương thành công!');
        closeEditModal();
        fetchChapters();
      }
    } catch (err) {
      Swal.close();
      toast.error(err.response?.data?.message || 'Có lỗi khi cập nhật');
    }
  };

  // Dropzone cho file PDF (Việt)
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

  // Dropzone cho file PDF (Anh)
  const onDropPdfEn = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setChapterData({...chapterData, file_pdf_en: acceptedFiles[0]});
      setErrors({...errors, file_pdf_en: false});
    }
  };

  const { getRootProps: getPdfEnRootProps, getInputProps: getPdfEnInputProps, isDragActive: isPdfEnDragActive } = useDropzone({ 
    onDrop: onDropPdfEn,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const handleChapterSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!chapterData.bookId) newErrors.bookId = true;
    if (!chapterData.chapterNumber) newErrors.chapterNumber = true;
    if (!chapterData.title) newErrors.chapterTitle = true;
    if (!chapterData.file_pdf && !chapterData.file_pdf_en) {
      newErrors.file_pdf = true;
      newErrors.file_pdf_en = true;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Vui lòng điền đầy đủ thông tin chương (Sách, Số chương, Tên) và tải lên ít nhất 1 file PDF (Tiếng Việt hoặc Tiếng Anh)!');
      return;
    }

    const formData = new FormData();
    formData.append('bookId', chapterData.bookId);
    formData.append('chapterNumber', chapterData.chapterNumber);
    formData.append('title', chapterData.title);
    if (chapterData.file_pdf) formData.append('file_pdf', chapterData.file_pdf);
    if (chapterData.file_pdf_en) formData.append('file_pdf_en', chapterData.file_pdf_en);

    Swal.fire({
      title: 'Đang tải PDF...',
      text: 'File PDF đang được upload, vui lòng không tắt trang!',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'neo-swal-popup'
      }
    });

    try {
      const res = await axiosClient.post('/chapters', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res?.success) {
        Swal.close();
        toast.success('🎉 Tải chương truyện (PDF) thành công!');
        setChapterData({ ...chapterData, chapterNumber: '', title: '', file_pdf: null, file_pdf_en: null });
        setErrors({});
        fetchChapters();
        setActiveTab('manage');
      }
    } catch (error) {
      Swal.close();
      const errorMessage = error.response?.data?.message || 'Lỗi khi tải chương mới';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="chapter-management-container neo-container">
      <div className="admin-header-box">
        <h1><i className="fa-solid fa-file-pdf"></i> Quản Lý Các Chương</h1>
        <p>Tìm kiếm, sắp xếp, tải lên và sửa đổi thông tin các chương truyện</p>
      </div>

      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`} 
          onClick={() => setActiveTab('upload')}
        >
          <i className="fa-solid fa-cloud-arrow-up"></i> Upload Chương (PDF)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`} 
          onClick={() => setActiveTab('manage')}
        >
          <i className="fa-solid fa-list"></i> Danh Sách Chương Hiện Có
        </button>
      </div>

      {activeTab === 'upload' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="form-wrapper neo-box">
          <form onSubmit={handleChapterSubmit} className="upload-form" noValidate>
            <div className="form-group row-group">
              <div className="col">
                <label>Chọn Sách</label>
                <select className={errors.bookId ? 'error-input' : ''} value={chapterData.bookId} onChange={e => { setChapterData({...chapterData, bookId: e.target.value}); setErrors({...errors, bookId: false}); }} required>
                  <option value="">-- Chọn một cuốn sách --</option>
                  {booksList.map(book => (
                    <option key={book.id} value={book.id}>{book.title}</option>
                  ))}
                </select>
              </div>
              <div className="col">
                <label>Chương Số</label>
                <input type="number" min="1" className={errors.chapterNumber ? 'error-input' : ''} value={chapterData.chapterNumber} onChange={e => { setChapterData({...chapterData, chapterNumber: e.target.value}); setErrors({...errors, chapterNumber: false}); }} required placeholder="VD: 1" />
              </div>
              <div className="col" style={{ flex: 2 }}>
                <label>Tên Chương</label>
                <input type="text" className={errors.chapterTitle ? 'error-input' : ''} value={chapterData.title} onChange={e => { setChapterData({...chapterData, title: e.target.value}); setErrors({...errors, chapterTitle: false}); }} required placeholder="VD: Khởi nguyên" />
              </div>
            </div>
            
            <div className="form-group row-group">
              <div className="col">
                <label>Bản Tiếng Việt (PDF) <span style={{fontSize: '0.8rem', color: '#666'}}>- Tuỳ chọn</span></label>
                <div 
                  {...getPdfRootProps()} 
                  className={`neo-dropzone ${isPdfDragActive ? 'active' : ''} ${errors.file_pdf ? 'error-input' : ''}`}
                >
                  <input {...getPdfInputProps()} />
                  {chapterData.file_pdf ? (
                    <div className="dropzone-preview">
                      <i className="fa-solid fa-file-pdf fa-3x" style={{ color: '#ff5252' }}></i>
                      <p><b>{chapterData.file_pdf.name}</b></p>
                      <button type="button" className="neo-btn pdf-btn" onClick={(e) => { e.stopPropagation(); setChapterData({...chapterData, file_pdf: null}); }}>Đổi File Khác</button>
                    </div>
                  ) : (
                    <div className="dropzone-placeholder">
                      <i className="fa-solid fa-file-pdf fa-3x"></i>
                      <p>{isPdfDragActive ? "Thả file Tiếng Việt vào đây..." : "Kéo thả file Tiếng Việt"}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="col">
                <label>Bản Tiếng Anh (PDF) <span style={{fontSize: '0.8rem', color: '#666'}}>- Tuỳ chọn</span></label>
                <div 
                  {...getPdfEnRootProps()} 
                  className={`neo-dropzone ${isPdfEnDragActive ? 'active' : ''} ${errors.file_pdf_en ? 'error-input' : ''}`}
                >
                  <input {...getPdfEnInputProps()} />
                  {chapterData.file_pdf_en ? (
                    <div className="dropzone-preview">
                      <i className="fa-solid fa-file-pdf fa-3x" style={{ color: '#2ed573' }}></i>
                      <p><b>{chapterData.file_pdf_en.name}</b></p>
                      <button type="button" className="neo-btn pdf-btn" onClick={(e) => { e.stopPropagation(); setChapterData({...chapterData, file_pdf_en: null}); }}>Đổi File Khác</button>
                    </div>
                  ) : (
                    <div className="dropzone-placeholder">
                      <i className="fa-solid fa-file-pdf fa-3x"></i>
                      <p>{isPdfEnDragActive ? "Thả file Tiếng Anh vào đây..." : "Kéo thả file Tiếng Anh"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
              <button type="submit" className="neo-btn" style={{ flex: 1 }}>
                <i className="fa-solid fa-cloud-arrow-up"></i> Tải Chương Lên
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <>
          <div className="filter-bar neo-box">
        <div className="filter-group search-box">
          <i className="fa-solid fa-search"></i>
          <input 
            type="text" 
            placeholder="Tìm theo tên chương..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="filter-group">
          <i className="fa-solid fa-book"></i>
          <select 
            value={bookIdFilter} 
            onChange={(e) => { setBookIdFilter(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả sách</option>
            {booksList.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <i className="fa-solid fa-sort"></i>
          <select 
            value={sort} 
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="desc">Mới nhất trước</option>
            <option value="asc">Cũ nhất trước</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><i className="fa-solid fa-spinner fa-spin fa-3x"></i></div>
      ) : (
        <div className="chapter-table-wrapper neo-box">
          <table className="neo-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Sách</th>
                <th>Chương</th>
                <th>Tiêu Đề</th>
                <th>Ngôn Ngữ PDF</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map(chap => (
                <tr key={chap.id}>
                  <td>#{chap.id}</td>
                  <td className="book-name-cell">
                    {chap.book?.coverImageUrl && <img src={chap.book.coverImageUrl} alt="cover" className="tiny-cover"/>}
                    <span>{chap.book?.title || 'N/A'}</span>
                  </td>
                  <td><b>{chap.chapterNumber}</b></td>
                  <td>{chap.title}</td>
                  <td>
                    <div className="lang-tags">
                      {chap.pdfUrl && <span className="tag tag-vi">VI</span>}
                      {chap.pdfUrlEn && <span className="tag tag-en">EN</span>}
                      {!chap.pdfUrl && !chap.pdfUrlEn && <span className="tag tag-none">No PDF</span>}
                    </div>
                  </td>
                  <td>
                    {chap.isVip ? <span className="tag tag-vip"><i className="fa-solid fa-crown"></i> VIP</span> : <span className="tag tag-free">Free</span>}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-edit" onClick={() => openEditModal(chap)}>
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(chap.id)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {chapters.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">Không tìm thấy chương nào.</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <span className="page-info">Trang {page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}
      </>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <motion.div 
            className="modal-content neo-box"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="modal-header">
              <h2>Sửa Chương</h2>
              <button className="btn-close" onClick={closeEditModal}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label>Số chương</label>
                <input 
                  type="number" 
                  value={editData.chapterNumber}
                  onChange={(e) => setEditData({...editData, chapterNumber: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Tiêu đề chương</label>
                <input 
                  type="text" 
                  value={editData.title}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  required 
                />
              </div>
              
              <div className="form-group row">
                <label>Quyền truy cập</label>
                <div className="checkbox-wrap">
                  <input 
                    type="checkbox" 
                    id="isVipCheck"
                    checked={editData.isVip}
                    onChange={(e) => setEditData({...editData, isVip: e.target.checked})}
                  />
                  <label htmlFor="isVipCheck"><i className="fa-solid fa-crown text-warning"></i> VIP</label>
                </div>
              </div>
              {editData.isVip && (
                <div className="form-group">
                  <label>Giá xu</label>
                  <input 
                    type="number" 
                    value={editData.priceCoin}
                    onChange={(e) => setEditData({...editData, priceCoin: e.target.value})}
                  />
                </div>
              )}

              <div className="file-upload-section">
                <div className="form-group">
                  <label>Thay PDF (Tiếng Việt)</label>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={(e) => setEditData({...editData, file_pdf: e.target.files[0]})}
                  />
                  <small>Để trống nếu không muốn đổi file cũ</small>
                </div>
                <div className="form-group">
                  <label>Thay PDF (Tiếng Anh)</label>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={(e) => setEditData({...editData, file_pdf_en: e.target.files[0]})}
                  />
                  <small>Để trống nếu không muốn đổi file cũ</small>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeEditModal}>Hủy</button>
                <button type="submit" className="btn-save"><i className="fa-solid fa-save"></i> Lưu Thay Đổi</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
