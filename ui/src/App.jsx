import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Layout,
  Dashboard,
  Settings,
  RatingsList,
  RatingDetail,
  CreateRating,
  IssuesList,
  IssueDetail,
  CreateIssue
} from './components';

/**
 * Props injected by the Shell:
 * @param {Object}  currentUser   - Logged-in user object { id, name, role, token }
 * @param {string}  basePath      - Base URL path for this service e.g. "/helpdesk"
 * @param {Function} onNavigate   - Navigate to another service: onNavigate('catalog')
 * @param {Function} onUserChange - Callback to update user credentials (for dev settings)
 */
export default function App({ currentUser, basePath = '/', onNavigate, onUserChange }) {

  return (
    <Layout currentUser={currentUser} basePath={basePath}>
      <Routes>
        <Route path="/" element={<Dashboard currentUser={currentUser} basePath={basePath} />} />
        <Route path="/ratings" element={<RatingsList currentUser={currentUser} basePath={basePath} />} />
        <Route path="/ratings/new" element={<CreateRating currentUser={currentUser} basePath={basePath} />} />
        <Route path="/ratings/:id" element={<RatingDetail currentUser={currentUser} basePath={basePath} />} />
        <Route path="/issues" element={<IssuesList currentUser={currentUser} basePath={basePath} />} />
        <Route path="/issues/new" element={<CreateIssue currentUser={currentUser} basePath={basePath} />} />
        <Route path="/issues/:id" element={<IssueDetail currentUser={currentUser} basePath={basePath} />} />
        <Route path="/settings" element={<Settings currentUser={currentUser} onUserChange={onUserChange} basePath={basePath} />} />
      </Routes>
    </Layout>
  );
}
