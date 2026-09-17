import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import userService from '../../../services/userService';
import { useAuth } from '../../../context/AuthContext';
import './User.scss';

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth(); // to prevent self-ban/self-demote

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers();
      if (res?.success) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Lỗi khi tải danh sách người dùng!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await userService.updateUserRole(userId, newRole);
      if (res?.success) {
        toast.success('Cập nhật quyền thành công!');
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đổi quyền');
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    const actionText = newStatus === 'banned' ? 'Khóa (Ban)' : 'Mở khóa (Unban)';
    
    Swal.fire({
      title: `${actionText} người dùng này?`,
      text: newStatus === 'banned' ? 'Người dùng sẽ không thể đăng nhập vào hệ thống.' : 'Người dùng có thể hoạt động bình thường.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
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
          const res = await userService.updateUserStatus(userId, newStatus);
          if (res?.success) {
            toast.success(`Đã ${actionText.toLowerCase()} thành công!`);
            fetchUsers();
          }
        } catch (error) {
          toast.error(error.response?.data?.message || `Lỗi khi ${actionText.toLowerCase()}`);
        }
      }
    });
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return '#ff4757';
      case 'moderator': return '#ffa502';
      case 'author': return '#2ed573';
      default: return '#7bed9f';
    }
  };

  return (
    <div className="admin-users-container">
      <h2 className="admin-title">
        <i className="fa-solid fa-users-gear"></i> Quản Lý Người Dùng
      </h2>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="neo-box list-box"
      >
        <div className="list-header">
          <h3>Danh Sách Người Dùng Hiện Tại</h3>
          <span className="user-count">Tổng: {users.length}</span>
        </div>

        {loading ? (
          <div className="loading-state">
            <i className="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu...
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">Không có dữ liệu người dùng.</div>
        ) : (
          <div className="table-responsive">
            <table className="neo-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Thông tin</th>
                  <th>Phân quyền</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-avatar-info">
                        {u.avatarUrl || u.avatar_url ? (
                          <img src={u.avatarUrl || u.avatar_url} alt="avatar" className="avatar" />
                        ) : (
                          <div className="avatar-placeholder">
                            {(u.fullName || u.username || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="user-names">
                          <span className="full-name">{u.fullName || u.full_name || u.username}</span>
                          <span className="username">@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-contact">
                        <span className="email"><i className="fa-regular fa-envelope"></i> {u.email}</span>
                        <span className="coins"><i className="fa-solid fa-coins" style={{color: '#ffa502'}}></i> {u.coinBalance || u.coin_balance || 0} xu</span>
                      </div>
                    </td>
                    <td>
                      <div className="role-selector">
                        <select 
                          value={u.role} 
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={u.id === currentUser?.id}
                          style={{ borderColor: getRoleBadgeColor(u.role) }}
                          className={`role-select ${u.role}`}
                        >
                          <option value="reader">Reader</option>
                          <option value="author">Author</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${u.status}`}>
                        {u.status === 'active' ? 'Hoạt động' : u.status === 'banned' ? 'Đã khóa' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {u.id !== currentUser?.id && (
                        <button 
                          className={`neo-btn-action ${u.status === 'active' ? 'btn-ban' : 'btn-unban'}`}
                          onClick={() => handleStatusChange(u.id, u.status)}
                          title={u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          <i className={`fa-solid ${u.status === 'active' ? 'fa-lock' : 'fa-unlock'}`}></i>
                          {u.status === 'active' ? ' Ban' : ' Unban'}
                        </button>
                      )}
                      {u.id === currentUser?.id && (
                        <span className="its-you-badge">Bạn</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}