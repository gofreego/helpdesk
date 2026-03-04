import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIssue, fetchIssueConfig } from '../../services/issue.service';

const CreateIssue = ({ currentUser, basePath }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productId: '',
    entity: '',
    entityId: '',
    title: '',
    description: '',
    issueType: ''
  });
  const [issueEntities, setIssueEntities] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await fetchIssueConfig();
        setIssueEntities(data.entities || []);
        setIssueTypes(data.types || []);
      } catch (err) {
        console.error('Error fetching issue config:', err);
      }
    };
    loadConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'productId' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createIssue(formData, currentUser);
      navigate('/issues');
    } catch (err) {
      console.error('Error creating issue:', err);
      setError(err.response?.data?.message || 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="detail-header">
        <div>
          <h1>Create Issue</h1>
          <button onClick={() => navigate('/issues')} className="link">
            ← Back to Issues
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
            <label className="form-label">Product ID *</label>
            <input
              type="number"
              name="productId"
              className="form-input"
              value={formData.productId}
              onChange={handleChange}
              placeholder="e.g., 101"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Entity *</label>
            <select
              name="entity"
              className="form-select"
              value={formData.entity}
              onChange={handleChange}
              required
            >
              <option value="">Select Entity</option>
              {issueEntities.map(entity => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Issue Type *</label>
            <select
              name="issueType"
              className="form-select"
              value={formData.issueType}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              {issueTypes.map(type => (
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
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about the issue..."
              rows="6"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Issue'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/issues')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssue;
