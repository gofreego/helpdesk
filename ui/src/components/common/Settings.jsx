import React from 'react';
import { authService, sessionManager } from '../../services';
import { Container } from '@mui/material';

const Settings = () => {
  const token = sessionManager.getAccessToken();

  const handleLogout = () => {
    authService.logout({});
    window.location.reload();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <div className="card-header">
        <div>
          <h1>Settings</h1>
          <p>Session and Application Settings</p>
        </div>
      </div>

      <div className="card">
        <h3>Current Session</h3>
        <p className="text-muted">You are authenticated via OpenAuth. API calls use your session token automatically.</p>
        
        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px', wordBreak: 'break-all' }}>
          <strong>Access Token:</strong> {token ? `${token.substring(0, 20)}...` : 'None'}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </Container>
  );
};

export default Settings;