import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRatingById, fetchRatingTypes, updateRating, deleteRating, createRatingReply, deleteRatingReply, fetchRatingReplies } from '../../services/rating.service';
import { sessionManager } from '../../services';
import { useNotification } from '@gofreego/tsutils';
import {
  Container, Box, Typography, Button, Card, CardContent, Grid, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  TextField, Slider, CircularProgress, IconButton, Paper, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

const RatingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const currentUser = sessionManager.get()?.user || {};
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
  
  const longPressTimer = useRef(null);
  const scrollRef = useRef(null);
  const LIMIT = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ratingData, entitiesData] = await Promise.all([
          fetchRatingById(id),
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
        showNotification(error.message || 'Failed to load rating details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, showNotification]);

  const fetchReplies = async (isLoadMore = false) => {
    if (isLoadMore && (loadingMore || !hasMore)) return;
    if (isLoadMore) setLoadingMore(true);

    const nextPage = isLoadMore ? page + 1 : 1;

    try {
      const data = await fetchRatingReplies(id, nextPage, LIMIT);
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
      showNotification(error.message || 'Failed to load replies', 'error');
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
      await createRatingReply(id, { message: newReply });
      setNewReply('');
      fetchReplies(false);
    } catch (error) {
      console.error('Error posting reply:', error);
      showNotification(error.message || 'Failed to post reply', 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      const data = await updateRating(id, editData);
      setRating(data.rating);
      setEditMode(false);
      showNotification('Rating updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating rating:', error);
      showNotification(error.message || 'Failed to update rating', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRating(id);
      setShowDeleteRatingConfirm(false);
      showNotification('Rating deleted successfully!', 'success');
      setTimeout(() => navigate('/helpdesk/ratings'), 1500);
    } catch (error) {
      console.error('Error deleting rating:', error);
      showNotification(error.message || 'Failed to delete rating', 'error');
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await deleteRatingReply(replyId);
      showNotification('Reply deleted successfully!', 'success');
      fetchReplies(false);
    } catch (error) {
      console.error('Error deleting reply:', error);
      showNotification(error.message || 'Failed to delete reply', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!rating) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">Rating not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/helpdesk/ratings')}
            color="inherit"
            sx={{ mb: 1 }}
          >
            Back to Ratings
          </Button>
          <Typography variant="h4" component="h1" fontWeight="600">
            Rating Details
          </Typography>
        </Box>
        {!editMode && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<ChatIcon />} onClick={handleShowChat}>
              Chat
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditMode(true)}>
              Edit
            </Button>
            <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => setShowDeleteRatingConfirm(true)}>
              Delete
            </Button>
          </Box>
        )}
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          {editMode ? (
            <Box>
              <Typography variant="h6" gutterBottom>Edit Rating</Typography>
              <Box sx={{ my: 3 }}>
                <Typography id="rating-slider" gutterBottom color="text.secondary">
                  Rating (1-{maxRating})
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, px: 2 }}>
                  <Slider
                    value={editData.rating}
                    onChange={(e, val) => setEditData({ ...editData, rating: val })}
                    aria-labelledby="rating-slider"
                    valueLabelDisplay="auto"
                    step={0.5}
                    marks
                    min={1}
                    max={maxRating}
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="h5" fontWeight="600" sx={{ minWidth: '40px' }}>
                    {editData.rating}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Comment"
                  multiline
                  rows={4}
                  value={editData.comment}
                  onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={handleUpdate}>
                  Save Changes
                </Button>
                <Button variant="outlined" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
                      Rating Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating ID</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{rating.id}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>User ID</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{rating.userId}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product ID</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{rating.productId}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Entity</Typography>
                        <Chip label={rating.entity} size="small" color="info" sx={{ fontWeight: 600, borderRadius: 1 }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Entity ID</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{rating.entityId}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created At</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{new Date(parseInt(rating.createdAt)).toLocaleString()}</Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {rating.comment && (
                    <Box>
                      <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
                        Feedback
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                      <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.primary' }}>
                          "{rating.comment}"
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 3, bgcolor: 'primary.50', borderRadius: 3, border: '1px solid', borderColor: 'primary.100', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="subtitle2" color="primary.main" gutterBottom sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Overall Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContext: 'center', gap: 1, mx: 'auto', mt: 2 }}>
                      <Typography variant="h2" fontWeight="800" color="primary.main" sx={{ lineHeight: 1 }}>
                        {rating.rating}
                      </Typography>
                      <Typography variant="h5" color="primary.main" sx={{ opacity: 0.7, fontWeight: 500 }}>
                        / {maxRating}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete Rating Confirmation */}
      <Dialog open={showDeleteRatingConfirm} onClose={() => setShowDeleteRatingConfirm(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>Confirm Delete Rating</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this rating? This action <strong>cannot be undone</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteRatingConfirm(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Yes, Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog 
        open={showChat} 
        onClose={() => setShowChat(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { height: '80vh', display: 'flex', flexDirection: 'column' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Chat History
          <IconButton onClick={() => setShowChat(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', p: 2 }} onScroll={handleScroll} ref={scrollRef}>
          {replies.length === 0 ? (
            <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">No replies yet. Start the conversation!</Typography>
            </Box>
          ) : (
            replies.map(reply => {
              const isMine = reply.userId === currentUser.id;
              return (
                <Box
                  key={reply.id}
                  sx={{
                    display: 'flex',
                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      maxWidth: '75%',
                      bgcolor: isMine ? 'primary.main' : 'grey.100',
                      color: isMine ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    onMouseDown={() => handleLongPressStart(reply)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={() => handleLongPressStart(reply)}
                    onTouchEnd={handleLongPressEnd}
                  >
                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5, opacity: 0.8, fontWeight: 600 }}>
                      User: {reply.userId}
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {reply.message}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: 'right', opacity: 0.7, fontSize: '0.65rem' }}>
                      {new Date(parseInt(reply.createdAt)).toLocaleString()}
                    </Typography>
                  </Paper>
                </Box>
              );
            })
          )}
          {loadingMore && (
            <Typography variant="caption" align="center" color="text.secondary" sx={{ display: 'block', py: 2 }}>
              Loading previous messages...
            </Typography>
          )}
          {!hasMore && replies.length > 0 && (
            <Typography variant="caption" align="center" color="text.secondary" sx={{ display: 'block', py: 2 }}>
              End of history
            </Typography>
          )}
        </DialogContent>
        <Box sx={{ p: 2, bgcolor: 'background.paper' }} component="form" onSubmit={handleReply}>
          <Grid container spacing={1}>
            <Grid item xs>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your reply..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                required
              />
            </Grid>
            <Grid item>
              <Button type="submit" variant="contained" color="primary" sx={{ height: '100%' }}>
                <SendIcon />
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Dialog>

      {/* Message Action Dialog */}
      <Dialog open={!!selectedMessageForActions} onClose={() => setSelectedMessageForActions(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Message Actions</DialogTitle>
        <DialogContent>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteReply(selectedMessageForActions.id);
              setSelectedMessageForActions(null);
            }}
            sx={{ mb: 1 }}
          >
            Delete Message
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setSelectedMessageForActions(null)}
          >
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default RatingDetail;