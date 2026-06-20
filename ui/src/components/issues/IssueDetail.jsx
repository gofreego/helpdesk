import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchIssueById, updateIssue, deleteIssue,
  createIssueReply, deleteIssueReply, fetchIssueReplies, updateIssueStatus
} from '../../services/issue.service';
import { sessionManager } from '../../services';
import { useNotification } from '@gofreego/tsutils';
import {
  Container, Box, Typography, Button, Card, CardContent, Grid, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  TextField, MenuItem, CircularProgress, IconButton, Paper, Alert, Avatar, Tooltip, Menu, ListItemIcon, ListItemText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UpdateIcon from '@mui/icons-material/Update';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_MAP = {
  1: { label: 'Open',        color: 'error' },
  2: { label: 'In Progress', color: 'warning' },
  3: { label: 'Resolved',    color: 'success' },
  4: { label: 'Closed',      color: 'default' },
};

const STATUS_OPTIONS = [
  { value: 1, label: 'Open' },
  { value: 2, label: 'In Progress' },
  { value: 3, label: 'Resolved' },
  { value: 4, label: 'Closed' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_ICON = {
  1: '🔴',
  2: '🟡',
  3: '🟢',
  4: '⚫',
};

const ClickableStatusChip = ({ status, anchorEl, onOpen, onClose, onChange }) => {
  const s = STATUS_MAP[status] || { label: 'Unknown', color: 'default' };
  return (
    <>
      <Chip
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {s.label}
            <KeyboardArrowDownIcon sx={{ fontSize: 14, opacity: 0.7 }} />
          </Box>
        }
        color={s.color}
        size="small"
        variant="outlined"
        onClick={onOpen}
        sx={{ fontWeight: 600, cursor: 'pointer' }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
      >
        {STATUS_OPTIONS.map(opt => (
          <MenuItem
            key={opt.value}
            selected={opt.value === status}
            onClick={() => { onChange(opt.value); onClose(); }}
            sx={{ gap: 1.5 }}
          >
            <ListItemText primary={opt.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

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

const initials = (id = '') => String(id).slice(0, 2).toUpperCase() || '?';

const formatDate = (ts) => {
  if (!ts) return '—';
  return new Date(parseInt(ts)).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

// ─── Component ────────────────────────────────────────────────────────────────

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedMessageForActions, setSelectedMessageForActions] = useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const longPressTimer = useRef(null);
  const scrollRef = useRef(null);
  const LIMIT = 10;

  const hasManagePermission = currentUser.role?.split(',').some(p => p === 'admin' || p === 'issue:manage');

  // ── Fetch ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchIssueById(id);
        setIssue(data.issue);
        setNewStatus(data.issue.status);
        setEditData({ title: data.issue.title, description: data.issue.description });
      } catch (error) {
        console.error('Error fetching issue:', error);
        showNotification(error.message || 'Failed to fetch issue details', 'error');
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
      if (newReplies.length < LIMIT) setHasMore(false);
    } catch (error) {
      console.error('Error fetching replies:', error);
      showNotification(error.message || 'Failed to fetch replies', 'error');
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
      await createIssueReply(id, { message: newReply });
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
      const data = await updateIssue(id, { ...editData, status: issue.status });
      setIssue(data.issue);
      setEditMode(false);
      showNotification('Issue updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating issue:', error);
      showNotification(error.message || 'Failed to update issue', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleStatusChange = async (newStatusValue) => {
    try {
      await updateIssueStatus(id, { status: parseInt(newStatusValue) });
      setIssue(prev => ({ ...prev, status: newStatusValue }));
      setNewStatus(newStatusValue);
      showNotification('Status updated!', 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification(error.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIssue(id);
      setShowDeleteIssueConfirm(false);
      showNotification('Issue deleted successfully!', 'success');
      setTimeout(() => navigate('/helpdesk/issues'), 1500);
    } catch (error) {
      console.error('Error deleting issue:', error);
      showNotification(error.message || 'Failed to delete issue', 'error');
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await deleteIssueReply(replyId);
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

  if (!issue) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">Issue not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>

      {/* ── Page Header ── */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/helpdesk/issues')}
            color="inherit" size="small"
            sx={{ mb: 1, color: 'text.secondary', pl: 0 }}
          >
            Back to Issues
          </Button>
          <Typography variant="h5" component="h1" fontWeight="700" sx={{ letterSpacing: '-0.3px' }}>
            Issue Details
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            ID: {issue.id}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<ChatBubbleOutlineIcon />} onClick={handleShowChat} sx={{ borderRadius: 2 }}>
            Chat
          </Button>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditMode(true)} sx={{ borderRadius: 2 }}>
            Edit
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setShowDeleteIssueConfirm(true)} sx={{ borderRadius: 2 }}>
            Delete
          </Button>
        </Box>
      </Box>

      {/* ── Main Card ── */}
      <Grid container spacing={3} alignItems="flex-start" sx={{ flexWrap: 'nowrap' }}>

        {/* ── LEFT: Title + Description ── */}
        <Grid item sx={{ flex: '1 1 auto', minWidth: 0 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)', height: '100%' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Title
              </Typography>
              <Typography variant="h5" fontWeight="700" sx={{ mt: 1.5, mb: 3, letterSpacing: '-0.3px', lineHeight: 1.3 }}>
                {issue.title}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Description
              </Typography>

              {issue.description ? (
                <Paper
                  elevation={0}
                  sx={{ mt: 1.5, p: 3, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', minHeight: 140 }}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                    {issue.description}
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ mt: 1.5, p: 3, borderRadius: 2, border: '1px dashed', borderColor: 'divider', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.disabled" fontStyle="italic">No description provided.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── RIGHT: Status + Details ── */}
        <Grid item sx={{ flexShrink: 0, width: { xs: 240, sm: 280, md: 320 } }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              {/* Chips row */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
                <ClickableStatusChip
                  status={issue.status}
                  anchorEl={statusAnchorEl}
                  onOpen={(e) => setStatusAnchorEl(e.currentTarget)}
                  onClose={() => setStatusAnchorEl(null)}
                  onChange={handleStatusChange}
                />
                <Chip label={issue.issueType} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
              </Box>

              <Divider sx={{ mb: 2.5 }} />

              {/* Metadata */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <InfoRow label="Issue ID">
                  <Typography variant="body2" fontWeight="500" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    {issue.id}
                  </Typography>
                </InfoRow>

                <InfoRow label="User ID">
                  <Typography variant="body2" fontWeight="500">{issue.userId}</Typography>
                </InfoRow>

                <InfoRow label="Product ID">
                  <Typography variant="body2" fontWeight="500">{issue.productId}</Typography>
                </InfoRow>

                <InfoRow label="Entity">
                  <Chip label={issue.entity} size="small" color="info" variant="outlined" sx={{ fontWeight: 600, mt: 0.25 }} />
                </InfoRow>

                <InfoRow label="Entity ID">
                  <Typography variant="body2" fontWeight="500">{issue.entityId}</Typography>
                </InfoRow>

                <InfoRow label="Created At">
                  <Typography variant="body2" fontWeight="500">{formatDate(issue.createdAt)}</Typography>
                </InfoRow>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>



      {/* ── Edit Issue Modal ── */}
      <Dialog
        open={editMode}
        onClose={() => setEditMode(false)}
        fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" fontWeight="700" sx={{ letterSpacing: '-0.3px' }}>Edit Issue</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Update the title and description</Typography>
            </Box>
            <IconButton size="small" onClick={() => setEditMode(false)} sx={{ mt: -0.5, mr: -0.5, color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Divider />
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Title
          </Typography>
          <TextField
            fullWidth size="small"
            placeholder="Brief summary of the issue"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            sx={{ mt: 1.5, mb: 3 }}
          />

          <Divider sx={{ mb: 3 }} />

          <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Description <Typography component="span" variant="caption" color="text.disabled">(optional)</Typography>
          </Typography>
          <TextField
            fullWidth multiline rows={5}
            placeholder="Describe the issue in detail..."
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            inputProps={{ maxLength: 2000 }}
            helperText={`${editData.description.length}/2000`}
            sx={{ mt: 1.5 }}
          />
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="text" color="inherit" onClick={() => setEditMode(false)} sx={{ borderRadius: 2, color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            variant="contained" startIcon={<SaveIcon />}
            onClick={handleUpdate} disabled={savingEdit}
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            {savingEdit ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Issue Confirm ── */}
      <Dialog
        open={showDeleteIssueConfirm}
        onClose={() => setShowDeleteIssueConfirm(false)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pt: 3, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'error.50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeleteIcon sx={{ color: 'error.main', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight="700">Delete Issue</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 1 }}>
            Are you sure you want to delete this issue? This action <strong>cannot be undone</strong>.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="text" color="inherit" onClick={() => setShowDeleteIssueConfirm(false)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: 2, fontWeight: 600 }}>
            Delete Issue
          </Button>
        </DialogActions>
      </Dialog>



      {/* ── Chat Dialog ── */}
      <Dialog
        open={showChat}
        onClose={() => setShowChat(false)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { height: '82vh', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' } }}
      >
        {/* Header */}
        <Box sx={{ px: 3, pt: 2.5, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ChatBubbleOutlineIcon color="primary" />
            <Box>
              <Typography variant="subtitle1" fontWeight="700">Issue Chat</Typography>
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
          sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', px: 2.5, py: 2 }}
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
                  sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', mb: 2, alignItems: 'flex-end', gap: 1 }}
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
                    <Box sx={{ position: 'relative', '&:hover .msg-actions': { opacity: 1 } }}>
                      <Paper
                        elevation={0}
                        onMouseDown={() => handleLongPressStart(reply)}
                        onMouseUp={handleLongPressEnd}
                        onMouseLeave={handleLongPressEnd}
                        onTouchStart={() => handleLongPressStart(reply)}
                        onTouchEnd={handleLongPressEnd}
                        sx={{
                          px: 2, py: 1.25,
                          bgcolor: isMine ? 'primary.main' : 'action.hover',
                          color: isMine ? 'primary.contrastText' : 'text.primary',
                          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          userSelect: 'none',
                          border: '1px solid',
                          borderColor: isMine ? 'transparent' : 'divider',
                        }}
                      >
                        <Typography variant="body2" sx={{ wordBreak: 'break-word', lineHeight: 1.5 }}>
                          {reply.message}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: 'right', opacity: 0.65, fontSize: '0.62rem' }}>
                          {formatDate(reply.createdAt)}
                        </Typography>
                      </Paper>

                      {canDelete && (
                        <Box
                          className="msg-actions"
                          sx={{
                            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                            [isMine ? 'left' : 'right']: '-32px',
                            opacity: 0, transition: 'opacity 0.15s',
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
          component="form" onSubmit={handleReply}
          sx={{ px: 2.5, py: 2, bgcolor: 'background.paper', display: 'flex', gap: 1.5, alignItems: 'flex-end' }}
        >
          <TextField
            fullWidth size="small"
            placeholder="Type a message…"
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            multiline maxRows={3} required
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (newReply.trim()) handleReply(e);
              }
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <IconButton
            type="submit" color="primary"
            disabled={!newReply.trim() || sendingReply}
            sx={{
              bgcolor: 'primary.main', color: 'white', borderRadius: 2.5,
              width: 40, height: 40, flexShrink: 0,
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
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pt: 3, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'error.50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeleteOutlineIcon sx={{ color: 'error.main', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" fontWeight="700">Delete Message</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMessageForActions && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 2 }}>
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
          <Button variant="text" color="inherit" onClick={() => setSelectedMessageForActions(null)} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            color="error" variant="contained"
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

export default IssueDetail;