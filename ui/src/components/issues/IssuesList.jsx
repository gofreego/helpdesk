import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchIssues, fetchIssueConfig } from '../../services/issue.service';
import { getIssueStatusBadge } from '../../utils/status.utils';
import { useNotification } from '@gofreego/tsutils';
import { Container } from '@mui/material';

const IssuesList = () => {
  const { showNotification } = useNotification();
  const [issues, setIssues] = useState([]);
  const [issueEntities, setIssueEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    productId: '',
    entity: '',
    entityId: '',
    userId: '',
    status: '',
    issueType: ''
  });
  const [issueTypes, setIssueTypes] = useState([]);
  const [productIds, setProductIds] = useState([]);

  useEffect(() => {
    loadIssues();
    loadIssueConfig();
  }, [showNotification]);

  const loadIssueConfig = async () => {
    try {
      const data = await fetchIssueConfig();
      setIssueEntities(data.entities || []);
      setIssueTypes(data.types || []);
      setProductIds(data.productIds || []);
    } catch (err) {
      console.error('Error fetching issue config:', err);
      showNotification('Failed to load issue configuration', 'error');
    }
  };

  const loadIssues = async () => {
    try {
      const response = await fetchIssues(filters);
      setIssues(response.issues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      showNotification(error.message || 'Failed to fetch issues', 'error');
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
    setFilters({ productId: '', entity: '', entityId: '', userId: '', status: '', issueType: '' });
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <div className="card-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Issues Management</h1>
            <p>Track and resolve customer issues</p>
          </div>
          <Link to={`/helpdesk/issues/new`} className="btn btn-primary">
            <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Issue
          </Link>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div>
            <label className="form-label">Product ID</label>
            <select
              name="productId"
              className="form-select"
              value={filters.productId}
              onChange={handleFilterChange}
            >
              <option value="">All Products</option>
              {productIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
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
          <div>
            <label className="form-label">Issue Type</label>
            <select
              name="issueType"
              className="form-select"
              value={filters.issueType}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              {issueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
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
      </div >

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
                  <th>Type</th>
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
                    <td>
                      <span className="badge badge-secondary">{issue.issueType}</span>
                    </td>
                    <td>{renderStatusBadge(issue.status)}</td>
                    <td>{issue.userId}</td>
                    <td>
                      <Link to={`/helpdesk/issues/${issue.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
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
    </Container>
  );
};

export default IssuesList;