import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Grid, 
  Divider, 
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Email as EmailIcon, 
  AdminPanelSettings as AdminIcon,
  School as TeacherIcon,
  CalendarMonth as CalendarIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import apiService from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

function ProfilePage() {
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If we already have the user from AuthContext, use it
    if (authUser && !authLoading) {
      setProfile(authUser);
      setLoading(false);
    } else {
      // Otherwise fetch from API
      fetchProfile();
    }
  }, [authUser, authLoading]);

  const fetchProfile = async () => {
    try {
      const response = await apiService.users.getProfile();
      setProfile(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile information. Please try again later.');
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Format date for better display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <Avatar 
            sx={{ 
              width: 120, 
              height: 120, 
              bgcolor: 'primary.main',
              mb: 2,
              fontSize: '3rem'
            }}
          >
            {profile?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom>
            {profile?.username}
          </Typography>
          <Chip 
            icon={profile?.role === 'admin' ? <AdminIcon /> : <TeacherIcon />}
            label={profile?.role.toUpperCase()}
            color={profile?.role === 'admin' ? 'error' : 'primary'}
            sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    Account Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Username
                  </Typography>
                  <Typography variant="body1">
                    {profile?.username}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {profile?.id}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <EmailIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    Contact Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body1">
                    {profile?.email}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    Account Details
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Account Created
                  </Typography>
                  <Typography variant="body1">
                    {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Role & Permissions
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {profile?.role} User
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="center">
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleSignOut}
            sx={{ 
              px: 4, 
              py: 1.5,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                backgroundColor: 'error.light',
                color: 'white'
              }
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ProfilePage; 