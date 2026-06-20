import React from 'react';
import { Container, Box, Typography, Card, CardContent } from '@mui/material';

const Dashboard = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="600">
          Welcome to Helpdesk Admin
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage customer ratings and support issues from this central dashboard.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 4, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h5" component="h3" gutterBottom color="text.secondary">
            Welcome!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Use the sidebar navigation to manage ratings and issues.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;