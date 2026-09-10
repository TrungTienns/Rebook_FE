import React from 'react';
import { motion } from 'framer-motion';
import './Dashboard.scss';

export default function Dashboard() {
  const stats = [
    { id: 1, title: 'Total Users', value: '1,234', icon: 'fa-users', color: '#ffd700' },
    { id: 2, title: 'Total Books', value: '856', icon: 'fa-book', color: '#00e676' },
    { id: 3, title: 'Active Authors', value: '42', icon: 'fa-pen-nib', color: '#ff5722' },
    { id: 4, title: 'Daily Revenue', value: '$345', icon: 'fa-coins', color: '#29b6f6' },
  ];

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
            <button className="btn-small">View All</button>
          </div>
          <div className="card-body empty-state">
            <i className="fa-solid fa-chart-line"></i>
            <p>Activity charts will appear here soon.</p>
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
          <div className="card-body actions-list">
            <button className="action-btn"><i className="fa-solid fa-plus"></i> Add New Book</button>
            <button className="action-btn"><i className="fa-solid fa-user-plus"></i> Invite User</button>
            <button className="action-btn"><i className="fa-solid fa-bullhorn"></i> Create Announcement</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
