import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchIssueById, updateIssue, deleteIssue, createIssueReply, deleteIssueReply, fetchIssueReplies, updateIssueStatus } from '../../services/issue.service';
import { getIssueStatusBadge } from '../../utils/status.utils';
import { formatDate } from '../../utils/format.utils';
import { hasPermission, PERMISSIONS } from '../../constants/permissions.constants';
import { sessionManager } from '../../services';
import { Container } from '@mui/material';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = sessionManager.get()?.user || { role: '' };
  const [issue, setIssue] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [showChat, setShowChat] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [showDeleteIssueConfirm, setShowDeleteIssueConfirm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedMessageForActions, setSelectedMessageForActions] = useState(null);
  const longPressTimer = useRef(null);
  const scrollRef = useRef(null);
  const LIMIT = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchIssueById(id);
        setIssue(data.issue);
        setNewStatus(data.issue.status);
        setEditData({
          title: data.issue.title,
          description: data.issue.description
        });
      } catch (error) {
        console.error('Error fetching issue:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentUser]);

  const fetchReplies = async (isLoadMore = false) => {
    if (isLoadMore && (loadingMore || !hasMore)) return;
    if (isLoadMore) setLoadingMore(true);

    const nextPage = isLoadMore ? page + 1 : 1;

    try {
      const data = await fetchIssueReplies(id, nextPage, LIMIT);
      const newReplies = data.replies || [];

      if (isLoadMore) {
        setReplies(prev => [...prev, ...newReplies]);
        setPage(nextPage);
      } else {
        setReplies(newReplies);
        setPage(1);
        setHasMore(true);
      }

      if (newReplies.length < LIMIT) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      if (isLoadMore) setLoadingMore(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (Math.abs(scrollTop) + clientHeight >= scrollHeight - 50) {
      fetchReplies(true);
    }
  };

  useEffect(() => {
    if (showChat && scrollRef.current && page === 1) {
      scrollRef.current.scrollTop = 0;
    }
  }, [showChat, replies, page]);

  const hasManagePermission = currentUser.role.split(',').some(p => p === 'admin' || p === 'issue:manage');

  const handleShowChat = () => {
    fetchReplies();
    setShowChat(true);
  };

  const handleLongPressStart = (reply) => {
    if (currentUser.role !== 'admin' && reply.userId !== currentUser.id) return;
    longPressTimer.current = setTimeout(() => {
      setSelectedMessageForActions(reply);
    }, 600);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    try {
      await createIssueReply(id, { message: newReply });
      setNewReply('');
      fetchReplies(false);
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply');
    }
  };

  const handleUpdate = async () => {
    try {
      const data = await updateIssue(id, {
        ...editData,
        status: issue.status
      });
      setIssue(data.issue);
      setEditMode(false);
      alert('Issue updated successfully!');
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('Failed to update issue');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await updateIssueStatus(id, {
        status: parseInt(newStatus)
      });
      setShowStatusConfirm(false);
      setFeedbackMessage({ type: 'success', text: 'Status updated successfully!' });
      setTimeout(() => navigate('/helpdesk/issues'), 1500);
    } catch (error) {
      console.error('Error updating status:', error);
      setFeedbackMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIssue(id);
      setShowDeleteIssueConfirm(false);
      setFeedbackMessage({ type: 'success', text: 'Issue deleted successfully!' });
      setTimeout(() => navigate('/helpdesk/issues'), 1500);
    } catch (error) {
      console.error('Error deleting issue:', error);
      setFeedbackMessage({ type: 'error', text: 'Failed to delete issue' });
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await deleteIssueReply(replyId);
      setFeedbackMessage({ type: 'success', text: 'Reply deleted successfully!' });
      setTimeout(() => setFeedbackMessage({ type: '', text: '' }), 3000);
      fetchReplies(false);
    } catch (error) {
      console.error('Error deleting reply:', error);
      setFeedbackMessage({ type: 'error', text: 'Failed to delete reply' });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      1: { text: 'Open', class: 'badge-danger' },
      2: { text: 'In Progress', class: 'badge-warning' },
      3: { text: 'Resolved', class: 'badge-success' },
      4: { text: 'Closed', class: 'badge-info' }
    };
    const statusInfo = statusMap[status] || { text: 'Unknown', class: 'badge-info' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return <div className="card"><p>Loading...</p></div>;
  }

  if (!issue) {
    return <div className="card"><p>Issue not found.</p></div>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <div className="detail-header">
        <div>
          <h1>Issue Details</h1>
          <Link to='/helpdesk/issues' className="link">← Back to Issues</Link>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!editMode && (
            <>
              <button onClick={handleShowChat} className="btn btn-secondary">
                Chat
              </button>
              <button onClick={() => setEditMode(true)} className="btn btn-primary">
                Edit Issue
              </button>
              <button onClick={() => setShowDeleteIssueConfirm(true)} className="btn btn-danger">
                Delete Issue
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        {editMode ? (
          <div>
            <h3 style={{ marginBottom: '1.5rem' }}>Edit Issue</h3>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows="6"
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleUpdate} className="btn btn-primary">
                Save Changes
              </button>
              <button onClick={() => setEditMode(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Issue ID</span>
                <span className="detail-value">{issue.id}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">User ID</span>
                <span className="detail-value">{issue.userId}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Product ID</span>
                <span className="detail-value">{issue.productId}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Entity</span>
                <span className="detail-value">
                  <span className="badge badge-info">{issue.entity}</span>
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Entity ID</span>
                <span className="detail-value">{issue.entityId}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value">{getStatusBadge(issue.status)}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Issue Type</span>
                <span className="detail-value">
                  <span className="badge badge-secondary">{issue.issueType}</span>
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Created At</span>
                <span className="detail-value">
                  {new Date(parseInt(issue.createdAt)).toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <span className="detail-label">Title</span>
              <div style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
                {issue.title}
              </div>
            </div>

            {issue.description && (
              <div style={{ marginTop: '1.5rem' }}>
                <span className="detail-label">Description</span>
                <div style={{ marginTop: '0.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', lineHeight: 1.6 }}>
                  {issue.description}
                </div>
              </div>
            )}

            {hasManagePermission && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #f1f5f9' }}>
                <span className="detail-label">Update Status (Admin Only)</span>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', alignItems: 'center' }}>
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    style={{ maxWidth: '200px' }}
                  >
                    <option value={1}>Open</option>
                    <option value={2}>In Progress</option>
                    <option value={3}>Resolved</option>
                    <option value={4}>Closed</option>
                  </select>
                  <button onClick={() => setShowStatusConfirm(true)} className="btn btn-primary">
                    Update Status
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showChat && (
        <div className="modal-overlay" onClick={() => setShowChat(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Issue Chat History</h3>
              <button className="close-btn" onClick={() => setShowChat(false)}>&times;</button>
            </div>
            <div
              className="modal-body"
              onScroll={handleScroll}
              ref={scrollRef}
              style={{ display: 'flex', flexDirection: 'column-reverse' }}
            >
              {replies.length === 0 ? (
                <div className="empty-state">
                  <p>No replies yet. Start the conversation!</p>
                </div>
              ) : (
                replies.map(reply => (
                  <div
                    key={reply.id}
                    className={`chat-bubble ${reply.userId === currentUser.id ? 'bubble-sent' : 'bubble-received'}`}
                    style={{ marginBottom: '1rem', cursor: 'pointer', userSelect: 'none' }}
                    onMouseDown={() => handleLongPressStart(reply)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={() => handleLongPressStart(reply)}
                    onTouchEnd={handleLongPressEnd}
                  >
                    <div className="bubble-header">
                      <span>User: {reply.userId} ({reply.role})</span>
                    </div>
                    <p>{reply.message}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.7rem', opacity: 0.6 }}>
                      <span>{new Date(parseInt(reply.createdAt)).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
              {loadingMore && (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '1rem', fontSize: '0.875rem' }}>
                  Loading previous messages...
                </div>
              )}
              {!hasMore && replies.length > 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem', fontSize: '0.875rem' }}>
                  End of history
                </div>
              )}
            </div>
            <div className="modal-footer">
              <form onSubmit={handleReply} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Type your reply..."
                  style={{ marginBottom: 0 }}
                  required
                />
                <button type="submit" className="btn btn-primary">Send</button>
              </form>
            </div>
          </div>
        </div>
      )}
      {selectedMessageForActions && (
        <div className="modal-overlay" onClick={() => setSelectedMessageForActions(null)} style={{ zIndex: 3000 }}>
          <div className="modal-content" style={{ maxWidth: '300px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Message Actions</h3>
            </div>
            <div className="modal-body" style={{ padding: '1rem' }}>
              <button
                className="btn btn-danger"
                style={{ width: '100%', marginBottom: '0.5rem' }}
                onClick={() => {
                  handleDeleteReply(selectedMessageForActions.id);
                  setSelectedMessageForActions(null);
                }}
              >
                Delete Message
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={() => setSelectedMessageForActions(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showStatusConfirm && (
        <div className="modal-overlay" onClick={() => setShowStatusConfirm(false)} style={{ zIndex: 3000 }}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Status Change</h3>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                Are you sure you want to change the status of this issue?
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={handleStatusUpdate} className="btn btn-primary" style={{ flex: 1 }}>
                  Yes, Update
                </button>
                <button onClick={() => setShowStatusConfirm(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteIssueConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteIssueConfirm(false)} style={{ zIndex: 3000 }}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: '#ef4444' }}>Confirm Delete Issue</h3>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                Are you sure you want to delete this issue? This action <strong>cannot be undone</strong>.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={handleDelete} className="btn btn-danger" style={{ flex: 1 }}>
                  Yes, Delete
                </button>
                <button onClick={() => setShowDeleteIssueConfirm(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {feedbackMessage.text && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '1rem 2rem',
            background: feedbackMessage.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 4000,
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {feedbackMessage.text}
        </div>
      )}
    </Container>
  );
};

export default IssueDetail;