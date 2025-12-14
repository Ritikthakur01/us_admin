import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaUsers, FaImages, FaUserFriends, FaPalette } from 'react-icons/fa';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [stats, setStats] = useState({
    groups: 0,
    banners: 0,
    users: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [groupsRes, bannersRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/groups/admin`),
        axios.get(`${API_URL}/banners/admin?page=1&limit=1`),
        axios.get(`${API_URL}/users?page=1&limit=1`),
      ]);
      
      // Handle groups (array response)
      const groupsCount = Array.isArray(groupsRes.data) ? groupsRes.data.length : 0;
      
      // Handle banners (paginated response)
      let bannersCount = 0;
      if (bannersRes.data && bannersRes.data.total !== undefined) {
        bannersCount = bannersRes.data.total;
      } else if (Array.isArray(bannersRes.data)) {
        bannersCount = bannersRes.data.length;
      } else if (bannersRes.data && Array.isArray(bannersRes.data.data)) {
        bannersCount = bannersRes.data.total || bannersRes.data.data.length;
      }
      
      // Handle users (paginated response)
      let usersCount = 0;
      if (usersRes.data && usersRes.data.total !== undefined) {
        usersCount = usersRes.data.total;
      } else if (Array.isArray(usersRes.data)) {
        usersCount = usersRes.data.length;
      } else if (usersRes.data && Array.isArray(usersRes.data.data)) {
        usersCount = usersRes.data.total || usersRes.data.data.length;
      }
      
      setStats({
        groups: groupsCount,
        banners: bannersCount,
        users: usersCount,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const statCards = [
    { icon: FaUsers, label: 'Groups', value: stats.groups, color: '#3B82F6' },
    { icon: FaImages, label: 'Banners', value: stats.banners, color: '#8B5CF6' },
    { icon: FaUserFriends, label: 'Reached People', value: stats.users, color: '#10B981' },
    { icon: FaPalette, label: 'Theme', value: 'Active', color: '#F59E0B' },
  ];

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>
      <div className="stats-grid">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="stat-icon" style={{ color: card.color }}>
                <Icon />
              </div>
              <div className="stat-content">
                <h3>{card.value}</h3>
                <p>{card.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;

