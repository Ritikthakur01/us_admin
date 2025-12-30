import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHome,
  FaUsers,
  FaImages,
  FaUserFriends,
  FaEnvelope,
  FaSignOutAlt,
  FaBullhorn,
  FaComments,
  FaQuestionCircle,
  FaEdit,
  FaTimes,
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ onLogout, isOpen, onClose }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Close sidebar when clicking on a menu item (for mobile)
  const handleNavClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/groups', icon: FaUsers, label: 'Groups' },
    { path: '/banners', icon: FaImages, label: 'Banners' },
    { path: '/users', icon: FaUserFriends, label: 'Reached People' },
    { path: '/announcement', icon: FaBullhorn, label: 'Announcement' },
    { path: '/testimonials', icon: FaComments, label: 'Testimonials' },
    { path: '/faqs', icon: FaQuestionCircle, label: 'FAQs' },
    { path: '/form-fields', icon: FaEdit, label: 'Form Fields' },
    { path: '/email', icon: FaEnvelope, label: 'Email' },
  ];

  return (
    <motion.aside
      className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      initial={false}
      animate={isMobile ? (isOpen ? { x: 0 } : { x: -250 }) : { x: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="sidebar-header">
        <button 
          className="sidebar-close-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close menu"
        >
          <FaTimes />
        </button>
        <div className="sidebar-logo">
          <img
            src="/WhatsApp_Image_2025-12-08_at_4.17.05_AM-removebg-preview.png"
            alt="Unique Solution Logo"
            className="sidebar-logo-image"
          />
          <p className="admin-label">Admin Panel</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-button">
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

