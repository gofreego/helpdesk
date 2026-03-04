import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const DevApp = () => {
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    permissions: ['admin', 'issue:reply', 'rating:reply', 'issue:update:status', 'delete:any'],
    role: 'admin,issue:reply,rating:reply,issue:update:status,delete:any', // For backward compatibility
    token: 'dev-token'
  });

  const handleUserChange = (newUser) => {
    setCurrentUser(newUser);
  };

  return (
    <BrowserRouter basename="/helpdesk">
      <App currentUser={currentUser} basePath="/" onUserChange={handleUserChange} />
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DevApp />
  </StrictMode>,
)
