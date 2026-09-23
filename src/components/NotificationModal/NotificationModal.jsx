import {  useState  } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axiosClient from '../../services/axiosClient';
import CustomSearchableDropdown from '../CustomSearchableDropdown/CustomSearchableDropdown';
import './NotificationModal.scss';

export default function NotificationModal({ isOpen, onClose, onSuccess }) {
  const [isSending, setIsSending] = useState(false);
  const [notifData, setNotifData] = useState({
    title: '',
    message: '',
    type: 'system',
    link: ''
  });

  if (!isOpen) return null;

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifData.title || !notifData.message) {
      toast.warning('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }
    
    setIsSending(true);
    try {
      const res = await axiosClient.post('/notifications', notifData);
      if (res?.success) {
        toast.success(`Đã gửi thông báo đến ${res.data.sentCount} người dùng!`);
        setNotifData({ title: '', message: '', type: 'system', link: '' });
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi gửi thông báo');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="modal-content neo-box"
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="modal-header">
          <h2><i className="fa-solid fa-bullhorn"></i> Gửi Thông Báo Mới</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
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
            <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={isSending}>
              {isSending ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>} Gửi Tất Cả
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
