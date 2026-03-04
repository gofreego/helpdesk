import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchIssues, fetchIssueConfig } from '../../services/issue.service';
import { getIssueStatusBadge } from '../../utils/status.utils';

const IssuesList = ({ currentUser, basePath }) => {
  const [issues, setIssues] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    entity_id: '',
    user_id: '',
    status: ''
  });

  useEffect(() => {
    loadIssues();
    loadIssueConfig();
  }, [currentUser]);

  const loadIssueConfig = async () => {
    try {
      const data = await fetchIssueConfig();
      setIssueTypes(data.types || []);
    } catch (err) {
      console.error('Error fetching issue types:', err);
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
    setFilters({ type: '', entity_id: '', user_id: '', status: '' });
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div>
            <label className="form-label">Type</label>
            <select
              name="type"
              className="form-select"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              {issueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Entity ID</label>
            <input
              type="text"
              name="entity_id"
              className="form-input"
              value={filters.entity_id}
              onChange={handleFilterChange}
              placeholder="e.g., 12345"
            />
          </div>
          <div>
            <label className="form-label">User ID</label>
            <input
              type="text"
              name="user_id"
              className="form-input"
              value={filters.user_id}
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
                  <th>Type</th>
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
                    <td>
                      <span className="badge badge-info">{issue.type}</span>
                    </td>
                    <td>{issue.entity_id}</td>
                    <td>{renderStatusBadge(issue.status)}</td>
                    <td>{issue.user_id}</td>
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