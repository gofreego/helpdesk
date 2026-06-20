import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchRatings, fetchRatingTypes } from '../../services/rating.service';
import { useNotification } from '@gofreego/tsutils';
import {
  Container, Box, Typography, Button, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, FormControl, InputLabel, Select, Chip, CircularProgress,
  Paper, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CreateRating from './CreateRating';

const RatingsList = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [ratings, setRatings] = useState([]);
  const [ratingEntities, setRatingEntities] = useState([]);
  const [productIds, setProductIds] = useState([]);
  const [maxRating, setMaxRating] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    productId: '',
    entity: '',
    entityId: '',
    userId: ''
  });

  useEffect(() => {
    loadRatings();
    loadRatingEntities();
  }, [showNotification]);

  const loadRatingEntities = async () => {
    try {
      const data = await fetchRatingTypes();
      setRatingEntities(data.entities || []);
      setMaxRating(data.maxRating || 10);
      setProductIds(data.productIds || []);
    } catch (err) {
      console.error('Error fetching rating entities:', err);
      showNotification('Failed to load rating configuration', 'error');
    }
  };

  const loadRatings = async () => {
    try {
      const response = await fetchRatings(filters);
      setRatings(response.ratings || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      showNotification(error.message || 'Failed to fetch ratings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    setLoading(true);
    loadRatings();
  };

  const handleClearFilters = () => {
    setFilters({ productId: '', entity: '', entityId: '', userId: '' });
    setLoading(true);
    setTimeout(() => loadRatings(), 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="600">
            Ratings Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all customer ratings
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateModalOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Create Rating
        </Button>
      </Box>

      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              select
              size="small"
              name="productId"
              label="Product ID"
              value={filters.productId}
              onChange={handleFilterChange}
              sx={{ minWidth: 200, flex: { xs: 1, sm: 'none' } }}
            >
              <MenuItem value=""><em>All Products</em></MenuItem>
              {productIds.map(id => (
                <MenuItem key={id} value={id}>{id}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              name="entity"
              label="Entity"
              value={filters.entity}
              onChange={handleFilterChange}
              sx={{ minWidth: 200, flex: { xs: 1, sm: 'none' } }}
            >
              <MenuItem value=""><em>All Entities</em></MenuItem>
              {ratingEntities.map(entity => (
                <MenuItem key={entity} value={entity}>{entity}</MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              name="entityId"
              label="Entity ID"
              placeholder="e.g., 12345"
              value={filters.entityId}
              onChange={handleFilterChange}
              sx={{ minWidth: 200, flex: { xs: 1, sm: 'none' } }}
            />

            <TextField
              size="small"
              name="userId"
              label="User ID"
              placeholder="e.g., user123"
              value={filters.userId}
              onChange={handleFilterChange}
              sx={{ minWidth: 200, flex: { xs: 1, sm: 'none' } }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="contained" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
        {ratings.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No ratings yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ratings will appear here once customers start submitting them.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {ratings.length} rating{ratings.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell>Product ID</TableCell>
                    <TableCell>Entity</TableCell>
                    <TableCell>Entity ID</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Comment</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ratings.map(rating => (
                    <TableRow key={rating.id} hover>
                      <TableCell>{rating.productId}</TableCell>
                      <TableCell>
                        <Chip label={rating.entity} size="small" color="info" variant="outlined" />
                      </TableCell>
                      <TableCell>{rating.entityId}</TableCell>
                      <TableCell>
                        <Typography variant="body1" component="span" fontWeight="600">
                          {rating.rating}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                          / {maxRating}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {rating.comment || '-'}
                      </TableCell>
                      <TableCell>{rating.userId}</TableCell>
                      <TableCell align="right">
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => navigate(`/helpdesk/ratings/${rating.id}`)}
                          sx={{ borderRadius: 2 }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Card>
      <CreateRating
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadRatings}
      />
    </Container>
  );
};

export default RatingsList;