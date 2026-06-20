import React, { useState, useEffect } from 'react';
import { createRating, fetchRatingTypes } from '../../services/rating.service';
import { useNotification } from '@gofreego/tsutils';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button,
  TextField, MenuItem, Alert, Slider, Divider, IconButton, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

const CreateRating = ({ open, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    productId: '',
    entity: '',
    entityId: '',
    rating: 5,
    comment: ''
  });
  const [ratingEntities, setRatingEntities] = useState([]);
  const [productIds, setProductIds] = useState([]);
  const [maxRating, setMaxRating] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRatingConfig = async () => {
      try {
        const data = await fetchRatingTypes();
        const entities = data.entities || [];
        const max = data.maxRating || 10;
        const products = data.productIds || [];
        setRatingEntities(entities);
        setMaxRating(max);
        setProductIds(products);
        if (entities.length > 0 && !formData.entity) {
          setFormData(prev => ({ ...prev, entity: entities[0] }));
        }
      } catch (err) {
        console.error('Error fetching rating config:', err);
        showNotification('Failed to load rating configuration', 'error');
      }
    };
    loadRatingConfig();
  }, [showNotification]);

  useEffect(() => {
    if (open) {
      setFormData({
        productId: '',
        entity: ratingEntities.length > 0 ? ratingEntities[0] : '',
        entityId: '',
        rating: 5,
        comment: ''
      });
      setError('');
    }
  }, [open, ratingEntities]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'rating' || name === 'productId') ? parseFloat(value) : value
    }));
  };

  const handleSliderChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, rating: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createRating(formData);
      showNotification('Rating created successfully', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating rating:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create rating';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const ratingPercent = maxRating > 0 ? (formData.rating / maxRating) * 100 : 0;
  const getRatingColor = () => {
    if (ratingPercent >= 70) return '#22c55e';
    if (ratingPercent >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{
          px: 3,
          pt: 3,
          pb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <Box>
            <Typography variant="h6" fontWeight="700" sx={{ letterSpacing: '-0.3px' }}>
              Create Rating
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Submit a new customer rating and feedback
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
              select
              fullWidth
              required
              size="small"
              name="productId"
              label="Product"
              value={formData.productId}
              onChange={handleChange}
            >
              <MenuItem value=""><em>Select a product</em></MenuItem>
              {productIds.map(id => (
                <MenuItem key={id} value={id}>{id}</MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                required
                size="small"
                name="entity"
                label="Entity"
                value={formData.entity}
                onChange={handleChange}
                sx={{ flex: 1 }}
              >
                <MenuItem value="" disabled><em>Select entity</em></MenuItem>
                {ratingEntities.map(entity => (
                  <MenuItem key={entity} value={entity}>{entity}</MenuItem>
                ))}
              </TextField>

              <TextField
                required
                size="small"
                name="entityId"
                label="Entity ID"
                placeholder="e.g., 12345"
                value={formData.entityId}
                onChange={handleChange}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Section: Rating */}
          <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Rating
          </Typography>

          <Box sx={{ mt: 2, mb: 3 }}>
            {/* Score display */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarRoundedIcon sx={{ color: getRatingColor(), fontSize: 28, transition: 'color 0.3s' }} />
                <Box>
                  <Typography variant="h5" fontWeight="700" sx={{ lineHeight: 1, color: getRatingColor(), transition: 'color 0.3s' }}>
                    {formData.rating}
                    <Typography component="span" variant="body2" color="text.secondary" fontWeight="400" sx={{ ml: 0.5 }}>
                      / {maxRating}
                    </Typography>
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={
                  ratingPercent >= 70 ? 'Great' :
                  ratingPercent >= 40 ? 'Average' : 'Poor'
                }
                size="small"
                sx={{
                  bgcolor: `${getRatingColor()}18`,
                  color: getRatingColor(),
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  transition: 'all 0.3s',
                }}
              />
            </Box>

            <Slider
              name="rating"
              value={formData.rating}
              onChange={handleSliderChange}
              aria-labelledby="rating-slider"
              valueLabelDisplay="auto"
              step={0.5}
              marks
              min={1}
              max={maxRating}
              sx={{
                '& .MuiSlider-thumb': { transition: 'left 0.1s' },
                '& .MuiSlider-track': { transition: 'width 0.1s' },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">1 — Poor</Typography>
              <Typography variant="caption" color="text.secondary">{maxRating} — Excellent</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Section: Comment */}
          <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Comment <Typography component="span" variant="caption" color="text.disabled">(optional)</Typography>
          </Typography>

          <TextField
            fullWidth
            name="comment"
            placeholder="Share your detailed feedback here..."
            multiline
            rows={3}
            value={formData.comment}
            onChange={handleChange}
            sx={{ mt: 1.5 }}
            inputProps={{ maxLength: 1000 }}
            helperText={`${formData.comment.length}/1000`}
          />
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            type="button"
            variant="text"
            onClick={onClose}
            color="inherit"
            sx={{ borderRadius: 2, color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            {loading ? 'Submitting…' : 'Submit Rating'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateRating;
