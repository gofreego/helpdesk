import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNotification, extractErrorMessage } from '@gofreego/tsutils';
import { adminService } from '../services';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ marginTop: '20px' }}>
      {value === index && children}
    </div>
  );
}

export function AdminProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [product, setProduct] = useState(null);
  const [entities, setEntities] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('entity');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    entity_name: '',
    type_name: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const productRes = await adminService.getProduct(productId);
      setProduct(productRes.data.product);

      const entitiesRes = await adminService.listProductEntities(productId);
      setEntities(entitiesRes.data.entities || []);

      const issueTypesRes = await adminService.listProductIssueTypes(productId);
      setIssueTypes(issueTypesRes.data.issue_types || []);
    } catch (error) {
      console.error('Error fetching product data:', error);
      showNotification(extractErrorMessage(error) || 'Failed to load product data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    if (item) {
      setEditingId(item.id);
      if (type === 'entity') {
        setFormData({
          entity_name: item.entity_name,
          type_name: '',
          description: item.description,
        });
      } else {
        setFormData({
          entity_name: '',
          type_name: item.type_name,
          description: item.description,
        });
      }
    } else {
      setEditingId(null);
      setFormData({
        entity_name: '',
        type_name: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      if (dialogType === 'entity') {
        if (!formData.entity_name) {
          showNotification('Entity name is required', 'error');
          return;
        }
        await adminService.createProductEntity(productId, {
          product_id: parseInt(productId),
          entity_name: formData.entity_name,
          description: formData.description,
        });
        showNotification('Entity added successfully', 'success');
      } else {
        if (!formData.type_name) {
          showNotification('Issue type name is required', 'error');
          return;
        }
        await adminService.createProductIssueType(productId, {
          product_id: parseInt(productId),
          type_name: formData.type_name,
          description: formData.description,
        });
        showNotification('Issue type added successfully', 'success');
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error(`Error saving ${dialogType}:`, error);
      showNotification(extractErrorMessage(error) || `Failed to save ${dialogType}`, 'error');
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        if (type === 'entity') {
          await adminService.deleteProductEntity(id);
        } else {
          await adminService.deleteProductIssueType(id);
        }
        showNotification(`${type} deleted successfully`, 'success');
        loadData();
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        showNotification(extractErrorMessage(error) || `Failed to delete ${type}`, 'error');
      }
    }
  };

  if (loading || !product) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/helpdesk/admin/products')}
        style={{ marginBottom: '20px' }}
      >
        Back
      </Button>

      <Card style={{ marginBottom: '20px' }}>
        <CardContent>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p>Status: {product.is_active ? 'Active' : 'Inactive'}</p>
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Entities" />
          <Tab label="Issue Types" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <h3>Product Entities</h3>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog('entity')}
          >
            Add Entity
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Entity Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entities.map((entity) => (
                <TableRow key={entity.id} hover>
                  <TableCell>{entity.entity_name}</TableCell>
                  <TableCell>{entity.description}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(entity.id, 'entity')}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <h3>Issue Types</h3>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog('type')}
          >
            Add Issue Type
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Type Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issueTypes.map((type) => (
                <TableRow key={type.id} hover>
                  <TableCell>{type.type_name}</TableCell>
                  <TableCell>{type.description}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(type.id, 'issue type')}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <div style={{ padding: '20px' }}>
          <h3>{dialogType === 'entity' ? 'Add Entity' : 'Add Issue Type'}</h3>

          <TextField
            label={dialogType === 'entity' ? 'Entity Name' : 'Issue Type Name'}
            value={dialogType === 'entity' ? formData.entity_name : formData.type_name}
            onChange={(e) =>
              setFormData({
                ...formData,
                [dialogType === 'entity' ? 'entity_name' : 'type_name']: e.target.value,
              })
            }
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

          <Box mt={2} display="flex" gap={1}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
            <Button variant="outlined" onClick={handleCloseDialog}>
              Cancel
            </Button>
          </Box>
        </div>
      </Dialog>
    </div>
  );
}
