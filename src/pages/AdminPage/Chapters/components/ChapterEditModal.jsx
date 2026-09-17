import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import axiosClient from '../../../../services/axiosClient';

export default function ChapterEditModal({ editData, setEditData, closeEditModal, fetchChapters }) {
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editData.title || !editData.chapterNumber) {
      toast.error('Vui lòng điền đủ Tiêu đề và Số chương');
      return;
    }

    try {
      Swal.fire({
        title: 'Đang cập nhật...',
        text: 'Vui lòng chờ trong lúc hệ thống xử lý file PDF/EPUB.',
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
      if (editData.file_epub) formData.append('file_epub', editData.file_epub);
      if (editData.file_epub_en) formData.append('file_epub_en', editData.file_epub_en);

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

  return (
    <div className="modal-overlay">
      <motion.div 
        className="modal-content neo-box"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="modal-header">
          <h2>Sửa Chương</h2>
          <button type="button" className="btn-close" onClick={closeEditModal}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <form onSubmit={handleEditSubmit} className="edit-form">
          <div className="form-group row-group">
            <div className="col" style={{ flex: 1 }}>
              <label>Số chương</label>
              <input 
                type="number" 
                value={editData.chapterNumber}
                onChange={(e) => setEditData({...editData, chapterNumber: e.target.value})}
                required 
              />
            </div>
            <div className="col" style={{ flex: 3 }}>
              <label>Tiêu đề chương</label>
              <input 
                type="text" 
                value={editData.title}
                onChange={(e) => setEditData({...editData, title: e.target.value})}
                required 
              />
            </div>
          </div>
          
          <div className="form-group row-group" style={{ alignItems: 'center' }}>
            <div className="col" style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ margin: 0 }}>Quyền truy cập:</label>
              <div className="checkbox-wrap" style={{ margin: 0 }}>
                <input 
                  type="checkbox" 
                  id="isVipCheck"
                  checked={editData.isVip}
                  onChange={(e) => setEditData({...editData, isVip: e.target.checked})}
                />
                <label htmlFor="isVipCheck" style={{ margin: 0 }}><i className="fa-solid fa-crown text-warning"></i> VIP</label>
              </div>
            </div>
            {editData.isVip && (
              <div className="col" style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ margin: 0 }}>Giá xu:</label>
                <input 
                  type="number" 
                  value={editData.priceCoin}
                  onChange={(e) => setEditData({...editData, priceCoin: e.target.value})}
                  style={{ flex: 1 }}
                />
              </div>
            )}
          </div>

          <div className="file-upload-section">
            <div className="form-group row-group">
              <div className="col">
                <label>Thay PDF (Tiếng Việt)</label>
                <label className="neo-dropzone" style={{ padding: '0.5rem', minHeight: '80px' }}>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => setEditData({...editData, file_pdf: e.target.files[0]})}
                  />
                  {editData.file_pdf ? (
                    <div className="dropzone-preview">
                      <i className="fa-solid fa-file-pdf fa-2x" style={{ color: '#ff5252' }}></i>
                      <p><b>{editData.file_pdf.name}</b></p>
                    </div>
                  ) : (
                    <div className="dropzone-placeholder">
                      <i className="fa-solid fa-file-pdf fa-2x"></i>
                      <p style={{fontSize: '0.9rem', fontWeight: 600}}>Nhấp để chọn file mới</p>
                    </div>
                  )}
                </label>
              </div>
              
              <div className="col">
                <label>Thay PDF (Tiếng Anh)</label>
                <label className="neo-dropzone" style={{ padding: '0.5rem', minHeight: '80px' }}>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => setEditData({...editData, file_pdf_en: e.target.files[0]})}
                  />
                  {editData.file_pdf_en ? (
                    <div className="dropzone-preview">
                      <i className="fa-solid fa-file-pdf fa-2x" style={{ color: '#2ed573' }}></i>
                      <p><b>{editData.file_pdf_en.name}</b></p>
                    </div>
                  ) : (
                    <div className="dropzone-placeholder">
                      <i className="fa-solid fa-file-pdf fa-2x"></i>
                      <p style={{fontSize: '0.9rem', fontWeight: 600}}>Nhấp để chọn file mới</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="form-group row-group">
              <div className="col">
                <label>Thay EPUB (Tiếng Việt)</label>
                <label className="neo-dropzone" style={{ padding: '0.5rem', minHeight: '80px' }}>
                  <input 
                    type="file" 
                    accept="application/epub+zip,.epub"
                    style={{ display: 'none' }}
                    onChange={(e) => setEditData({...editData, file_epub: e.target.files[0]})}
                  />
                  {editData.file_epub ? (
                    <div className="dropzone-preview">
                      <i className="fa-solid fa-book fa-2x" style={{ color: '#4facfe' }}></i>
                      <p><b>{editData.file_epub.name}</b></p>
                    </div>
                  ) : (
                    <div className="dropzone-placeholder">
                      <i className="fa-solid fa-book fa-2x"></i>
                      <p style={{fontSize: '0.9rem', fontWeight: 600}}>Nhấp để chọn file mới</p>
                    </div>
                  )}
                </label>
              </div>
              
              <div className="col">
                <label>Thay EPUB (Tiếng Anh)</label>
                <label className="neo-dropzone" style={{ padding: '0.5rem', minHeight: '80px' }}>
                  <input 
                    type="file" 
                    accept="application/epub+zip,.epub"
                    style={{ display: 'none' }}
                    onChange={(e) => setEditData({...editData, file_epub_en: e.target.files[0]})}
                  />
                  {editData.file_epub_en ? (
                    <div className="dropzone-preview">
                      <i className="fa-solid fa-book fa-2x" style={{ color: '#8e2de2' }}></i>
                      <p><b>{editData.file_epub_en.name}</b></p>
                    </div>
                  ) : (
                    <div className="dropzone-placeholder">
                      <i className="fa-solid fa-book fa-2x"></i>
                      <p style={{fontSize: '0.9rem', fontWeight: 600}}>Nhấp để chọn file mới</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={closeEditModal}>Hủy</button>
            <button type="submit" className="btn-save"><i className="fa-solid fa-save"></i> Lưu Thay Đổi</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
