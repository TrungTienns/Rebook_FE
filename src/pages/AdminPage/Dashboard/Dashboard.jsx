import {  useState, useEffect  } from 'react';
import { motion } from 'framer-motion';
import { path } from '../../../common/path';
import adminService from '../../../services/adminService';
import { toast } from 'react-toastify';
import './Dashboard.scss';
import { Link } from 'react-router-dom';
import CustomSearchableDropdown from '../../../components/CustomSearchableDropdown/CustomSearchableDropdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const mockActivityData = [
    { name: 'Mon', users: 12, revenue: 15 },
    { name: 'Tue', users: 19, revenue: 25 },
    { name: 'Wed', users: 15, revenue: 20 },
    { name: 'Thu', users: 22, revenue: 35 },
    { name: 'Fri', users: 30, revenue: 45 },
    { name: 'Sat', users: 45, revenue: 60 },
    { name: 'Sun', users: 50, revenue: 75 },
  ];

  const [dataStats, setDataStats] = useState({
    totalUsers: '0',
    totalBooks: '0',
    activeAuthors: '0',
    dailyRevenue: '0'
  });
  
  // Notification Modal State
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifData, setNotifData] = useState({ title: '', message: '', type: 'system', link: '' });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res?.success) {
          setDataStats(res.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { id: 1, title: 'Total Users', value: dataStats.totalUsers.toLocaleString(), icon: 'fa-users', color: '#ffd700' },
    { id: 2, title: 'Total Books', value: dataStats.totalBooks.toLocaleString(), icon: 'fa-book', color: '#00e676' },
    { id: 3, title: 'Active Authors', value: dataStats.activeAuthors.toLocaleString(), icon: 'fa-pen-nib', color: '#ff5722' },
    { id: 4, title: 'Daily Revenue', value: `$${dataStats.dailyRevenue.toLocaleString()}`, icon: 'fa-coins', color: '#29b6f6' },
  ];

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifData.title || !notifData.message) {
      return toast.warning('Vui lòng nhập đủ Tiêu đề và Nội dung!');
    }
    
    try {
      setIsSending(true);
      const res = await adminService.createNotification(notifData);
      if (res?.success) {
        toast.success(`Đã gửi thông báo đến ${res.data.sentCount} người dùng!`);
        setShowNotifModal(false);
        setNotifData({ title: '', message: '', type: 'system', link: '' });
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi gửi thông báo!');
    } finally {
      setIsSending(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">Welcome back to the Rebook control center.</p>
      </div>

      <motion.div 
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat) => (
          <motion.div 
            key={stat.id} 
            className="stat-card"
            variants={itemVariants}
          >
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div className="stat-info">
              <h3 className="stat-title">{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="bento-grid">
        <motion.div 
          className="bento-card recent-activity"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="card-header">
            <h3>Recent Activity</h3>
            <Link to={path.ADMIN_STATISTICS} className="btn-small">View All</Link>
          </div>
          <div className="card-body" style={{ height: '300px', padding: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="name" tick={{fontFamily: 'Fredoka', fontSize: 12}} />
                <YAxis tick={{fontFamily: 'Fredoka', fontSize: 12}} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '2px solid #000', fontWeight: '700' }} />
                <Line type="monotone" dataKey="users" name="New Users" stroke="#ff5722" strokeWidth={3} activeDot={{ r: 6, stroke: '#000', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          className="bento-card quick-actions"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="actions-list">
            <Link to={path.ADMIN_BOOKS} className="action-btn"><i className="fa-solid fa-plus"></i> Add New Book</Link>
            <Link to={path.ADMIN_USERS} className="action-btn"><i className="fa-solid fa-user-plus"></i> Invite User</Link>
            <button className="action-btn" onClick={() => setShowNotifModal(true)}>
              <i className="fa-solid fa-bullhorn"></i> Create Announcement
            </button>
          </div>
        </motion.div>
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
              <h2><i className="fa-solid fa-bullhorn"></i> Broadcast Notification</h2>
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
