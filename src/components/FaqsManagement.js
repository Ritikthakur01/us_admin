import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import './Management.css';
import './FaqsManagement.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FaqsManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    isActive: true,
    order: 0,
    category: '',
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await axios.get(`${API_URL}/faqs/admin`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setFaqs(response.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to fetch FAQs');
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
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }

    try {
      if (editingFaq) {
        await axios.patch(
          `${API_URL}/faqs/${editingFaq}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        toast.success('FAQ updated successfully');
      } else {
        await axios.post(`${API_URL}/faqs`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        toast.success('FAQ created successfully');
      }
      await fetchFaqs();
      resetForm();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('Failed to save FAQ');
    }
  };

  const handleEdit = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      isActive: faq.isActive,
      order: faq.order || 0,
      category: faq.category || '',
    });
    setEditingFaq(faq._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/faqs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success('FAQ deleted successfully');
      await fetchFaqs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  const handleToggleActive = async (id, currentState) => {
    try {
      await axios.patch(
        `${API_URL}/faqs/${id}`,
        { isActive: !currentState },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('FAQ status updated');
      await fetchFaqs();
    } catch (error) {
      console.error('Error toggling FAQ:', error);
      toast.error('Failed to update FAQ status');
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      isActive: true,
      order: 0,
      category: '',
    });
    setEditingFaq(null);
    setShowForm(false);
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>FAQ Management</h1>
        <p className="subtitle">Manage frequently asked questions</p>
        <motion.button
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> New FAQ
        </motion.button>
      </div>

      {showForm && (
        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>{editingFaq ? 'Edit FAQ' : 'Create FAQ'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Question *</label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleChange}
                placeholder="Enter the question"
                required
              />
            </div>

            <div className="form-group">
              <label>Answer *</label>
              <textarea
                name="answer"
                value={formData.answer}
                onChange={handleChange}
                placeholder="Enter the answer"
                rows="5"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category (Optional)</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., General, Services, Products"
                />
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
                <FaSave /> {editingFaq ? 'Update' : 'Create'}
              </motion.button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="faqs-list">
        {faqs.length === 0 ? (
          <div className="empty-state">
            <p>No FAQs yet. Create your first FAQ!</p>
          </div>
        ) : (
          faqs.map((faq) => (
            <motion.div
              key={faq._id}
              className="faq-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="faq-content">
                <div className="faq-question-preview">
                  <h3>{faq.question}</h3>
                  {faq.category && (
                    <span className="faq-category">{faq.category}</span>
                  )}
                </div>
                <p className="faq-answer-preview">{faq.answer}</p>
                <p className="faq-meta">
                  Order: {faq.order || 0} | Created: {new Date(faq.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="faq-actions">
                <button
                  className={`toggle-btn ${faq.isActive ? 'active' : ''}`}
                  onClick={() => handleToggleActive(faq._id, faq.isActive)}
                  title={faq.isActive ? 'Deactivate' : 'Activate'}
                >
                  {faq.isActive ? (
                    <><FaToggleOn /> Active</>
                  ) : (
                    <><FaToggleOff /> Inactive</>
                  )}
                </button>
                <button
                  className="btn-icon"
                  onClick={() => handleEdit(faq)}
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  className="btn-icon danger"
                  onClick={() => handleDelete(faq._id)}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default FaqsManagement;

