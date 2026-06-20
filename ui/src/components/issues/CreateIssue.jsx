import React, { useState, useEffect } from 'react';
import { createIssue, fetchIssueConfig } from '../../services/issue.service';
import { useNotification } from '@gofreego/tsutils';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, TextField, MenuItem, Alert, Divider, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CreateIssue = ({ open, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    productId: '',
    entity: '',
    entityId: '',
    title: '',
    description: '',
    issueType: ''
  });
  const [issueEntities, setIssueEntities] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [productIds, setProductIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await fetchIssueConfig();
        setIssueEntities(data.entities || []);
        setIssueTypes(data.types || []);
        setProductIds(data.productIds || []);
      } catch (err) {
        console.error('Error fetching issue config:', err);
        showNotification('Failed to load issue configuration', 'error');
      }
    };
    loadConfig();
  }, [showNotification]);

  useEffect(() => {
    if (open) {
      setFormData({ productId: '', entity: '', entityId: '', title: '', description: '', issueType: '' });
      setError('');
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'productId' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createIssue(formData);
      showNotification('Issue created successfully', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating issue:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create issue';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" fontWeight="700" sx={{ letterSpacing: '-0.3px' }}>
              Create Issue
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Report a new customer issue
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ mt: -0.5, mr: -0.5, color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider />
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Section: Target */}
          <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Target
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1.5, mb: 3 }}>
            <TextField
              select fullWidth required size="small"
              name="productId" label="Product"
              value={formData.productId} onChange={handleChange}
            >
              <MenuItem value=""><em>Select a product</em></MenuItem>
              {productIds.map(id => <MenuItem key={id} value={id}>{id}</MenuItem>)}
            </TextField>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select required size="small"
                name="entity" label="Entity"
                value={formData.entity} onChange={handleChange}
                sx={{ flex: 1 }}
              >
                <MenuItem value="" disabled><em>Select entity</em></MenuItem>
                {issueEntities.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
              </TextField>

              <TextField
                required size="small"
                name="entityId" label="Entity ID"
                placeholder="e.g., 12345"
                value={formData.entityId} onChange={handleChange}
                sx={{ flex: 1 }}
              />
            </Box>

            <TextField
              select required size="small"
              name="issueType" label="Issue Type"
              value={formData.issueType} onChange={handleChange}
            >
              <MenuItem value="" disabled><em>Select issue type</em></MenuItem>
              {issueTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Section: Issue Details */}
          <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Issue Details
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1.5 }}>
            <TextField
              fullWidth required size="small"
              name="title" label="Title"
              placeholder="Brief summary of the issue"
              value={formData.title} onChange={handleChange}
            />

            <Box>
              <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Description <Typography component="span" variant="caption" color="text.disabled">(optional)</Typography>
              </Typography>
              <TextField
                fullWidth multiline rows={3}
                name="description"
                placeholder="Describe the issue in detail..."
                value={formData.description} onChange={handleChange}
                inputProps={{ maxLength: 2000 }}
                helperText={`${formData.description.length}/2000`}
                sx={{ mt: 1.5 }}
              />
            </Box>
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            type="button" variant="text" color="inherit"
            onClick={onClose}
            sx={{ borderRadius: 2, color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            type="submit" variant="contained"
            disabled={loading}
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            {loading ? 'Creating…' : 'Create Issue'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateIssue;
