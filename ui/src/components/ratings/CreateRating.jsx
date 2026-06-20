import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRating, fetchRatingTypes } from '../../services/rating.service';
import { useNotification } from '@gofreego/tsutils';
import {
  Container, Box, Typography, Button, Card, CardContent,
  TextField, MenuItem, FormControl, InputLabel, Select, Alert,
  Slider, Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CreateRating = () => {
  const navigate = useNavigate();
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
      navigate('/helpdesk/ratings');
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
    <Container maxWidth="xl" sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 800 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/helpdesk/ratings')}
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            Back to Ratings
          </Button>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="700">
            Create Rating
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Submit a new customer rating and feedback
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}>
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
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
                  <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                    <Typography id="rating-slider" gutterBottom color="text.secondary" fontWeight="500">
                      Overall Rating * (1-{maxRating})
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, px: 2, mt: 2 }}>
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
                      <Box sx={{ minWidth: '60px', textAlign: 'center', p: 1, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.100' }}>
                        <Typography variant="h6" fontWeight="700" color="primary.main">
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
                    rows={4}
                    value={formData.comment}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => navigate('/helpdesk/ratings')}
                      size="large"
                      sx={{ px: 4, borderRadius: 2 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      size="large"
                      sx={{ px: 4, borderRadius: 2 }}
                    >
                      {loading ? 'Creating...' : 'Submit Rating'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default CreateRating;
