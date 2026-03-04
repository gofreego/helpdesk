import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchRatingById, fetchRatingTypes, updateRating, deleteRating, createRatingReply, deleteRatingReply, fetchRatingReplies } from '../../services/rating.service';
import { getStarRating } from '../../utils/status.utils';
import { formatDate } from '../../utils/format.utils';
import { hasPermission, PERMISSIONS } from '../../constants/permissions.constants';

const RatingDetail = ({ currentUser, basePath }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ rating: 5, comment: '' });
  const [maxRating, setMaxRating] = useState(10);
  const [showChat, setShowChat] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedMessageForActions, setSelectedMessageForActions] = useState(null);
  const [showDeleteRatingConfirm, setShowDeleteRatingConfirm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });
  const longPressTimer = useRef(null);
  const scrollRef = useRef(null);
  const LIMIT = 10;


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ratingData, entitiesData] = await Promise.all([
          fetchRatingById(id, currentUser),
          fetchRatingTypes()
        ]);
        const max = entitiesData.maxRating || 10;
        setMaxRating(max);

        setRating(ratingData.rating);
        setEditData({
          rating: ratingData.rating.rating,
          comment: ratingData.rating.comment || ''
        });
      } catch (error) {
        console.error('Error fetching rating:', error);
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
      const data = await fetchRatingReplies(id, { page: nextPage, page_size: LIMIT }, currentUser);
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
      await createRatingReply(id, { message: newReply }, currentUser);
      setNewReply('');
      fetchReplies(false);
    } catch (error) {
      console.error('Error posting reply:', error);
      setFeedbackMessage({ type: 'error', text: 'Failed to post reply' });
    }
  };

  const handleUpdate = async () => {
    try {
      const data = await updateRating(id, editData, currentUser);
      setRating(data.rating);
      setEditMode(false);
      setFeedbackMessage({ type: 'success', text: 'Rating updated successfully!' });
      setTimeout(() => setFeedbackMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating rating:', error);
      setFeedbackMessage({ type: 'error', text: 'Failed to update rating' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRating(id, currentUser);
      setShowDeleteRatingConfirm(false);
      setFeedbackMessage({ type: 'success', text: 'Rating deleted successfully!' });
      setTimeout(() => navigate('/ratings'), 1500);
    } catch (error) {
      console.error('Error deleting rating:', error);
      setFeedbackMessage({ type: 'error', text: 'Failed to delete rating' });
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await deleteRatingReply(replyId, currentUser);
      setFeedbackMessage({ type: 'success', text: 'Reply deleted successfully!' });
      setTimeout(() => setFeedbackMessage({ type: '', text: '' }), 3000);
      fetchReplies(false);
    } catch (error) {
      console.error('Error deleting reply:', error);
      setFeedbackMessage({ type: 'error', text: 'Failed to delete reply' });
    }
  };


  if (loading) {
    return <div className="card"><p>Loading...</p></div>;
  }

  if (!rating) {
    return <div className="card"><p>Rating not found.</p></div>;
  }

  return (
    <div>
      <div className="detail-header">
        <div>
          <h1>Rating Details</h1>
          <Link to="/ratings" className="link">← Back to Ratings</Link>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!editMode && (
            <>
              <button onClick={handleShowChat} className="btn btn-secondary">
                Chat
              </button>
              <button onClick={() => setEditMode(true)} className="btn btn-primary">
                Edit Rating
              </button>
              <button onClick={() => setShowDeleteRatingConfirm(true)} className="btn btn-danger">
                Delete Rating
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        {editMode ? (
          <div>
            <h3 style={{ marginBottom: '1.5rem' }}>Edit Rating</h3>
            <div className="form-group">
              <label className="form-label">Rating (1-{maxRating})</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="range"
                  min="1"
                  max={maxRating}
                  step="0.5"
                  value={editData.rating}
                  onChange={(e) => setEditData({ ...editData, rating: parseFloat(e.target.value) })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '1.5rem', fontWeight: 600, minWidth: '40px' }}>
                  {editData.rating}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea
                className="form-textarea"
                value={editData.comment}
                onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                rows="4"
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
                <span className="detail-label">Rating ID</span>
                <span className="detail-value">{rating.id}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">User ID</span>
                <span className="detail-value">{rating.userId}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Product ID</span>
                <span className="detail-value">{rating.productId}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Entity</span>
                <span className="detail-value">
                  <span className="badge badge-info">{rating.entity}</span>
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Entity ID</span>
                <span className="detail-value">{rating.entityId}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Rating</span>
                <span className="detail-value" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {rating.rating}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Created At</span>
                <span className="detail-value">
                  {new Date(parseInt(rating.createdAt)).toLocaleString()}
                </span>
              </div>
            </div>

            {rating.comment && (
              <div style={{ marginTop: '1.5rem' }}>
                <span className="detail-label">Comment</span>
                <div style={{ marginTop: '0.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  {rating.comment}
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
              <h3>Chat History</h3>
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
                      <span>User: {reply.userId}</span>
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
      {showDeleteRatingConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteRatingConfirm(false)} style={{ zIndex: 3000 }}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ color: '#ef4444' }}>Confirm Delete Rating</h3>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                Are you sure you want to delete this rating? This action <strong>cannot be undone</strong>.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={handleDelete} className="btn btn-danger" style={{ flex: 1 }}>
                  Yes, Delete
                </button>
                <button onClick={() => setShowDeleteRatingConfirm(false)} className="btn btn-secondary" style={{ flex: 1 }}>
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
    </div>
  );
};

export default RatingDetail;