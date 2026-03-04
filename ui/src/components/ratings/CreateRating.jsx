import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRating, fetchRatingTypes } from '../../services/rating.service';

const CreateRating = ({ currentUser, basePath }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '',
    entityId: '',
    rating: 5,
    comment: ''
  });
  const [ratingTypes, setRatingTypes] = useState([]);
  const [maxRating, setMaxRating] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRatingConfig = async () => {
      try {
        const data = await fetchRatingTypes();
        const types = data.types || [];
        const max = data.maxRating || 10;
        setRatingTypes(types);
        setMaxRating(max);
        if (types.length > 0 && !formData.type) {
          setFormData(prev => ({ ...prev, type: types[0] }));
        }
      } catch (err) {
        console.error('Error fetching rating config:', err);
      }
    };
    loadRatingConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createRating(formData, currentUser);
      navigate('/ratings');
    } catch (err) {
      console.error('Error creating rating:', err);
      setError(err.response?.data?.message || 'Failed to create rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="detail-header">
        <div>
          <h1>Create Rating</h1>
          <button onClick={() => navigate('/ratings')} className="link">
            ← Back to Ratings
          </button>
        </div>
      </div>

      <div className="card">
        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Type *</label>
            <select
              name="type"
              className="form-input"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Type</option>
              {ratingTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Entity ID *</label>
            <input
              type="text"
              name="entityId"
              className="form-input"
              value={formData.entityId}
              onChange={handleChange}
              placeholder="e.g., 12345"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rating * (1-10)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="range"
                name="rating"
                min="1"
                max={maxRating}
                step="0.5"
                value={formData.rating}
                onChange={handleChange}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '1.5rem', fontWeight: 600, minWidth: '40px' }}>
                {formData.rating}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Comment</label>
            <textarea
              name="comment"
              className="form-textarea"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Share your feedback..."
              rows="4"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Rating'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/ratings')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRating;
