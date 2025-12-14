import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaToggleOn, FaToggleOff, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './Management.css';
import './FormFieldsManagement.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select/Dropdown' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
];

const FormFieldsManagement = () => {
  const [fields, setFields] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    isActive: true,
    order: 0,
    placeholder: '',
    options: [],
    validation: {
      minLength: undefined,
      maxLength: undefined,
      pattern: undefined,
    },
  });
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const response = await axios.get(`${API_URL}/form-fields/admin`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setFields(response.data);
    } catch (error) {
      console.error('Error fetching form fields:', error);
      toast.error('Failed to fetch form fields');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('validation.')) {
      const validationField = name.split('.')[1];
      setFormData({
        ...formData,
        validation: {
          ...formData.validation,
          [validationField]: value ? (type === 'number' ? Number(value) : value) : undefined,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
      });
    }
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setFormData({
        ...formData,
        options: [...(formData.options || []), newOption.trim()],
      });
      setNewOption('');
    }
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...(formData.options || [])];
    newOptions.splice(index, 1);
    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.label.trim()) {
      toast.error('Please fill in name and label');
      return;
    }

    // Clean up validation object (remove undefined values)
    const cleanedValidation = {};
    if (formData.validation.minLength) cleanedValidation.minLength = formData.validation.minLength;
    if (formData.validation.maxLength) cleanedValidation.maxLength = formData.validation.maxLength;
    if (formData.validation.pattern) cleanedValidation.pattern = formData.validation.pattern;

    const submitData = {
      ...formData,
      validation: Object.keys(cleanedValidation).length > 0 ? cleanedValidation : undefined,
      options: formData.type === 'select' ? (formData.options || []) : undefined,
    };

    try {
      if (editingField) {
        await axios.patch(
          `${API_URL}/form-fields/${editingField}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        toast.success('Form field updated successfully');
      } else {
        await axios.post(`${API_URL}/form-fields`, submitData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        toast.success('Form field created successfully');
      }
      await fetchFields();
      resetForm();
    } catch (error) {
      console.error('Error saving form field:', error);
      toast.error('Failed to save form field');
    }
  };

  const handleEdit = (field) => {
    setFormData({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required || false,
      isActive: field.isActive,
      order: field.order || 0,
      placeholder: field.placeholder || '',
      options: field.options || [],
      validation: field.validation || {
        minLength: undefined,
        maxLength: undefined,
        pattern: undefined,
      },
    });
    setEditingField(field._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form field?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/form-fields/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success('Form field deleted successfully');
      await fetchFields();
    } catch (error) {
      console.error('Error deleting form field:', error);
      toast.error('Failed to delete form field');
    }
  };

  const handleToggleActive = async (id, currentState) => {
    try {
      await axios.patch(
        `${API_URL}/form-fields/${id}`,
        { isActive: !currentState },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('Form field status updated');
      await fetchFields();
    } catch (error) {
      console.error('Error toggling form field:', error);
      toast.error('Failed to update form field status');
    }
  };

  const handleReorder = async (id, direction) => {
    const field = fields.find((f) => f._id === id);
    if (!field) return;

    const currentIndex = fields.findIndex((f) => f._id === id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= fields.length) return;

    const targetField = fields[newIndex];
    const newOrder = targetField.order;
    const currentOrder = field.order;

    try {
      // Swap orders
      await Promise.all([
        axios.patch(
          `${API_URL}/form-fields/${id}`,
          { order: newOrder },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        ),
        axios.patch(
          `${API_URL}/form-fields/${targetField._id}`,
          { order: currentOrder },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        ),
      ]);
      await fetchFields();
    } catch (error) {
      console.error('Error reordering fields:', error);
      toast.error('Failed to reorder fields');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      type: 'text',
      required: false,
      isActive: true,
      order: 0,
      placeholder: '',
      options: [],
      validation: {
        minLength: undefined,
        maxLength: undefined,
        pattern: undefined,
      },
    });
    setEditingField(null);
    setShowForm(false);
    setNewOption('');
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Form Fields Management</h1>
        <p className="subtitle">Manage contact form fields dynamically</p>
        <motion.button
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> New Field
        </motion.button>
      </div>

      {showForm && (
        <motion.div
          className="form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>{editingField ? 'Edit Form Field' : 'Create Form Field'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Field Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., name, email, phone"
                  required
                  pattern="[a-z][a-z0-9_]*"
                  title="Lowercase letters, numbers, and underscores only"
                />
                <small>Used as field identifier (lowercase, no spaces)</small>
              </div>

              <div className="form-group">
                <label>Display Label *</label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  placeholder="e.g., Full Name, Email Address"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Field Type *</label>
                <select name="type" value={formData.type} onChange={handleChange} required>
                  {FIELD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
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
              <label>Placeholder</label>
              <input
                type="text"
                name="placeholder"
                value={formData.placeholder}
                onChange={handleChange}
                placeholder="Enter placeholder text"
              />
            </div>

            {formData.type === 'select' && (
              <div className="form-group">
                <label>Options</label>
                <div className="options-input">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    placeholder="Enter option and press Enter"
                  />
                  <button type="button" onClick={handleAddOption} className="btn-secondary">
                    <FaPlus /> Add
                  </button>
                </div>
                {formData.options && formData.options.length > 0 && (
                  <div className="options-list">
                    {formData.options.map((option, index) => (
                      <div key={index} className="option-item">
                        <span>{option}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="btn-icon danger"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Validation Rules</label>
              <div className="validation-rules">
                <input
                  type="number"
                  name="validation.minLength"
                  value={formData.validation.minLength || ''}
                  onChange={handleChange}
                  placeholder="Min Length"
                  min="0"
                />
                <input
                  type="number"
                  name="validation.maxLength"
                  value={formData.validation.maxLength || ''}
                  onChange={handleChange}
                  placeholder="Max Length"
                  min="0"
                />
                <input
                  type="text"
                  name="validation.pattern"
                  value={formData.validation.pattern || ''}
                  onChange={handleChange}
                  placeholder="Regex Pattern (optional)"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="required"
                  checked={formData.required}
                  onChange={handleChange}
                />
                <span>Required Field</span>
              </label>
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
                <FaSave /> {editingField ? 'Update' : 'Create'}
              </motion.button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="fields-list">
        {fields.length === 0 ? (
          <div className="empty-state">
            <p>No form fields yet. Create your first field!</p>
          </div>
        ) : (
          fields.map((field) => (
            <motion.div
              key={field._id}
              className="field-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="field-header">
                <div className="field-info">
                  <h3>{field.label}</h3>
                  <p className="field-meta">
                    <span className="field-name">{field.name}</span>
                    <span className="field-type">{field.type}</span>
                    {field.required && <span className="field-required">Required</span>}
                  </p>
                  {field.placeholder && (
                    <p className="field-placeholder">Placeholder: "{field.placeholder}"</p>
                  )}
                  {field.options && field.options.length > 0 && (
                    <p className="field-options">
                      Options: {field.options.join(', ')}
                    </p>
                  )}
                  <p className="field-order">Order: {field.order || 0}</p>
                </div>
                <div className="field-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleReorder(field._id, 'up')}
                    title="Move Up"
                    disabled={fields.indexOf(field) === 0}
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleReorder(field._id, 'down')}
                    title="Move Down"
                    disabled={fields.indexOf(field) === fields.length - 1}
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    className={`toggle-btn ${field.isActive ? 'active' : ''}`}
                    onClick={() => handleToggleActive(field._id, field.isActive)}
                    title={field.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {field.isActive ? (
                      <><FaToggleOn /> Active</>
                    ) : (
                      <><FaToggleOff /> Inactive</>
                    )}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleEdit(field)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => handleDelete(field._id)}
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

export default FormFieldsManagement;

