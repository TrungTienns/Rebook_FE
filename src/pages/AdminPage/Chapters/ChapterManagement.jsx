import { useState, useEffect } from 'react';
import axiosClient from '../../../services/axiosClient';
import './ChapterManagement.scss';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import ChapterTable from './components/ChapterTable';
import ChapterCreateForm from './components/ChapterCreateForm';
import ChapterEditModal from './components/ChapterEditModal';

export default function ChapterManagement() {
  const [activeTab, setActiveTab] = useState('manage');
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('desc');
  const [bookIdFilter, setBookIdFilter] = useState('');
  const [booksList, setBooksList] = useState([]);

  // Modal Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: null, chapterNumber: '', title: '',
    file_pdf: null, file_pdf_en: null, file_epub: null, file_epub_en: null,
    isVip: false, priceCoin: 0
  });

  const fetchBooks = async () => {
    try {
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
      text: "Hành động này sẽ xóa dữ liệu và cả file trên Cloudinary. Không thể hoàn tác!",
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Xóa luôn', cancelButtonText: 'Hủy',
      buttonsStyling: false,
      customClass: { popup: 'neo-swal-popup', title: 'neo-swal-title', confirmButton: 'neo-swal-btn confirm', cancelButton: 'neo-swal-btn cancel' }
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
      id: chapter.id, chapterNumber: chapter.chapterNumber, title: chapter.title,
      isVip: chapter.isVip, priceCoin: chapter.priceCoin,
      file_pdf: null, file_pdf_en: null, file_epub: null, file_epub_en: null
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditData({ id: null, chapterNumber: '', title: '', file_pdf: null, file_pdf_en: null, file_epub: null, file_epub_en: null, isVip: false, priceCoin: 0 });
  };

  return (
    <div className="chapter-management-container neo-container">
      <div className="admin-header-box">
        <h1><i className="fa-solid fa-file-pdf"></i> Quản Lý Các Chương</h1>
        <p>Tìm kiếm, sắp xếp, tải lên và sửa đổi thông tin các chương truyện</p>
      </div>

      <div className="tab-switcher">
        <button className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
          <i className="fa-solid fa-cloud-arrow-up"></i> Upload Chương
        </button>
        <button className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>
          <i className="fa-solid fa-list"></i> Danh Sách Chương
        </button>
      </div>

      {activeTab === 'upload' ? (
        <ChapterCreateForm 
          booksList={booksList} 
          setActiveTab={setActiveTab} 
          fetchChapters={fetchChapters} 
        />
      ) : (
        <ChapterTable 
          chapters={chapters} loading={loading} totalPages={totalPages} 
          page={page} setPage={setPage} search={search} setSearch={setSearch} 
          sort={sort} setSort={setSort} bookIdFilter={bookIdFilter} 
          setBookIdFilter={setBookIdFilter} booksList={booksList} 
          openEditModal={openEditModal} handleDelete={handleDelete} 
        />
      )}

      {isEditModalOpen && (
        <ChapterEditModal 
          editData={editData} 
          setEditData={setEditData} 
          closeEditModal={closeEditModal} 
          fetchChapters={fetchChapters} 
        />
      )}
    </div>
  );
}
