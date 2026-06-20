import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchRatingById, fetchRatingTypes, updateRating, deleteRating,
  createRatingReply, deleteRatingReply, fetchRatingReplies
} from '../../services/rating.service';
import { sessionManager } from '../../services';
import { useNotification } from '@gofreego/tsutils';
import {
  Container, Box, Typography, Button, Card, CardContent, Grid, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  TextField, Slider, CircularProgress, IconButton, Paper, Alert, Avatar, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SaveIcon from '@mui/icons-material/Save';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getRatingColor = (value, max) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  if (pct >= 70) return '#22c55e';
  if (pct >= 40) return '#f59e0b';
  return '#ef4444';
};

const getRatingLabel = (value, max) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  if (pct >= 70) return 'Great';
  if (pct >= 40) return 'Average';
  return 'Poor';
};

const initials = (id = '') =>
  String(id).slice(0, 2).toUpperCase() || '?';

const formatDate = (ts) => {
  if (!ts) return '—';
  return new Date(parseInt(ts)).toLocaleString(undefined, {
    dateStyle: 'medium', timeStyle: 'short'
  });
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const InfoRow = ({ label, children }) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, display: 'block', mb: 0.5 }}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

// ─── Main Component ──────────────────────────────────────────────────────────

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
  const [savingEdit, setSavingEdit] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const longPressTimer = useRef(null);
  const scrollRef = useRef(null);
  const LIMIT = 10;

  // ── Fetch ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ratingData, entitiesData] = await Promise.all([
          fetchRatingById(id),
          fetchRatingTypes()
        ]);
        setMaxRating(entitiesData.maxRating || 10);
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
      if (newReplies.length < LIMIT) setHasMore(false);
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

  // ── Actions ───────────────────────────────────────────────────────────────

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
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    setSendingReply(true);
    try {
      await createRatingReply(id, { message: newReply });
      setNewReply('');
      fetchReplies(false);
    } catch (error) {
      console.error('Error posting reply:', error);
      showNotification(error.message || 'Failed to post reply', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdate = async () => {
    setSavingEdit(true);
    try {
      const data = await updateRating(id, editData);
      setRating(data.rating);
      setEditMode(false);
      showNotification('Rating updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating rating:', error);
      showNotification(error.message || 'Failed to update rating', 'error');
    } finally {
      setSavingEdit(false);
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
      showNotification('Reply deleted.', 'success');
      fetchReplies(false);
    } catch (error) {
      console.error('Error deleting reply:', error);
      showNotification(error.message || 'Failed to delete reply', 'error');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
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

  const ratingColor = getRatingColor(rating.rating, maxRating);
  const editRatingColor = getRatingColor(editData.rating, maxRating);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>

      {/* ── Page Header ── */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/helpdesk/ratings')}
            color="inherit"
            size="small"
            sx={{ mb: 1, color: 'text.secondary', pl: 0 }}
          >
            Back to Ratings
          </Button>
          <Typography variant="h5" component="h1" fontWeight="700" sx={{ letterSpacing: '-0.3px' }}>
            Rating Details
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            ID: {rating.id}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ChatBubbleOutlineIcon />}
              onClick={handleShowChat}
              sx={{ borderRadius: 2 }}
            >
              Chat
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
              sx={{ borderRadius: 2 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setShowDeleteRatingConfirm(true)}
              sx={{ borderRadius: 2 }}
            >
              Delete
            </Button>
          </Box>
      </Box>

      {/* ── Main Card ── */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>

          {/* ── View Mode ── */}
            <Grid container spacing={4}>
              {/* Left: Info */}
              <Grid item xs={12} md={8}>
                {/* Section: Rating Info */}
                <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Rating Information
                </Typography>
                <Divider sx={{ mt: 1, mb: 3 }} />

                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label="Rating ID">
                      <Typography variant="body2" fontWeight="500" sx={{ fontFamily: 'monospace' }}>{rating.id}</Typography>
                    </InfoRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label="User ID">
                      <Typography variant="body2" fontWeight="500">{rating.userId}</Typography>
                    </InfoRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label="Product ID">
                      <Typography variant="body2" fontWeight="500">{rating.productId}</Typography>
                    </InfoRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label="Entity">
                      <Chip label={rating.entity} size="small" color="info" variant="outlined" sx={{ fontWeight: 600, mt: 0.25 }} />
                    </InfoRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label="Entity ID">
                      <Typography variant="body2" fontWeight="500">{rating.entityId}</Typography>
                    </InfoRow>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label="Created At">
                      <Typography variant="body2" fontWeight="500">{formatDate(rating.createdAt)}</Typography>
                    </InfoRow>
                  </Grid>
                </Grid>

                {/* Section: Feedback */}
                <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Feedback
                </Typography>
                <Divider sx={{ mt: 1, mb: 3 }} />
                {rating.comment ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body1" sx={{ lineHeight: 1.75, color: 'text.primary', fontStyle: 'italic' }}>
                      "{rating.comment}"
                    </Typography>
                  </Paper>
                ) : (
                  <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    No feedback provided.
                  </Typography>
                )}
              </Grid>

              {/* Right: Score card */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: `${ratingColor}40`,
                    bgcolor: `${ratingColor}08`,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <StarRoundedIcon sx={{ fontSize: 44, color: ratingColor }} />

                  <Box>
                    <Typography
                      variant="h2"
                      fontWeight="800"
                      sx={{ lineHeight: 1, color: ratingColor }}
                    >
                      {rating.rating}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      out of {maxRating}
                    </Typography>
                  </Box>

                  <Chip
                    label={getRatingLabel(rating.rating, maxRating)}
                    sx={{
                      bgcolor: `${ratingColor}18`,
                      color: ratingColor,
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      px: 1,
                    }}
                  />

                  {/* Mini progress bar */}
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.disabledBackground', overflow: 'hidden' }}>
                      <Box
                        sx={{
                          height: '100%',
                          width: `${(rating.rating / maxRating) * 100}%`,
                          bgcolor: ratingColor,
                          borderRadius: 3,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
        </CardContent>
      </Card>

      {/* ── Edit Rating Modal ── */}
      <Dialog
        open={editMode}
        onClose={() => setEditMode(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" fontWeight="700" sx={{ letterSpacing: '-0.3px' }}>
                Edit Rating
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Update the score and feedback for this rating
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setEditMode(false)} sx={{ mt: -0.5, mr: -0.5, color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Divider />
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          {/* Rating section */}
          <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Rating
          </Typography>

          <Box sx={{ mt: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarRoundedIcon sx={{ color: editRatingColor, fontSize: 28, transition: 'color 0.3s' }} />
                <Typography variant="h5" fontWeight="700" sx={{ lineHeight: 1, color: editRatingColor, transition: 'color 0.3s' }}>
                  {editData.rating}
                  <Typography component="span" variant="body2" color="text.secondary" fontWeight="400" sx={{ ml: 0.5 }}>
                    / {maxRating}
                  </Typography>
                </Typography>
              </Box>
              <Chip
                label={getRatingLabel(editData.rating, maxRating)}
                size="small"
                sx={{
                  bgcolor: `${editRatingColor}18`,
                  color: editRatingColor,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  transition: 'all 0.3s',
                }}
              />
            </Box>
            <Slider
              value={editData.rating}
              onChange={(e, val) => setEditData({ ...editData, rating: val })}
              valueLabelDisplay="auto"
              step={0.5}
              marks
              min={1}
              max={maxRating}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">1 — Poor</Typography>
              <Typography variant="caption" color="text.secondary">{maxRating} — Excellent</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Comment section */}
          <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Comment <Typography component="span" variant="caption" color="text.disabled">(optional)</Typography>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Share detailed feedback..."
            value={editData.comment}
            onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
            inputProps={{ maxLength: 1000 }}
            helperText={`${editData.comment.length}/1000`}
            sx={{ mt: 1.5 }}
          />
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            type="button"
            variant="text"
            color="inherit"
            onClick={() => setEditMode(false)}
            sx={{ borderRadius: 2, color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleUpdate}
            disabled={savingEdit}
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            {savingEdit ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Rating Confirm ── */}
      <Dialog
        open={showDeleteRatingConfirm}
        onClose={() => setShowDeleteRatingConfirm(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pt: 3, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: 2,
                bgcolor: 'error.50', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <DeleteIcon sx={{ color: 'error.main', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight="700">Delete Rating</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 1 }}>
            Are you sure you want to delete this rating? This action <strong>cannot be undone</strong> and all associated data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setShowDeleteRatingConfirm(false)}
            color="inherit"
            variant="text"
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Delete Rating
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Chat Dialog ── */}
      <Dialog
        open={showChat}
        onClose={() => setShowChat(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: '82vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
          }
        }}
      >
        {/* Chat header */}
        <Box sx={{ px: 3, pt: 2.5, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ChatBubbleOutlineIcon color="primary" />
            <Box>
              <Typography variant="subtitle1" fontWeight="700">Chat History</Typography>
              <Typography variant="caption" color="text.secondary">
                {replies.length} message{replies.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setShowChat(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {/* Messages */}
        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          sx={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column-reverse',
            px: 2.5,
            py: 2,
            gap: 0,
          }}
        >
          {replies.length === 0 ? (
            <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography color="text.secondary" variant="body2">No messages yet. Start the conversation!</Typography>
            </Box>
          ) : (
            replies.map(reply => {
              const isMine = reply.userId === currentUser.id;
              const canDelete = currentUser.role === 'admin' || reply.userId === currentUser.id;
              return (
                <Box
                  key={reply.id}
                  sx={{
                    display: 'flex',
                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                    mb: 2,
                    alignItems: 'flex-end',
                    gap: 1,
                  }}
                >
                  {!isMine && (
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', bgcolor: 'primary.main', mb: 0.5 }}>
                      {initials(reply.userId)}
                    </Avatar>
                  )}

                  <Box sx={{ maxWidth: '72%' }}>
                    {!isMine && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 600, display: 'block', mb: 0.25 }}>
                        {reply.userId}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        position: 'relative',
                        '&:hover .msg-actions': { opacity: 1 },
                      }}
                    >
                      <Paper
                        elevation={0}
                        onMouseDown={() => handleLongPressStart(reply)}
                        onMouseUp={handleLongPressEnd}
                        onMouseLeave={handleLongPressEnd}
                        onTouchStart={() => handleLongPressStart(reply)}
                        onTouchEnd={handleLongPressEnd}
                        sx={{
                          px: 2,
                          py: 1.25,
                          bgcolor: isMine ? 'primary.main' : 'action.hover',
                          color: isMine ? 'primary.contrastText' : 'text.primary',
                          borderRadius: isMine
                            ? '18px 18px 4px 18px'
                            : '18px 18px 18px 4px',
                          cursor: canDelete ? 'default' : 'default',
                          userSelect: 'none',
                          border: '1px solid',
                          borderColor: isMine ? 'transparent' : 'divider',
                        }}
                      >
                        <Typography variant="body2" sx={{ wordBreak: 'break-word', lineHeight: 1.5 }}>
                          {reply.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            textAlign: 'right',
                            opacity: 0.65,
                            fontSize: '0.62rem',
                          }}
                        >
                          {formatDate(reply.createdAt)}
                        </Typography>
                      </Paper>

                      {/* Inline delete on hover */}
                      {canDelete && (
                        <Box
                          className="msg-actions"
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            [isMine ? 'left' : 'right']: '-32px',
                            opacity: 0,
                            transition: 'opacity 0.15s',
                          }}
                        >
                          <Tooltip title="Delete" placement={isMine ? 'left' : 'right'}>
                            <IconButton
                              size="small"
                              onClick={() => setSelectedMessageForActions(reply)}
                              sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'error.50' } }}
                            >
                              <DeleteOutlineIcon fontSize="small" sx={{ fontSize: 16, color: 'error.main' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {isMine && (
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.65rem', bgcolor: 'secondary.main', mb: 0.5 }}>
                      {initials(reply.userId)}
                    </Avatar>
                  )}
                </Box>
              );
            })
          )}

          {loadingMore && (
            <Typography variant="caption" align="center" color="text.secondary" sx={{ display: 'block', py: 2 }}>
              Loading previous messages…
            </Typography>
          )}
          {!hasMore && replies.length > 0 && (
            <Typography variant="caption" align="center" color="text.disabled" sx={{ display: 'block', py: 1 }}>
              — Beginning of conversation —
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Input */}
        <Box
          component="form"
          onSubmit={handleReply}
          sx={{ px: 2.5, py: 2, bgcolor: 'background.paper', display: 'flex', gap: 1.5, alignItems: 'flex-end' }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message…"
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            multiline
            maxRows={3}
            required
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (newReply.trim()) handleReply(e);
              }
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={!newReply.trim() || sendingReply}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: 2.5,
              width: 40,
              height: 40,
              flexShrink: 0,
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
            }}
          >
            <SendRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Dialog>

      {/* ── Delete Message Confirm ── */}
      <Dialog
        open={!!selectedMessageForActions}
        onClose={() => setSelectedMessageForActions(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pt: 3, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: 2,
                bgcolor: 'error.50', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <DeleteOutlineIcon sx={{ color: 'error.main', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight="700">Delete Message</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMessageForActions && (
            <Paper
              elevation={0}
              sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 2 }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word', fontStyle: 'italic' }}>
                "{selectedMessageForActions.message}"
              </Typography>
            </Paper>
          )}
          <DialogContentText sx={{ fontSize: '0.9rem' }}>
            This message will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setSelectedMessageForActions(null)}
            color="inherit"
            variant="text"
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 600 }}
            onClick={() => {
              handleDeleteReply(selectedMessageForActions.id);
              setSelectedMessageForActions(null);
            }}
          >
            Delete Message
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RatingDetail;