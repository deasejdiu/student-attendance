import React from 'react';
import { Container, Paper, Box, Typography, Button } from '@mui/material';
import LoginForm from '../components/Forms/LoginForm';
import { Link } from 'react-router-dom';

function LoginPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        bgcolor: '#f0f0f0',
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ padding: '40px', borderRadius: '12px' }} elevation={3}>
          <Typography variant="h5" align="center" gutterBottom>
            Login
          </Typography>
          <LoginForm />
          <Button component={Link} to="/register" fullWidth variant="text" sx={{ mt: 2, textTransform: 'none' }}>
            New here? Click here to register a user
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;