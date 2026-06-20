import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, SidebarLayout, NotificationProvider, LoginCallbackPage, ProtectedRoute } from '@gofreego/tsutils';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StarIcon from '@mui/icons-material/Star';
import BugReportIcon from '@mui/icons-material/BugReport';

import {
  Dashboard,
  RatingsList,
  RatingDetail,
  IssuesList,
  IssueDetail,
} from './components';
import { authService, sessionManager } from './services';

const LOGIN_URL = import.meta.env.VITE_LOGIN_URL;

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    authService.initializeAuth();
    setIsInitialized(true);
  }, []);

  const handleLoginFailed = () => {
    console.log("Login failed, redirecting to -> ", LOGIN_URL);
    window.location.href = LOGIN_URL;
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/helpdesk/dashboard',
      icon: <DashboardIcon />,
    },
    {
      id: 'ratings',
      label: 'Ratings',
      path: '/helpdesk/ratings',
      icon: <StarIcon />,
    },
    {
      id: 'issues',
      label: 'Issues',
      path: '/helpdesk/issues',
      icon: <BugReportIcon />,
    },
  ];

  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/helpdesk/login-callback" element={<LoginCallbackPage authService={authService} navigateTo="/helpdesk/dashboard" onLoginFailed={handleLoginFailed} />} />
            <Route
              path="/"
              element={
                <ProtectedRoute sessionManager={sessionManager} loginUrl={LOGIN_URL} callbackPath="/helpdesk/login-callback">
                  <SidebarLayout menuItems={menuItems} isRouter={true} isBrowserRouter={false} style={{ height: '100vh' }} />
                </ProtectedRoute>
              }
            >
              <Route path="helpdesk/dashboard" element={<Dashboard />} />
              <Route path="helpdesk/ratings" element={<RatingsList />} />
              <Route path="helpdesk/ratings/:id" element={<RatingDetail />} />
              <Route path="helpdesk/issues" element={<IssuesList />} />
              <Route path="helpdesk/issues/:id" element={<IssueDetail />} />
              <Route path="*" element={<Navigate to="/helpdesk/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}
