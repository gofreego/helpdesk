import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Chip,
} from '@mui/material';
import { useNotification, extractErrorMessage } from '@gofreego/tsutils';
import { adminService } from '../services';

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await adminService.listProducts();
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification(extractErrorMessage(error) || 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData(product);
    } else {
      setEditingId(null);
      setFormData({
        id: '',
        name: '',
        description: '',
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name) {
      showNotification('Product name is required', 'error');
      return;
    }
    if (!editingId && !formData.id) {
      showNotification('Product ID is required', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        await adminService.updateProduct(editingId, formData);
        showNotification('Product updated successfully', 'success');
      } else {
        await adminService.createProduct(formData);
        showNotification('Product created successfully', 'success');
      }
      handleCloseDialog();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      const fallback = editingId ? 'Failed to update product' : 'Failed to create product';
      showNotification(extractErrorMessage(error) || fallback, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminService.deleteProduct(id);
        showNotification('Product deleted successfully', 'success');
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        showNotification(extractErrorMessage(error) || 'Failed to delete product', 'error');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <h2>Products</h2>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>
                  <Chip
                    label={product.is_active ? 'Active' : 'Inactive'}
                    color={product.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <div style={{ padding: '20px' }}>
          <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>

          {!editingId && (
            <TextField
              label="Product ID"
              type="number"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              fullWidth
              margin="normal"
              required
            />
          )}

          <TextField
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            }
            label="Active"
          />

          <Box mt={2} display="flex" gap={1}>
            <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outlined" onClick={handleCloseDialog} disabled={saving}>
              Cancel
            </Button>
          </Box>
        </div>
      </Dialog>
    </div>
  );
}
