import React from 'react';
import { Container, Paper, Box, Typography } from '@mui/material';
import RegisterForm from '../components/Forms/RegisterForm';

function Register() {
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
                Register
              </Typography>
              <RegisterForm/>
            </Paper>
          </Container>
        </Box>
      );
}

export default Register;
