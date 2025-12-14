import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import Pagination from './Pagination';
import './Management.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const BannersManagement = () => {
  const [banners, setBanners] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    isActive: true,
    order: 0,
    carouselType: 'auto',
  });
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchBanners(currentPage);
  }, [currentPage]);

  const fetchBanners = async (page = 1) => {
    try {
      const response = await axios.get(`${API_URL}/banners/admin`, {
        params: {
          page,
          limit: itemsPerPage,
        },
      });
      
      // Check if response has pagination structure
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Paginated response
        setBanners(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);
      } else if (Array.isArray(response.data)) {
        // Non-paginated array response - apply client-side pagination
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = response.data.slice(startIndex, endIndex);
        setBanners(paginatedData);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
        setTotalItems(response.data.length);
      } else {
        // Fallback
        setBanners([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.patch(`${API_URL}/banners/${editing}`, formData);
      } else {
        await axios.post(`${API_URL}/banners`, formData);
      }
      fetchBanners(currentPage);
      resetForm();
      toast.success(editing ? 'Banner updated successfully!' : 'Banner created successfully!');
    } catch (error) {
      console.error('Error saving banner:', error);
      const errorMessage = error.response?.data?.message || 'Error saving banner';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (banner) => {
    setEditing(banner._id);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      image: banner.image || '',
      link: banner.link || '',
      isActive: banner.isActive,
      order: banner.order || 0,
      carouselType: banner.carouselType || 'auto',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await axios.delete(`${API_URL}/banners/${id}`);
        fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        const errorMessage = error.response?.data?.message || 'Error deleting banner';
        toast.error(errorMessage);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      link: '',
      isActive: true,
      order: 0,
      carouselType: 'auto',
    });
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div className="management">
      <div className="management-header">
        <div>
          <h1>Banners Management</h1>
          <p className="subtitle">Total Banners: {totalItems}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <FaPlus /> Add Banner
        </button>
      </div>

      {showForm && (
        <motion.div
          className="form-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editing ? 'Edit Banner' : 'Add Banner'}</h2>
              <button className="close-btn" onClick={resetForm}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
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
                <label>Image URL *</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Link</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="form-group">
                <label>Carousel Type</label>
                <select
                  value={formData.carouselType}
                  onChange={(e) =>
                    setFormData({ ...formData, carouselType: e.target.value })
                  }
                >
                  <option value="auto">Auto</option>
                  <option value="click">Click</option>
                </select>
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
        {banners.map((banner) => (
          <motion.div
            key={banner._id}
            className="item-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {banner.image && (
              <img src={banner.image} alt={banner.title} className="item-image" />
            )}
            <div className="item-content">
              <h3>{banner.title}</h3>
              <p>{banner.description}</p>
              <div className="item-meta">
                <span>Order: {banner.order}</span>
                <span>Type: {banner.carouselType}</span>
                <span>Status: {banner.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div className="item-actions">
              <button onClick={() => handleEdit(banner)} className="btn-icon">
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(banner._id)} className="btn-icon danger">
                <FaTrash />
              </button>
            </div>
          </motion.div>
        )        )}
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default BannersManagement;

