import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchRatings, fetchRatingTypes } from '../../services/rating.service';
import { getStarRating } from '../../utils/status.utils';

const RatingsList = ({ currentUser, basePath }) => {
  const [ratings, setRatings] = useState([]);
  const [ratingTypes, setRatingTypes] = useState([]);
  const [maxRating, setMaxRating] = useState(10);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    entityId: '',
    userId: ''
  });

  useEffect(() => {
    loadRatings();
    loadRatingTypes();
  }, [currentUser]);

  const loadRatingTypes = async () => {
    try {
      const data = await fetchRatingTypes();
      setRatingTypes(data.types || []);
      setMaxRating(data.maxRating || 10);
    } catch (err) {
      console.error('Error fetching rating types:', err);
    }
  };

  const loadRatings = async () => {
    try {
      const response = await fetchRatings(filters, currentUser);
      setRatings(response.ratings);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    setLoading(true);
    loadRatings();
  };

  const handleClearFilters = () => {
    setFilters({ type: '', entityId: '', userId: '' });
    setLoading(true);
    setTimeout(() => loadRatings(), 100);
  };


  if (loading) {
    return <div className="card"><p>Loading...</p></div>;
  }

  return (
    <div>
      <div className="card-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Ratings Management</h1>
            <p>View and manage all customer ratings</p>
          </div>
          <Link to={`/ratings/new`} className="btn btn-primary">
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Rating
          </Link>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div>
            <label className="form-label">Type</label>
            <select
              name="type"
              className="form-input"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              {ratingTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Entity ID</label>
            <input
              type="text"
              name="entityId"
              className="form-input"
              value={filters.entityId}
              onChange={handleFilterChange}
              placeholder="e.g., 12345"
            />
          </div>
          <div>
            <label className="form-label">User ID</label>
            <input
              type="text"
              name="userId"
              className="form-input"
              value={filters.userId}
              onChange={handleFilterChange}
              placeholder="e.g., user123"
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={handleApplyFilters} className="btn btn-primary">
            Apply Filters
          </button>
          <button onClick={handleClearFilters} className="btn btn-secondary">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="card">
        {ratings.length === 0 ? (
          <div className="empty-state">
            <h3>No ratings yet</h3>
            <p>Ratings will appear here once customers start submitting them.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
              Showing {ratings.length} rating{ratings.length !== 1 ? 's' : ''}
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Entity ID</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>User</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map(rating => (
                  <tr key={rating.id}>
                    <td>
                      <span className="badge badge-info">{rating.type}</span>
                    </td>
                    <td>{rating.entityId}</td>
                    <td style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                      {rating.rating} <small style={{ color: '#94a3b8', fontWeight: 400 }}>/ {maxRating}</small>
                    </td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rating.comment || '-'}
                    </td>
                    <td>{rating.userId}</td>
                    <td>
                      <Link to={`/ratings/${rating.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default RatingsList;