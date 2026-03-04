import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchIssues, fetchIssueConfig } from '../../services/issue.service';
import { getIssueStatusBadge } from '../../utils/status.utils';

const IssuesList = ({ currentUser, basePath }) => {
  const [issues, setIssues] = useState([]);
  const [issueEntities, setIssueEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    productId: '',
    entity: '',
    entityId: '',
    userId: '',
    status: ''
  });

  useEffect(() => {
    loadIssues();
    loadIssueConfig();
  }, [currentUser]);

  const loadIssueConfig = async () => {
    try {
      const data = await fetchIssueConfig();
      setIssueEntities(data.entities || []);
    } catch (err) {
      console.error('Error fetching issue entities:', err);
    }
  };

  const loadIssues = async () => {
    try {
      const response = await fetchIssues(filters, currentUser);
      setIssues(response.issues);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    setLoading(true);
    loadIssues();
  };


  const handleClearFilters = () => {
    setFilters({ productId: '', entity: '', entityId: '', userId: '', status: '' });
    setLoading(true);
    setTimeout(() => loadIssues(), 100);
  };

  const renderStatusBadge = (status) => {
    const { text, badgeClass } = getIssueStatusBadge(status);
    return <span className={`badge ${badgeClass}`}>{text}</span>;
  };

  if (loading) {
    return <div className="card"><p>Loading...</p></div>;
  }

  return (
    <div>
      <div className="card-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Issues Management</h1>
            <p>Track and resolve customer issues</p>
          </div>
          <Link to={`/issues/new`} className="btn btn-primary">
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Issue
          </Link>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          <div>
            <label className="form-label">Product ID</label>
            <input
              type="text"
              name="productId"
              className="form-input"
              value={filters.productId}
              onChange={handleFilterChange}
              placeholder="e.g., 101"
            />
          </div>
          <div>
            <label className="form-label">Entity</label>
            <select
              name="entity"
              className="form-select"
              value={filters.entity}
              onChange={handleFilterChange}
            >
              <option value="">All Entities</option>
              {issueEntities.map(entity => (
                <option key={entity} value={entity}>{entity}</option>
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
          <div>
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-select"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="1">Open</option>
              <option value="2">In Progress</option>
              <option value="3">Resolved</option>
              <option value="4">Closed</option>
            </select>
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
        {issues.length === 0 ? (
          <div className="empty-state">
            <h3>No issues found</h3>
            <p>Issues will appear here once customers report them.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
              Showing {issues.length} issue{issues.length !== 1 ? 's' : ''}
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Product ID</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Status</th>
                  <th>User</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.map(issue => (
                  <tr key={issue.id}>
                    <td style={{ fontWeight: 600 }}>{issue.title}</td>
                    <td>{issue.productId}</td>
                    <td>
                      <span className="badge badge-info">{issue.entity}</span>
                    </td>
                    <td>{issue.entityId}</td>
                    <td>{renderStatusBadge(issue.status)}</td>
                    <td>{issue.userId}</td>
                    <td>
                      <Link to={`/issues/${issue.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
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

export default IssuesList;