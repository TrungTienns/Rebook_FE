import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { path } from '../../common/path';
import Swal from 'sweetalert2';
import './AdminHeader.scss';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    Swal.fire({
      title: 'Đăng xuất?',
      text: "Bạn có chắc chắn muốn thoát khỏi trang Admin?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff5252',
      cancelButtonColor: '#1a1a1a',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate(path.HOME);
      }
    });
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <h2 className="header-title">Admin Dashboard</h2>
      </div>
      
      <div className="header-right">
        <div className="user-info">
          <div className="avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user?.fullName || 'Admin'} />
            ) : (
              <i className="fa-solid fa-user-shield"></i>
            )}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.fullName || 'Admin User'}</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
        
        <button onClick={handleLogout} className="btn-logout">
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
