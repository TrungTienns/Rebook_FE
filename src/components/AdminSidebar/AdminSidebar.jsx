import React from 'react';
import { NavLink } from 'react-router-dom';
import { path } from '../../common/path';
import Logo from '../Logo/Logo';
import './AdminSidebar.scss';

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <Logo variant="admin" />
      </div>
      
      <nav className="sidebar-nav">
        <NavLink 
          to={path.ADMIN_DASHBOARD} 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-chart-pie"></i>
          <span>Dashboard</span>
        </NavLink>
        
        {/* Placeholder for future routes */}
        <NavLink 
          to="/admin/users" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-users"></i>
          <span>Users</span>
        </NavLink>
        
        <NavLink 
          to="/admin/books" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-book"></i>
          <span>Books</span>
        </NavLink>

        <NavLink 
          to="/admin/categories" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-tags"></i>
          <span>Categories</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <a href={path.HOME} className="back-to-home">
          <i className="fa-solid fa-arrow-left"></i>
          <span>Back to Site</span>
        </a>
      </div>
    </aside>
  );
}
