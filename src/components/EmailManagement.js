import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaPaperPlane,
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaFileAlt,
  FaCheckSquare,
  FaSquare,
} from 'react-icons/fa';
import Pagination from './Pagination';
import './Management.css';
import './EmailManagement.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const EmailManagement = () => {
  const [formData, setFormData] = useState({
    subject: '',
    html: '',
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templatesPage, setTemplatesPage] = useState(1);
  const [templatesTotalPages, setTemplatesTotalPages] = useState(1);
  const [templatesTotalItems, setTemplatesTotalItems] = useState(0);
  const [templatesItemsPerPage] = useState(10);
  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    subject: '',
    html: '',
    description: '',
  });
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sendMode, setSendMode] = useState('all'); // 'all', 'selected', 'newcomers'
  const [newcomerDays, setNewcomerDays] = useState(7);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);

  useEffect(() => {
    fetchTemplates(templatesPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templatesPage]);

  useEffect(() => {
    if (showUserModal && users.length === 0) {
      fetchUsers(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUserModal]);

  const fetchTemplates = async (page = 1) => {
    try {
      const response = await axios.get(`${API_URL}/email-templates`, {
        params: {
          page: page.toString(),
          limit: templatesItemsPerPage.toString(),
        },
      });

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Paginated response
        setTemplates(response.data.data);
        setTemplatesTotalPages(response.data.totalPages || 1);
        setTemplatesTotalItems(response.data.total || 0);
      } else if (Array.isArray(response.data)) {
        // Non-paginated array response (fallback)
        setTemplates(response.data);
        setTemplatesTotalPages(1);
        setTemplatesTotalItems(response.data.length);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch templates');
    }
  };

  const fetchUsers = async (page = 1, reset = false) => {
    if (loadingUsers) return;
    
    setLoadingUsers(true);
    try {
      const response = await axios.get(`${API_URL}/users`, {
        params: {
          page,
          limit: 20, // Load 20 users per page
        },
      });

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Paginated response
        if (reset) {
          setUsers(response.data.data);
        } else {
          setUsers((prev) => [...prev, ...response.data.data]);
        }
        setUsersPage(page);
        setHasMoreUsers(page < (response.data.totalPages || 1));
      } else if (Array.isArray(response.data)) {
        // Array response (fallback)
        setUsers(reset ? response.data : [...users, ...response.data]);
        setHasMoreUsers(false);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      toast.error(errorMessage);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadMoreUsers = () => {
    if (!loadingUsers && hasMoreUsers) {
      fetchUsers(usersPage + 1, false);
    }
  };

  const handleOpenUserModal = () => {
    setShowUserModal(true);
    if (users.length === 0) {
      fetchUsers(1, true);
    }
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTemplateChange = (e) => {
    setTemplateFormData({
      ...templateFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUseTemplate = (template) => {
    setFormData({
      subject: template.subject,
      html: template.html,
    });
    setSelectedTemplate(template._id);
    toast.success(`Template "${template.name}" loaded`);
  };

  const handleSaveTemplate = async () => {
    if (!templateFormData.name || !templateFormData.subject || !templateFormData.html) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingTemplate) {
        await axios.patch(`${API_URL}/email-templates/${editingTemplate}`, templateFormData);
        toast.success('Template updated successfully');
      } else {
        await axios.post(`${API_URL}/email-templates`, templateFormData);
        toast.success('Template saved successfully');
      }
      fetchTemplates();
      setShowTemplateForm(false);
      setTemplateFormData({ name: '', subject: '', html: '', description: '' });
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleEditTemplate = (template) => {
    setTemplateFormData({
      name: template.name,
      subject: template.subject,
      html: template.html,
      description: template.description || '',
    });
    setEditingTemplate(template._id);
    setShowTemplateForm(true);
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/email-templates/${id}`);
      toast.success('Template deleted successfully');
      await fetchTemplates(templatesPage);
      if (selectedTemplate === id) {
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map((user) => user._id));
  };

  const deselectAllUsers = () => {
    setSelectedUsers([]);
  };

  const handleSend = async () => {
    if (!formData.subject || !formData.html) {
      toast.error('Please fill in subject and message');
      return;
    }

    let confirmMessage = '';
    if (sendMode === 'all') {
      confirmMessage = 'Are you sure you want to send this email to all reached people?';
    } else if (sendMode === 'selected') {
      if (selectedUsers.length === 0) {
        toast.error('Please select at least one person');
        return;
      }
      confirmMessage = `Are you sure you want to send this email to ${selectedUsers.length} selected person(s)?`;
    } else if (sendMode === 'newcomers') {
      confirmMessage = `Are you sure you want to send this email to people reached in the last ${newcomerDays} days?`;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSending(true);
    setResult(null);

    try {
      let response;
      if (sendMode === 'all') {
        response = await axios.post(`${API_URL}/email/send-all`, formData);
      } else if (sendMode === 'selected') {
        response = await axios.post(`${API_URL}/email/send-selected`, {
          ...formData,
          userIds: selectedUsers,
        });
      } else if (sendMode === 'newcomers') {
        response = await axios.post(`${API_URL}/email/send-newcomers`, {
          ...formData,
          daysSinceRegistration: newcomerDays,
        });
      }

      setResult(response.data);
      if (response.data.success > 0) {
        toast.success(`Successfully sent ${response.data.success} email(s)!`);
      }
      if (response.data.failed > 0) {
        toast.warning(`${response.data.failed} email(s) failed to send.`);
      }
      if (sendMode === 'all') {
        setFormData({ subject: '', html: '' });
      }
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error sending email:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send emails';
      toast.error(errorMessage);
      setResult({ success: 0, failed: 0, total: 0, error: errorMessage });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="management">
      <div className="management-header">
        <h1>Email Management</h1>
        <p className="subtitle">Send emails with templates and people selection</p>
      </div>

      <div className="email-management-container">
        {/* Templates Section */}
        <div className="templates-section">
          <div className="section-header">
            <h2>
              <FaFileAlt /> Email Templates
            </h2>
            <button
              className="btn-secondary"
              onClick={() => {
                setShowTemplateForm(!showTemplateForm);
                setEditingTemplate(null);
                setTemplateFormData({ name: '', subject: '', html: '', description: '' });
              }}
            >
              <FaPlus /> {showTemplateForm ? 'Cancel' : 'New Template'}
            </button>
          </div>

          {showTemplateForm && (
            <motion.div
              className="template-form"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  name="name"
                  value={templateFormData.name}
                  onChange={handleTemplateChange}
                  placeholder="e.g., Welcome Email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={templateFormData.description}
                  onChange={handleTemplateChange}
                  placeholder="Template description"
                />
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={templateFormData.subject}
                  onChange={handleTemplateChange}
                  placeholder="Email subject"
                  required
                />
              </div>
              <div className="form-group">
                <label>HTML Content *</label>
                <textarea
                  name="html"
                  value={templateFormData.html}
                  onChange={handleTemplateChange}
                  placeholder="Enter HTML content..."
                  rows="8"
                  required
                />
              </div>
              <div className="form-actions">
                <button className="btn-primary" onClick={handleSaveTemplate}>
                  <FaSave /> {editingTemplate ? 'Update' : 'Save'} Template
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowTemplateForm(false);
                    setTemplateFormData({ name: '', subject: '', html: '', description: '' });
                    setEditingTemplate(null);
                  }}
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </motion.div>
          )}

          <div className="templates-list">
            {templates.length === 0 ? (
              <p className="empty-state">No templates yet. Create your first template!</p>
            ) : (
              templates.map((template) => (
                <motion.div
                  key={template._id}
                  className={`template-card ${selectedTemplate === template._id ? 'selected' : ''}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="template-header">
                    <h3>{template.name}</h3>
                    <div className="template-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleUseTemplate(template)}
                        title="Use Template"
                      >
                        <FaPaperPlane />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleEditTemplate(template)}
                        title="Edit Template"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDeleteTemplate(template._id)}
                        title="Delete Template"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  {template.description && (
                    <p className="template-description">{template.description}</p>
                  )}
                  <div className="template-preview">
                    <strong>Subject:</strong> {template.subject}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {templatesTotalItems > 0 && (
            <Pagination
              currentPage={templatesPage}
              totalPages={templatesTotalPages}
              totalItems={templatesTotalItems}
              itemsPerPage={templatesItemsPerPage}
              onPageChange={(page) => {
                setTemplatesPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>

        {/* Email Form Section */}
        <div className="email-form-section">
          <div className="section-header">
            <h2>Compose Email</h2>
            <div className="send-mode-selector">
              <label>
                <input
                  type="radio"
                  value="all"
                  checked={sendMode === 'all'}
                  onChange={(e) => setSendMode(e.target.value)}
                />
                All Reached People
              </label>
              <label>
                <input
                  type="radio"
                  value="selected"
                  checked={sendMode === 'selected'}
                  onChange={(e) => setSendMode(e.target.value)}
                />
                Selected People
              </label>
              <label>
                <input
                  type="radio"
                  value="newcomers"
                  checked={sendMode === 'newcomers'}
                  onChange={(e) => setSendMode(e.target.value)}
                />
                New Reached People
              </label>
            </div>
          </div>

          {sendMode === 'newcomers' && (
            <div className="form-group">
              <label>Days Since Reached</label>
              <input
                type="number"
                value={newcomerDays}
                onChange={(e) => setNewcomerDays(parseInt(e.target.value) || 7)}
                min="1"
                max="365"
              />
              <small>People reached in the last {newcomerDays} days</small>
            </div>
          )}

          {sendMode === 'selected' && (
            <div className="user-selection-section">
              <div className="selection-header">
                <h3>Selected People: {selectedUsers.length}</h3>
                <button className="btn-primary" onClick={handleOpenUserModal}>
                  <FaUsers /> Select People
                </button>
              </div>
              {selectedUsers.length > 0 && (
                <div className="selected-users-preview">
                  <p>You have selected {selectedUsers.length} person(s)</p>
                  <button className="btn-secondary" onClick={() => setSelectedUsers([])}>
                    Clear Selection
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User Selection Modal */}
          {showUserModal && (
            <div className="modal-overlay" onClick={handleCloseUserModal}>
              <motion.div
                className="user-selection-modal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Select People ({selectedUsers.length} selected)</h2>
                  <button className="btn-icon" onClick={handleCloseUserModal}>
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={selectAllUsers}>
                    Select All Visible
                  </button>
                  <button className="btn-secondary" onClick={deselectAllUsers}>
                    Deselect All
                  </button>
                </div>
                <div
                  className="modal-users-list"
                  onScroll={(e) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.target;
                    // Load more when scrolled to bottom (100px before bottom)
                    if (scrollHeight - scrollTop <= clientHeight + 100 && hasMoreUsers && !loadingUsers) {
                      loadMoreUsers();
                    }
                  }}
                >
                  {users.length === 0 && loadingUsers && (
                    <div className="loading-more">Loading people...</div>
                  )}
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className={`user-item ${selectedUsers.includes(user._id) ? 'selected' : ''}`}
                      onClick={() => toggleUserSelection(user._id)}
                    >
                      {selectedUsers.includes(user._id) ? (
                        <FaCheckSquare className="checkbox checked" />
                      ) : (
                        <FaSquare className="checkbox" />
                      )}
                      <div className="user-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                        {user.groupName && <span className="group-badge">{user.groupName}</span>}
                      </div>
                    </div>
                  ))}
                  {loadingUsers && users.length > 0 && (
                    <div className="loading-more">Loading more people...</div>
                  )}
                  {!hasMoreUsers && users.length > 0 && (
                    <div className="end-of-list">No more people to load</div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn-primary" onClick={handleCloseUserModal}>
                    Done ({selectedUsers.length} selected)
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          <form className="email-form">
            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Email subject"
                required
              />
            </div>
            <div className="form-group">
              <label>Message (HTML) *</label>
              <textarea
                name="html"
                value={formData.html}
                onChange={handleChange}
                placeholder="Enter your HTML email content here..."
                rows="15"
                required
              />
              <small>You can use HTML tags for formatting</small>
            </div>
            <motion.button
              type="button"
              className="btn-primary btn-large"
              onClick={handleSend}
              disabled={
                sending ||
                !formData.subject ||
                !formData.html ||
                (sendMode === 'selected' && selectedUsers.length === 0)
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPaperPlane />{' '}
              {sending
                ? 'Sending...'
                : sendMode === 'all'
                ? 'Send to All Reached People'
                : sendMode === 'selected'
                ? `Send to ${selectedUsers.length} Selected`
                : `Send to New Reached People (${newcomerDays} days)`}
            </motion.button>
          </form>

          {result && (
            <motion.div
              className="email-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3>Email Result</h3>
              {result.error ? (
                <div className="error-message">{result.error}</div>
              ) : (
                <div className="result-stats">
                  <div className="stat-item">
                    <FaUsers />
                    <div>
                      <strong>Total:</strong> {result.total}
                    </div>
                  </div>
                  <div className="stat-item success">
                    <div>
                      <strong>Success:</strong> {result.success}
                    </div>
                  </div>
                  <div className="stat-item danger">
                    <div>
                      <strong>Failed:</strong> {result.failed}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailManagement;
