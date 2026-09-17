import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import axiosClient from '../../../../services/axiosClient';

export default function ChapterCreateForm({ booksList, setActiveTab, fetchChapters }) {
  const [chapterData, setChapterData] = useState({ 
    bookId: '', chapterNumber: '', title: '', 
    file_pdf: null, file_pdf_en: null, file_epub: null, file_epub_en: null 
  });
  const [errors, setErrors] = useState({});

  const onDropPdf = (acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      setChapterData({...chapterData, file_pdf: acceptedFiles[0]});
      setErrors({...errors, file_pdf: false});
    }
  };
  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = useDropzone({ onDrop: onDropPdf, accept: { 'application/pdf': ['.pdf'] }, multiple: false });

  const onDropPdfEn = (acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      setChapterData({...chapterData, file_pdf_en: acceptedFiles[0]});
      setErrors({...errors, file_pdf_en: false});
    }
  };
  const { getRootProps: getPdfEnRootProps, getInputProps: getPdfEnInputProps, isDragActive: isPdfEnDragActive } = useDropzone({ onDrop: onDropPdfEn, accept: { 'application/pdf': ['.pdf'] }, multiple: false });

  const onDropEpub = (acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      setChapterData({...chapterData, file_epub: acceptedFiles[0]});
      setErrors({...errors, file_epub: false});
    }
  };
  const { getRootProps: getEpubRootProps, getInputProps: getEpubInputProps, isDragActive: isEpubDragActive } = useDropzone({ onDrop: onDropEpub, accept: { 'application/epub+zip': ['.epub'] }, multiple: false });

  const onDropEpubEn = (acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      setChapterData({...chapterData, file_epub_en: acceptedFiles[0]});
      setErrors({...errors, file_epub_en: false});
    }
  };
  const { getRootProps: getEpubEnRootProps, getInputProps: getEpubEnInputProps, isDragActive: isEpubEnDragActive } = useDropzone({ onDrop: onDropEpubEn, accept: { 'application/epub+zip': ['.epub'] }, multiple: false });

  const handleChapterSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!chapterData.bookId) newErrors.bookId = true;
    if (!chapterData.chapterNumber) newErrors.chapterNumber = true;
    if (!chapterData.title) newErrors.chapterTitle = true;
    if (!chapterData.file_pdf && !chapterData.file_pdf_en && !chapterData.file_epub && !chapterData.file_epub_en) {
      newErrors.file_pdf = true;
      newErrors.file_pdf_en = true;
      newErrors.file_epub = true;
      newErrors.file_epub_en = true;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Vui lòng điền đầy đủ thông tin chương (Sách, Số chương, Tên) và tải lên ít nhất 1 file sách!');
      return;
    }

    const formData = new FormData();
    formData.append('bookId', chapterData.bookId);
    formData.append('chapterNumber', chapterData.chapterNumber);
    formData.append('title', chapterData.title);
    if (chapterData.file_pdf) formData.append('file_pdf', chapterData.file_pdf);
    if (chapterData.file_pdf_en) formData.append('file_pdf_en', chapterData.file_pdf_en);
    if (chapterData.file_epub) formData.append('file_epub', chapterData.file_epub);
    if (chapterData.file_epub_en) formData.append('file_epub_en', chapterData.file_epub_en);

    Swal.fire({
      title: 'Đang xử lý...', text: 'File đang được upload, vui lòng không tắt trang!',
      allowOutsideClick: false, didOpen: () => Swal.showLoading(),
      customClass: { popup: 'neo-swal-popup' }
    });

    try {
      const res = await axiosClient.post('/chapters', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res?.success) {
        Swal.close();
        toast.success('🎉 Tải chương truyện thành công!');
        setChapterData({ bookId: '', chapterNumber: '', title: '', file_pdf: null, file_pdf_en: null, file_epub: null, file_epub_en: null });
        setErrors({});
        fetchChapters();
        setActiveTab('manage');
      }
    } catch (error) {
      Swal.close();
      toast.error(error.response?.data?.message || 'Lỗi khi tải chương mới');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="form-wrapper neo-box">
      <form onSubmit={handleChapterSubmit} className="upload-form" noValidate>
        <div className="form-group row-group">
          <div className="col">
            <label>Chọn Sách</label>
            <select className={errors.bookId ? 'error-input' : ''} value={chapterData.bookId} onChange={e => { setChapterData({...chapterData, bookId: e.target.value}); setErrors({...errors, bookId: false}); }} required>
              <option value="">-- Chọn một cuốn sách --</option>
              {booksList.map(book => <option key={book.id} value={book.id}>{book.title}</option>)}
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
            <div {...getPdfRootProps()} className={`neo-dropzone ${isPdfDragActive ? 'active' : ''} ${errors.file_pdf ? 'error-input' : ''}`}>
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
            <div {...getPdfEnRootProps()} className={`neo-dropzone ${isPdfEnDragActive ? 'active' : ''} ${errors.file_pdf_en ? 'error-input' : ''}`}>
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

        <div className="form-group row-group">
          <div className="col">
            <label>Bản Tiếng Việt (EPUB) <span style={{fontSize: '0.8rem', color: '#666'}}>- Truyện chữ</span></label>
            <div {...getEpubRootProps()} className={`neo-dropzone ${isEpubDragActive ? 'active' : ''} ${errors.file_epub ? 'error-input' : ''}`}>
              <input {...getEpubInputProps()} />
              {chapterData.file_epub ? (
                <div className="dropzone-preview">
                  <i className="fa-solid fa-book fa-3x" style={{ color: '#4facfe' }}></i>
                  <p><b>{chapterData.file_epub.name}</b></p>
                  <button type="button" className="neo-btn pdf-btn" onClick={(e) => { e.stopPropagation(); setChapterData({...chapterData, file_epub: null}); }}>Đổi File Khác</button>
                </div>
              ) : (
                <div className="dropzone-placeholder">
                  <i className="fa-solid fa-book fa-3x"></i>
                  <p>{isEpubDragActive ? "Thả file EPUB Tiếng Việt vào đây..." : "Kéo thả file EPUB Tiếng Việt"}</p>
                </div>
              )}
            </div>
          </div>

          <div className="col">
            <label>Bản Tiếng Anh (EPUB) <span style={{fontSize: '0.8rem', color: '#666'}}>- Truyện chữ</span></label>
            <div {...getEpubEnRootProps()} className={`neo-dropzone ${isEpubEnDragActive ? 'active' : ''} ${errors.file_epub_en ? 'error-input' : ''}`}>
              <input {...getEpubEnInputProps()} />
              {chapterData.file_epub_en ? (
                <div className="dropzone-preview">
                  <i className="fa-solid fa-book fa-3x" style={{ color: '#8e2de2' }}></i>
                  <p><b>{chapterData.file_epub_en.name}</b></p>
                  <button type="button" className="neo-btn pdf-btn" onClick={(e) => { e.stopPropagation(); setChapterData({...chapterData, file_epub_en: null}); }}>Đổi File Khác</button>
                </div>
              ) : (
                <div className="dropzone-placeholder">
                  <i className="fa-solid fa-book fa-3x"></i>
                  <p>{isEpubEnDragActive ? "Thả file EPUB Tiếng Anh vào đây..." : "Kéo thả file EPUB Tiếng Anh"}</p>
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
  );
}
