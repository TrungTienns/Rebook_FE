import {  useState, useEffect  } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import axiosClient from '../../../services/axiosClient';
import CustomSearchableDropdown from '../../../components/CustomSearchableDropdown/CustomSearchableDropdown';
import './NotificationManagement.scss';

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showNotifModal, setShowNotifModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notifData, setNotifData] = useState({
    title: '',
    message: '',
    type: 'system',
    link: ''
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/notifications/admin/all');
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, []);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifData.title || !notifData.message) {
      toast.warning('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }
    
    setIsSending(true);
    try {
      const res = await axiosClient.post('/notifications', notifData);
      if (res.success) {
        toast.success(`Đã gửi thông báo đến ${res.data.sentCount} người dùng!`);
        setShowNotifModal(false);
        setNotifData({ title: '', message: '', type: 'system', link: '' });
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi gửi thông báo');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteGroup = (title, message, created_at) => {
    Swal.fire({
      title: 'Bạn chắc chắn muốn xoá?',
      text: `Thông báo "${title}" sẽ bị thu hồi khỏi tất cả người dùng!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff5252',
      cancelButtonColor: '#1a1a1a',
      confirmButtonText: 'Có, Xoá ngay!',
      cancelButtonText: 'Huỷ',
      customClass: {
        popup: 'neo-popup',
        confirmButton: 'neo-btn-swal neo-btn-danger',
        cancelButton: 'neo-btn-swal neo-btn-cancel'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosClient.delete('/notifications/admin/group', {
            data: { title, message, created_at }
          });
          if (res.success) {
            toast.success('Đã xoá thông báo thành công!');
            fetchNotifications();
          }
        } catch (err) {
          console.error(err);
          toast.error('Lỗi khi xoá thông báo');
        }
      }
    });
  };

  return (
    <div className="admin-notification-management">
      <div className="header-actions">
        <h1>Quản lý Thông báo</h1>
        <button className="btn-add-notif" onClick={() => setShowNotifModal(true)}>
          <i className="fa-solid fa-plus"></i> Thêm Thông Báo
        </button>
      </div>

      <div className="notifications-table-container">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : notifications.length === 0 ? (
          <div className="empty">Chưa có thông báo nào được gửi.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Nội dung</th>
                <th>Loại</th>
                <th>Đã gửi đến</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notif, index) => (
                <tr key={`${notif.title}-${notif.created_at}-${index}`}>
                  <td>{notif.title}</td>
                  <td className="message-cell" title={notif.message}>{notif.message}</td>
                  <td>
                    <span className={`type-badge ${notif.type}`}>
                      {notif.type === 'system' ? 'Hệ thống' : notif.type === 'promotion' ? 'Khuyến mãi' : 'Sách mới'}
                    </span>
                  </td>
                  <td>{notif.sentCount} người</td>
                  <td>{new Date(notif.created_at).toLocaleString('vi-VN')}</td>
                  <td>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteGroup(notif.title, notif.message, notif.created_at)}
                    >
                      <i className="fa-solid fa-trash"></i> Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showNotifModal && (
        <div className="modal-overlay" onClick={() => setShowNotifModal(false)}>
          <motion.div 
            className="modal-content neo-box"
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="modal-header">
              <h2><i className="fa-solid fa-bullhorn"></i> Gửi Thông Báo Mới</h2>
              <button className="close-btn" onClick={() => setShowNotifModal(false)}>✖</button>
            </div>
            
            <form onSubmit={handleSendNotification} className="modal-body">
              <div className="form-group">
                <label>Tiêu đề (Title)</label>
                <input 
                  type="text" 
                  value={notifData.title}
                  onChange={e => setNotifData({...notifData, title: e.target.value})}
                  placeholder="Nhập tiêu đề thông báo..."
                />
              </div>
              <div className="form-group">
                <label>Nội dung (Message)</label>
                <textarea 
                  rows="3"
                  value={notifData.message}
                  onChange={e => setNotifData({...notifData, message: e.target.value})}
                  placeholder="Nhập nội dung chi tiết..."
                ></textarea>
              </div>
              <div className="form-group">
                <label>Loại (Type)</label>
                <CustomSearchableDropdown 
                  value={notifData.type}
                  onChange={val => setNotifData({...notifData, type: val})}
                  options={[
                    { value: "system", label: "Hệ thống (System)" },
                    { value: "promotion", label: "Khuyến mãi (Promotion)" },
                    { value: "new_book", label: "Sách mới (New Book)" }
                  ]}
                  placeholder="Chọn loại thông báo..."
                />
              </div>
              <div className="form-group">
                <label>Đường dẫn liên kết (Link - Tuỳ chọn)</label>
                <input 
                  type="text" 
                  value={notifData.link}
                  onChange={e => setNotifData({...notifData, link: e.target.value})}
                  placeholder="/book/slug-sach-moi"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowNotifModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={isSending}>
                  {isSending ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>} Gửi Tất Cả
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
