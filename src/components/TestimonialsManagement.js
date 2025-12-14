import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaToggleOn, FaToggleOff, FaStar } from 'react-icons/fa';
import './Management.css';
import './TestimonialsManagement.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ENTITY_OPTIONS = [
  { value: 'Consultants', label: 'Consultants' },
  { value: 'Spices', label: 'Spices' },
  { value: 'Enterprises', label: 'Enterprises' },
  { value: 'Foundation', label: 'Foundation' },
];

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    content: '',
    rating: 5,
    entity: 'Consultants',
    isActive: true,
    order: 0,
    image: '',
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get(`${API_URL}/testimonials/admin`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to fetch testimonials');
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
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('Please fill in required fields (Name and Content)');
      return;
    }

    try {
      if (editingTestimonial) {
        await axios.patch(
          `${API_URL}/testimonials/${editingTestimonial}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        toast.success('Testimonial updated successfully');
      } else {
        await axios.post(`${API_URL}/testimonials`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        toast.success('Testimonial created successfully');
      }
      await fetchTestimonials();
      resetForm();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Failed to save testimonial');
    }
  };

  const handleEdit = (testimonial) => {
    setFormData({
      name: testimonial.name,
      role: testimonial.role || '',
      company: testimonial.company || '',
      content: testimonial.content,
      rating: testimonial.rating || 5,
      entity: testimonial.entity || 'Consultants',
      isActive: testimonial.isActive,
      order: testimonial.order || 0,
      image: testimonial.image || '',
    });
    setEditingTestimonial(testimonial._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/testimonials/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success('Testimonial deleted successfully');
      await fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const handleToggleActive = async (id, currentState) => {
    try {
      await axios.patch(
        `${API_URL}/testimonials/${id}`,
        { isActive: !currentState },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('Testimonial status updated');
      await fetchTestimonials();
    } catch (error) {
      console.error('Error toggling testimonial:', error);
      toast.error('Failed to update testimonial status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      company: '',
      content: '',
      rating: 5,
      entity: 'Consultants',
      isActive: true,
      order: 0,
      image: '',
    });
    setEditingTestimonial(null);
    setShowForm(false);
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Testimonials Management</h1>
        <p className="subtitle">Manage client testimonials and reviews</p>
        <motion.button
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> New Testimonial
        </motion.button>
      </div>

      {showForm && (
        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>{editingTestimonial ? 'Edit Testimonial' : 'Create Testimonial'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Client name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Job Seeker, Home Chef, etc."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Placed at Tech Corp, Regular Customer, etc."
                />
              </div>

              <div className="form-group">
                <label>Entity</label>
                <select name="entity" value={formData.entity} onChange={handleChange}>
                  {ENTITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Content/Testimonial Text *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Enter the testimonial content..."
                rows="5"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`rating-star ${star <= formData.rating ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, rating: star })}
                    >
                      <FaStar />
                    </button>
                  ))}
                  <span className="rating-value">{formData.rating} / 5</span>
                </div>
              </div>

              <div className="form-group">
                <label>Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  min="0"
                />
                <small>Lower numbers appear first</small>
              </div>
            </div>

            <div className="form-group">
              <label>Profile Image URL (Optional)</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <span>Active</span>
              </label>
            </div>

            <div className="form-actions">
              <motion.button
                type="submit"
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSave /> {editingTestimonial ? 'Update' : 'Create'}
              </motion.button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="testimonials-list">
        {testimonials.length === 0 ? (
          <div className="empty-state">
            <p>No testimonials yet. Create your first testimonial!</p>
          </div>
        ) : (
          testimonials.map((testimonial) => (
            <motion.div
              key={testimonial._id}
              className="testimonial-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="testimonial-preview">
                <div className="testimonial-header">
                  <div className="testimonial-rating-preview">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <FaStar key={i} className="star-icon" />
                    ))}
                  </div>
                  <span className="testimonial-entity-badge">{testimonial.entity || 'Consultants'}</span>
                </div>
                <p className="testimonial-content-preview">"{testimonial.content}"</p>
                <div className="testimonial-author-preview">
                  <div>
                    <h4>{testimonial.name}</h4>
                    {testimonial.role && <p>{testimonial.role}</p>}
                    {testimonial.company && <p className="company">{testimonial.company}</p>}
                  </div>
                </div>
              </div>

              <div className="testimonial-details">
                <div className="testimonial-info">
                  <p className="testimonial-meta">
                    Order: {testimonial.order || 0} | Created: {new Date(testimonial.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="testimonial-actions">
                  <button
                    className={`toggle-btn ${testimonial.isActive ? 'active' : ''}`}
                    onClick={() => handleToggleActive(testimonial._id, testimonial.isActive)}
                    title={testimonial.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {testimonial.isActive ? (
                      <><FaToggleOn /> Active</>
                    ) : (
                      <><FaToggleOff /> Inactive</>
                    )}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleEdit(testimonial)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => handleDelete(testimonial._id)}
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

export default TestimonialsManagement;

