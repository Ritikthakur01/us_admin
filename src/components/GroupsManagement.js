import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Management.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const GroupsManagement = () => {
  const [groups, setGroups] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    subdomain: '',
    isActive: true,
    details: { content: '', features: [] },
  });
  const [showForm, setShowForm] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/groups/admin`);
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.patch(`${API_URL}/groups/${editing}`, formData);
      } else {
        await axios.post(`${API_URL}/groups`, formData);
      }
      fetchGroups();
      resetForm();
      toast.success('Group updated successfully!');
    } catch (error) {
      console.error('Error saving group:', error);
      const errorMessage = error.response?.data?.message || 'Error saving group';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (group) => {
    setEditing(group._id);
    setFormData({
      name: group.name,
      description: group.description || '',
      image: group.image || '',
      subdomain: group.subdomain || '',
      isActive: group.isActive,
      details: group.details || { content: '', features: [] },
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    alert('Group deletion is not allowed. The 4 entities are fixed and cannot be deleted.');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      subdomain: '',
      isActive: true,
      details: { content: '', features: [] },
    });
    setEditing(null);
    setShowForm(false);
    setNewFeature('');
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        details: {
          ...formData.details,
          features: [...(formData.details.features || []), newFeature],
        },
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      details: {
        ...formData.details,
        features: formData.details.features.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="management">
      <div className="management-header">
        <div>
          <h1>Entities Management</h1>
          <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>
            Unique Solution Group comprises of 4 fixed entities. You can update their details, images, and content.
          </p>
        </div>
      </div>

      {showForm && (
        <motion.div
          className="form-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editing ? 'Edit Group' : 'Add Group'}</h2>
              <button className="close-btn" onClick={resetForm}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={editing}
                  style={editing ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  title={editing ? 'Entity name cannot be changed' : ''}
                />
                {editing && <small style={{ color: '#6B7280', display: 'block', marginTop: '0.25rem' }}>
                  Entity name is fixed and cannot be changed
                </small>}
              </div>
              <div className="form-group">
                <label>Subdomain</label>
                <input
                  type="text"
                  value={formData.subdomain || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, subdomain: e.target.value })
                  }
                  disabled={editing}
                  style={editing ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  placeholder="e.g., consultants, spices"
                />
                {editing && <small style={{ color: '#6B7280', display: 'block', marginTop: '0.25rem' }}>
                  Subdomain is fixed and cannot be changed
                </small>}
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <ReactQuill
                  value={formData.details.content || ''}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      details: { ...formData.details, content: value },
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Features</label>
                <div className="features-input">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    placeholder="Add a feature and press Enter"
                  />
                  <button type="button" onClick={addFeature} className="btn-small">
                    Add
                  </button>
                </div>
                <ul className="features-list">
                  {(formData.details.features || []).map((feature, index) => (
                    <li key={index}>
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="remove-btn"
                      >
                        <FaTimes />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  Active
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <FaSave /> Save
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      <div className="items-grid">
        {groups.map((group) => (
          <motion.div
            key={group._id}
            className="item-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {group.image && (
              <img src={group.image} alt={group.name} className="item-image" />
            )}
            <div className="item-content">
              <h3>{group.name}</h3>
              <p>{group.description}</p>
              <div className="item-status">
                Status: {group.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className="item-actions">
              <button onClick={() => handleEdit(group)} className="btn-icon" title="Edit Entity">
                <FaEdit />
              </button>
              <button 
                onClick={() => handleDelete(group._id)} 
                className="btn-icon danger" 
                disabled
                title="Cannot delete fixed entities"
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                <FaTrash />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GroupsManagement;

