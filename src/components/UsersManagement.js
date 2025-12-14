import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaSearch, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import Pagination from './Pagination';
import './Management.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [searchInput, setSearchInput] = useState(''); // Input value (updates immediately)
  const [search, setSearch] = useState(''); // Debounced search value (used for API calls)
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [timeFrame, setTimeFrame] = useState('');

  // Debounce search input - only update search state after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer); // Cleanup on unmount or when searchInput changes
  }, [searchInput]);

  // Track if filters changed to reset page
  const prevFiltersRef = useRef({ search, fromDate, toDate, timeFrame });
  
  useEffect(() => {
    const filtersChanged = 
      prevFiltersRef.current.search !== search ||
      prevFiltersRef.current.fromDate !== fromDate ||
      prevFiltersRef.current.toDate !== toDate ||
      prevFiltersRef.current.timeFrame !== timeFrame;
    
    if (filtersChanged) {
      setCurrentPage(1);
      prevFiltersRef.current = { search, fromDate, toDate, timeFrame };
    }
  }, [search, fromDate, toDate, timeFrame]);

  useEffect(() => {
    // Fetch users with current filters and page
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        };

        // Add filter parameters
        if (search && search.trim()) {
          params.search = search.trim();
        }
        if (fromDate) {
          params.fromDate = fromDate;
        }
        if (toDate) {
          params.toDate = toDate;
        }
        if (timeFrame) {
          params.timeFrame = timeFrame;
        }

        console.log('Fetching users with params:', params);
        const response = await axios.get(`${API_URL}/users`, { params });
        console.log('Users response:', response.data);
        
        // Check if response has pagination structure
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Paginated response
          setUsers(response.data.data);
          setTotalPages(response.data.totalPages || 1);
          setTotalItems(response.data.total || 0);
        } else if (Array.isArray(response.data)) {
          // Non-paginated array response - apply client-side pagination
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedData = response.data.slice(startIndex, endIndex);
          setUsers(paginatedData);
          setTotalPages(Math.ceil(response.data.length / itemsPerPage));
          setTotalItems(response.data.length);
        } else {
          // Fallback
          setUsers([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, search, fromDate, toDate, timeFrame, itemsPerPage]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value); // Update input immediately (no API call yet)
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    setTimeFrame(''); // Clear time frame when custom date is selected
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    setTimeFrame(''); // Clear time frame when custom date is selected
  };

  const handleTimeFrameChange = (frame) => {
    if (timeFrame === frame) {
      setTimeFrame(''); // Toggle off if same frame clicked
    } else {
      setTimeFrame(frame);
      setFromDate(''); // Clear custom dates when time frame is selected
      setToDate('');
    }
  };

  const clearFilters = () => {
    setSearchInput(''); // Clear input immediately
    setSearch(''); // Clear debounced search
    setFromDate('');
    setToDate('');
    setTimeFrame('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchInput || fromDate || toDate || timeFrame;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="loading">Loading reached people...</div>;
  }

  return (
    <div className="management">
      <div className="management-header">
        <div>
          <h1>Reached People Management</h1>
          <p className="subtitle">Total Reached People: {totalItems}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>
              <FaSearch /> Search
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchInput}
              onChange={handleSearchChange}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>
              <FaCalendarAlt /> From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={handleFromDateChange}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>
              <FaCalendarAlt /> To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={handleToDateChange}
              className="filter-input"
              min={fromDate || undefined}
            />
          </div>

          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <FaTimes /> Clear Filters
            </button>
          )}
        </div>

        <div className="timeframe-buttons">
          <span className="timeframe-label">Quick Filters:</span>
          <button
            className={`timeframe-btn ${timeFrame === 'today' ? 'active' : ''}`}
            onClick={() => handleTimeFrameChange('today')}
          >
            Today
          </button>
          <button
            className={`timeframe-btn ${timeFrame === 'thisWeek' ? 'active' : ''}`}
            onClick={() => handleTimeFrameChange('thisWeek')}
          >
            This Week
          </button>
          <button
            className={`timeframe-btn ${timeFrame === 'thisMonth' ? 'active' : ''}`}
            onClick={() => handleTimeFrameChange('thisMonth')}
          >
            This Month
          </button>
          <button
            className={`timeframe-btn ${timeFrame === 'thisYear' ? 'active' : ''}`}
            onClick={() => handleTimeFrameChange('thisYear')}
          >
            This Year
          </button>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Group</th>
              <th>Message</th>
              <th>Submitted</th>
              <th>Email Sent</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <td>
                  <div className="user-info">
                    {user.name}
                  </div>
                </td>
                <td>
                  <div className="user-info">
                    {user.email}
                  </div>
                </td>
                <td>
                  <div className="user-info">
                    {user.phone || 'N/A'}
                  </div>
                </td>
                <td>
                  {user.groupName ? (
                    <div className="user-info">
                      <span className="group-name">{user.groupName}</span>
                    </div>
                  ) : (
                    <span className="no-group">No group selected</span>
                  )}
                </td>
                <td>
                  {user.message ? (
                    <div className="user-message" title={user.message}>
                      {user.message.length > 50 ? `${user.message.substring(0, 50)}...` : user.message}
                    </div>
                  ) : (
                    <span className="no-message">-</span>
                  )}
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${user.emailSent ? 'success' : 'warning'}`}>
                    {user.emailSent ? 'Yes' : 'No'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="empty-state">No users found</div>
        )}
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

export default UsersManagement;

