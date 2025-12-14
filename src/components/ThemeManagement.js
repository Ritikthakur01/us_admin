import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaSave } from 'react-icons/fa';
import './Management.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ThemeManagement = () => {
  const [theme, setTheme] = useState({
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981',
      background: '#FFFFFF',
      text: '#1F2937',
      textLight: '#6B7280',
    },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const response = await axios.get(`${API_URL}/theme`);
      setTheme(response.data);
    } catch (error) {
      console.error('Error fetching theme:', error);
    }
  };

  const handleColorChange = (colorKey, value) => {
    setTheme({
      ...theme,
      colors: {
        ...theme.colors,
        [colorKey]: value,
      },
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API_URL}/theme`, theme);
      setSaved(true);
      toast.success('Theme updated successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving theme:', error);
      const errorMessage = error.response?.data?.message || 'Error saving theme';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const colorLabels = {
    primary: 'Primary Color',
    secondary: 'Secondary Color',
    accent: 'Accent Color',
    background: 'Background Color',
    text: 'Text Color',
    textLight: 'Text Light Color',
  };

  return (
    <div className="management">
      <div className="management-header">
        <h1>Theme Management</h1>
        <motion.button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaSave /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Theme'}
        </motion.button>
      </div>

      <div className="theme-preview">
        <h2>Preview</h2>
        <div
          className="preview-box"
          style={{
            background: theme.colors.background,
            color: theme.colors.text,
            borderColor: theme.colors.primary,
          }}
        >
          <div
            className="preview-header"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            }}
          >
            <h3 style={{ color: 'white' }}>Unique Solution</h3>
          </div>
          <div className="preview-content">
            <p style={{ color: theme.colors.textLight }}>
              This is a preview of how your theme will look.
            </p>
            <button
              className="preview-button"
              style={{
                background: theme.colors.accent,
                color: 'white',
              }}
            >
              Sample Button
            </button>
          </div>
        </div>
      </div>

      <div className="theme-colors">
        <h2>Color Settings</h2>
        <div className="colors-grid">
          {Object.entries(theme.colors).map(([key, value]) => (
            <motion.div
              key={key}
              className="color-input-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label>{colorLabels[key]}</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="color-text"
                  placeholder="#000000"
                />
              </div>
              <div
                className="color-preview"
                style={{ backgroundColor: value }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeManagement;

