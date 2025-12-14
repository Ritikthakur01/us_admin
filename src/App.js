import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GroupsManagement from './components/GroupsManagement';
import BannersManagement from './components/BannersManagement';
import UsersManagement from './components/UsersManagement';
import ThemeManagement from './components/ThemeManagement';
import EmailManagement from './components/EmailManagement';
import AnnouncementManagement from './components/AnnouncementManagement';
import TestimonialsManagement from './components/TestimonialsManagement';
import FaqsManagement from './components/FaqsManagement';
import FormFieldsManagement from './components/FormFieldsManagement';
import Sidebar from './components/Sidebar';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Set up axios interceptor for requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Set up axios interceptor for responses (error handling)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      // Don't show toast for 401 (unauthorized) as it's handled by login redirect
      if (error.response.status !== 401) {
        const { toast } = require('react-toastify');
        toast.error(message);
      }
    } else if (error.request) {
      // Request was made but no response received
      const { toast } = require('react-toastify');
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      const { toast } = require('react-toastify');
      toast.error('An unexpected error occurred');
    }
    return Promise.reject(error);
  }
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.get(`${API_URL}/auth/profile`);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="admin-layout">
                <Sidebar onLogout={handleLogout} />
                <div className="admin-content">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/groups" element={<GroupsManagement />} />
                    <Route path="/banners" element={<BannersManagement />} />
                    <Route path="/users" element={<UsersManagement />} />
                    <Route path="/announcement" element={<AnnouncementManagement />} />
                    <Route path="/testimonials" element={<TestimonialsManagement />} />
                    <Route path="/faqs" element={<FaqsManagement />} />
                    <Route path="/form-fields" element={<FormFieldsManagement />} />
                    <Route path="/theme" element={<ThemeManagement />} />
                    <Route path="/email" element={<EmailManagement />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;

