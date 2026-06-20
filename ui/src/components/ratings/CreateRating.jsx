import React, { useState, useEffect } from 'react';
import { createRating, fetchRatingTypes } from '../../services/rating.service';
import { useNotification } from '@gofreego/tsutils';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button,
  TextField, MenuItem, Alert, Slider, Grid
} from '@mui/material';

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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h5" component="span" fontWeight="700">
          Create Rating
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Submit a new customer rating and feedback
        </Typography>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                name="productId"
                label="Product ID"
                value={formData.productId}
                onChange={handleChange}
              >
                <MenuItem value=""><em>Select Product ID</em></MenuItem>
                {productIds.map(id => (
                  <MenuItem key={id} value={id}>{id}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                name="entity"
                label="Entity"
                value={formData.entity}
                onChange={handleChange}
              >
                <MenuItem value="" disabled><em>Select Entity</em></MenuItem>
                {ratingEntities.map(entity => (
                  <MenuItem key={entity} value={entity}>{entity}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="entityId"
                label="Entity ID"
                placeholder="e.g., 12345"
                value={formData.entityId}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                <Typography id="rating-slider" gutterBottom color="text.secondary" fontWeight="500">
                  Overall Rating * (1-{maxRating})
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, px: 1, mt: 1 }}>
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
                    sx={{ flex: 1 }}
                  />
                  <Box sx={{ minWidth: '50px', textAlign: 'center', p: 1, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.100' }}>
                    <Typography variant="body1" fontWeight="700" color="primary.main">
                      {formData.rating}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="comment"
                label="Comment"
                placeholder="Share your detailed feedback here..."
                multiline
                rows={3}
                value={formData.comment}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? 'Creating...' : 'Submit Rating'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateRating;
