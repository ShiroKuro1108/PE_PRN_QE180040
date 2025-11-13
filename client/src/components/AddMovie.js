import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MovieForm.css';

const AddMovie = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    rating: '',
    posterUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (formData.genre && formData.genre.length > 100) {
      newErrors.genre = 'Genre must be less than 100 characters';
    }

    if (formData.rating && (formData.rating < 1 || formData.rating > 5)) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    if (formData.posterUrl && formData.posterUrl.length > 500) {
      newErrors.posterUrl = 'Poster URL must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        genre: formData.genre.trim() || null,
        rating: formData.rating ? parseInt(formData.rating) : null,
        posterUrl: formData.posterUrl.trim() || null
      };

      const response = await fetch(`${API_URL}/api/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create movie');
      }

      navigate('/');
    } catch (err) {
      alert('Error creating movie: ' + err.message);
      console.error('Error creating movie:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="movie-form-container">
      <div className="form-header">
        <h1>Add New Movie</h1>
      </div>

      <form onSubmit={handleSubmit} className="movie-form">
        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'error' : ''}
            placeholder="Enter movie title"
            maxLength={200}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="genre">
            Genre <span className="optional">(optional)</span>
          </label>
          <input
            type="text"
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            className={errors.genre ? 'error' : ''}
            placeholder="e.g., Action, Comedy, Drama"
            maxLength={100}
          />
          {errors.genre && <span className="error-message">{errors.genre}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="rating">
            Rating <span className="optional">(optional, 1-5)</span>
          </label>
          <select
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            className={errors.rating ? 'error' : ''}
          >
            <option value="">No rating</option>
            <option value="1">1 - Poor</option>
            <option value="2">2 - Fair</option>
            <option value="3">3 - Good</option>
            <option value="4">4 - Very Good</option>
            <option value="5">5 - Excellent</option>
          </select>
          {errors.rating && <span className="error-message">{errors.rating}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="posterUrl">
            Poster URL <span className="optional">(optional)</span>
          </label>
          <input
            type="url"
            id="posterUrl"
            name="posterUrl"
            value={formData.posterUrl}
            onChange={handleChange}
            className={errors.posterUrl ? 'error' : ''}
            placeholder="https://example.com/poster.jpg"
            maxLength={500}
          />
          {errors.posterUrl && <span className="error-message">{errors.posterUrl}</span>}
          {formData.posterUrl && (
            <div className="image-preview">
              <img src={formData.posterUrl} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Movie'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMovie;
