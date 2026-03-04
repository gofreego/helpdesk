import React from 'react';

const Dashboard = ({ currentUser, basePath }) => {
  return (
    <div>
      <div className="card-header">
        <div>
          <h1>Welcome to Helpdesk Admin</h1>
          <p>Manage customer ratings and support issues from this central dashboard.</p>
        </div>
      </div>

      <div className="card">
        <div className="empty-state">
          <h3>Welcome, Developer!</h3>
          <p>Use the sidebar navigation to manage ratings and issues.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;