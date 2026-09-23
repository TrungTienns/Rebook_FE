import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import AdminHeader from '../../components/AdminHeader/AdminHeader';
import './AdminLayout.scss';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
