import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSave, FaTimes } from 'react-icons/fa';
import './Management.css';
import './AnnouncementManagement.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    content: '',
    isActive: false,
    link: '',
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    speed: 30,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_URL}/announcement`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to fetch announcements');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error('Please enter announcement content');
      return;
    }

    try {
      if (editingAnnouncement) {
        await axios.patch(
          `${API_URL}/announcement/${editingAnnouncement}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        toast.success('Announcement updated successfully');
      } else {
        await axios.post(`${API_URL}/announcement`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        toast.success('Announcement created successfully');
      }
      await fetchAnnouncements();
      resetForm();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      content: announcement.content,
      isActive: announcement.isActive,
      link: announcement.link || '',
      backgroundColor: announcement.backgroundColor || '#3B82F6',
      textColor: announcement.textColor || '#FFFFFF',
      speed: announcement.speed || 30,
    });
    setEditingAnnouncement(announcement._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/announcement/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success('Announcement deleted successfully');
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/announcement/${id}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('Announcement status updated');
      await fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement:', error);
      toast.error('Failed to update announcement status');
    }
  };

  const resetForm = () => {
    setFormData({
      content: '',
      isActive: false,
      link: '',
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      speed: 30,
    });
    setEditingAnnouncement(null);
    setShowForm(false);
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Announcement Management</h1>
        <p className="subtitle">Only one announcement can exist at a time. Creating a new one will replace the existing announcement.</p>
        <motion.button
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> {announcements.length > 0 ? 'Update Announcement' : 'Create Announcement'}
        </motion.button>
      </div>

      {showForm && (
        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>{editingAnnouncement ? 'Edit Announcement' : announcements.length > 0 ? 'Update Announcement' : 'Create Announcement'}</h2>
          {!editingAnnouncement && announcements.length > 0 && (
            <p style={{ color: '#f59e0b', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ⚠️ Creating a new announcement will replace the existing one.
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Enter announcement text..."
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Link (Optional)</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Background Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    name="backgroundColor"
                    value={formData.backgroundColor}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="backgroundColor"
                    value={formData.backgroundColor}
                    onChange={handleChange}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Text Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    name="textColor"
                    value={formData.textColor}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="textColor"
                    value={formData.textColor}
                    onChange={handleChange}
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Animation Speed (seconds)</label>
              <input
                type="number"
                name="speed"
                value={formData.speed}
                onChange={handleChange}
                min="5"
                max="120"
                step="1"
                placeholder="30"
              />
              <small>Time for one complete animation cycle (5-120 seconds). Lower = faster</small>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <span>Activate this announcement</span>
              </label>
              <small>Only one announcement can be active at a time</small>
            </div>

            <div className="form-actions">
              <motion.button
                type="submit"
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSave /> {editingAnnouncement ? 'Update' : 'Create'}
              </motion.button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="announcements-list">
        {announcements.length === 0 ? (
          <div className="empty-state">
            <p>No announcements yet. Create your first announcement!</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <motion.div
              key={announcement._id}
              className="announcement-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="announcement-preview"
                style={{
                  backgroundColor: announcement.backgroundColor || '#3B82F6',
                  color: announcement.textColor || '#FFFFFF',
                }}
              >
                <div className="announcement-preview-content">
                  {announcement.content}
                </div>
              </div>

              <div className="announcement-details">
                <div className="announcement-info">
                  <p className="announcement-content-text">{announcement.content}</p>
                  {announcement.link && (
                    <p className="announcement-link-text">
                      <strong>Link:</strong> {announcement.link}
                    </p>
                  )}
                  <p className="announcement-meta">
                    <strong>Speed:</strong> {announcement.speed || 30}s | Created: {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="announcement-actions">
                  <button
                    className={`toggle-btn ${announcement.isActive ? 'active' : ''}`}
                    onClick={() => handleToggleActive(announcement._id)}
                    title={announcement.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {announcement.isActive ? (
                      <><FaToggleOn /> Active</>
                    ) : (
                      <><FaToggleOff /> Inactive</>
                    )}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleEdit(announcement)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => handleDelete(announcement._id)}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementManagement;

