import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchIssues, fetchIssueConfig } from '../../services/issue.service';
import { useNotification } from '@gofreego/tsutils';
import {
  Container, Box, Typography, Button, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, Chip, CircularProgress, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import CreateIssue from './CreateIssue';

const STATUS_MAP = {
  1: { label: 'Open',        color: 'error' },
  2: { label: 'In Progress', color: 'warning' },
  3: { label: 'Resolved',    color: 'success' },
  4: { label: 'Closed',      color: 'default' },
};

const StatusChip = ({ status }) => {
  const s = STATUS_MAP[status] || { label: 'Unknown', color: 'default' };
  return <Chip label={s.label} color={s.color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
};

const IssuesList = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [issues, setIssues] = useState([]);
  const [issueEntities, setIssueEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    productId: '',
    entity: '',
    entityId: '',
    userId: '',
    status: '',
    issueType: ''
  });
  const [issueTypes, setIssueTypes] = useState([]);
  const [productIds, setProductIds] = useState([]);

  useEffect(() => {
    loadIssues();
    loadIssueConfig();
  }, [showNotification]);

  const loadIssueConfig = async () => {
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

  const loadIssues = async () => {
    try {
      const response = await fetchIssues(filters);
      setIssues(response.issues || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
      showNotification(error.message || 'Failed to fetch issues', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    setLoading(true);
    loadIssues();
  };

  const handleClearFilters = () => {
    setFilters({ productId: '', entity: '', entityId: '', userId: '', status: '', issueType: '' });
    setLoading(true);
    setTimeout(() => loadIssues(), 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>

      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight="700" sx={{ letterSpacing: '-0.3px' }}>
            Issues Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Track and resolve customer issues
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateModalOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Create Issue
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              select size="small" name="productId" label="Product ID"
              value={filters.productId} onChange={handleFilterChange}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value=""><em>All Products</em></MenuItem>
              {productIds.map(id => <MenuItem key={id} value={id}>{id}</MenuItem>)}
            </TextField>

            <TextField
              select size="small" name="entity" label="Entity"
              value={filters.entity} onChange={handleFilterChange}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value=""><em>All Entities</em></MenuItem>
              {issueEntities.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
            </TextField>

            <TextField
              select size="small" name="status" label="Status"
              value={filters.status} onChange={handleFilterChange}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value=""><em>All Statuses</em></MenuItem>
              {Object.entries(STATUS_MAP).map(([val, s]) => (
                <MenuItem key={val} value={val}>{s.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              select size="small" name="issueType" label="Issue Type"
              value={filters.issueType} onChange={handleFilterChange}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value=""><em>All Types</em></MenuItem>
              {issueTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>

            <TextField
              size="small" name="entityId" label="Entity ID"
              placeholder="e.g., 12345"
              value={filters.entityId} onChange={handleFilterChange}
              sx={{ minWidth: 160 }}
            />

            <TextField
              size="small" name="userId" label="User ID"
              placeholder="e.g., user123"
              value={filters.userId} onChange={handleFilterChange}
              sx={{ minWidth: 160 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="contained" size="small" onClick={handleApplyFilters} sx={{ borderRadius: 2 }}>
              Apply Filters
            </Button>
            <Button variant="outlined" size="small" onClick={handleClearFilters} sx={{ borderRadius: 2 }}>
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)' }}>
        {issues.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <BugReportOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>No issues found</Typography>
            <Typography variant="body2" color="text.secondary">Issues will appear here once customers report them.</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ px: 3, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {issues.length} issue{issues.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: 750 }}>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Entity</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Entity ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issues.map(issue => (
                    <TableRow key={issue.id} hover>
                      <TableCell sx={{ fontWeight: 600, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {issue.title}
                      </TableCell>
                      <TableCell>{issue.productId}</TableCell>
                      <TableCell>
                        <Chip label={issue.entity} size="small" color="info" variant="outlined" />
                      </TableCell>
                      <TableCell>{issue.entityId}</TableCell>
                      <TableCell>
                        <Chip label={issue.issueType} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <StatusChip status={issue.status} />
                      </TableCell>
                      <TableCell>{issue.userId}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/helpdesk/issues/${issue.id}`)}
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
          </>
        )}
      </Card>

      <CreateIssue
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadIssues}
      />
    </Container>
  );
};

export default IssuesList;