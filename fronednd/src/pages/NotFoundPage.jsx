import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const handleNavigateHome = () => {
    // Navigate to dashboard if logged in, otherwise to login page
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <Typography variant="h1" component="h1" sx={{ fontSize: '8rem', color: 'primary.main' }}>
            404
          </Typography>
          
          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            The page you are looking for doesn't exist or has been moved.
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={handleNavigateHome}
            size="large"
          >
            Go to {isAuthenticated ? 'Dashboard' : 'Login'}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default NotFoundPage; 