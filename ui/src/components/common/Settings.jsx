import React, { useState, useEffect } from 'react';
import { setAuthHeaders } from '../../configs/api.config';

const Settings = ({ currentUser, onUserChange, basePath }) => {
  const [userId, setUserId] = useState(currentUser.id || 1);
  const [permissions, setPermissions] = useState(currentUser.permissions || ['admin', 'issue:manage', 'rating:manage', 'delete:any']);

  const availablePermissions = [
    'admin',
    'issue:manage',
    'rating:manage',
    'delete:any'
  ];

  const handlePermissionChange = (permission) => {
    setPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = () => {
    const updatedUser = {
      id: parseInt(userId),
      permissions: permissions,
      role: permissions.join(','), // For backward compatibility
      token: 'dev-token'
    };
    onUserChange(updatedUser);
    setAuthHeaders(userId, permissions);
    alert('Settings saved! API calls will now use these credentials.');
  };

  const handleReset = () => {
    setUserId(1);
    setPermissions(['admin', 'issue:manage', 'rating:manage', 'delete:any']);
  };

  return (
    <div>
      <div className="card-header">
        <div>
          <h1>Developer Settings</h1>
          <p>Configure user credentials for API testing</p>
        </div>
      </div>

      <div className="card">
        <h3>API Headers Configuration</h3>
        <p className="text-muted">These values will be sent as headers in all API requests:</p>
        <ul className="text-muted" style={{ marginBottom: '1.5rem' }}>
          <li><code>x-user-id: {userId}</code></li>
          <li><code>x-user-perms: {permissions.join(',')}</code></li>
        </ul>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">User ID</label>
            <input
              type="number"
              className="form-input"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g., 1"
            />
          </div>

          <div>
            <label className="form-label">Permissions</label>
            <div style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem', background: 'white', maxHeight: '150px', overflowY: 'auto' }}>
              {availablePermissions.map(permission => (
                <label key={permission} style={{ display: 'block', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={permissions.includes(permission)}
                    onChange={() => handlePermissionChange(permission)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {permission}
                </label>
              ))}
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
              Selected: {permissions.join(', ') || 'None'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={handleSave} className="btn btn-primary">
            Save Settings
          </button>
          <button onClick={handleReset} className="btn btn-secondary">
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;