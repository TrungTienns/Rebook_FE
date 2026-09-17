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
        
        <NavLink 
          to={path.ADMIN_STATISTICS} 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-chart-line"></i>
          <span>Thống kê</span>
        </NavLink>

        <NavLink 
          to={path.ADMIN_USERS} 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-users"></i>
          <span>Users</span>
        </NavLink>
        
        <NavLink 
          to={path.ADMIN_BOOKS} 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-book"></i>
          <span>Books</span>
        </NavLink>

        <NavLink 
          to={path.ADMIN_CHAPTERS} 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-file-pdf"></i>
          <span>Chapters</span>
        </NavLink>

        <NavLink 
          to={path.ADMIN_CATEGORIES} 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-tags"></i>
          <span>Categories</span>
        </NavLink>
        
        <NavLink 
          to={path.ADMIN_COMMENTS} 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-comments"></i>
          <span>Comments</span>
        </NavLink>

        <NavLink 
          to={path.ADMIN_RATINGS} 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-star"></i>
          <span>Ratings</span>
        </NavLink>

        <NavLink 
          to={path.ADMIN_NOTIFICATIONS} 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <i className="fa-solid fa-bell"></i>
          <span>Notifications</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <NavLink to={path.HOME} className="back-to-home">
          <i className="fa-solid fa-arrow-left"></i>
          <span>Back to Site</span>
        </NavLink>
      </div>
    </aside>
  );
}
