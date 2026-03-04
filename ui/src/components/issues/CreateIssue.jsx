import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIssue, fetchIssueConfig } from '../../services/issue.service';

const CreateIssue = ({ currentUser, basePath }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '',
    entity_id: '',
    title: '',
    description: ''
  });
  const [issueTypes, setIssueTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await fetchIssueConfig();
        setIssueTypes(data.types || []);
      } catch (err) {
        console.error('Error fetching issue types:', err);
      }
    };
    loadConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
            <label className="form-label">Type *</label>
            <select
              name="type"
              className="form-select"
              value={formData.type}
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
              name="entity_id"
              className="form-input"
              value={formData.entity_id}
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
