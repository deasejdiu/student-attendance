import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Button,
  Fade,
  Chip
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  AccessTime as LateIcon,
  Lock as LockedIcon
} from '@mui/icons-material';
import axios from 'axios';

// Create a separate API instance without auth headers
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

function AttendanceSuccessPage() {
  const { registerId, studentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('');
  const [registerClosed, setRegisterClosed] = useState(false);

  useEffect(() => {
    markAttendance();
  }, [registerId, studentId]);

  const markAttendance = async () => {
    if (!registerId || !studentId) {
      setError('Invalid attendance link. Please try again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await publicApi.get(`/attendance/mark/${registerId}/${studentId}`);
      
      // Extract student and class information
      const { attendance } = response.data;
      if (attendance && attendance.student) {
        setStudentName(`${attendance.student.firstName} ${attendance.student.lastName}`);
      }
      
      if (attendance && attendance.register) {
        setClassName(attendance.register.className);
      }
      
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Error marking attendance:', err);
      
      // Check if register is closed
      if (err.response?.data?.closed) {
        setRegisterClosed(true);
        setClassName(err.response?.data?.register?.className || 'this class');
        setError('This register is closed. Attendance cannot be marked.');
      } else {
        setError('Failed to mark attendance. Please try again or contact your instructor.');
      }
      
      setLoading(false);
    }
  };

  const handleBackToPublic = () => {
    navigate('/attendance-public');
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
        <Fade in={!loading}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2
            }}
          >
            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box>
                {registerClosed ? (
                  <>
                    <LockedIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                      Register Closed
                    </Typography>
                  </>
                ) : (
                  <Typography variant="h5" color="error" gutterBottom>
                    Error
                  </Typography>
                )}
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
                <Button 
                  variant="contained" 
                  onClick={handleBackToPublic}
                >
                  Back to Attendance Page
                </Button>
              </Box>
            ) : (
              <Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Attendance Marked Successfully!
                </Typography>
                <Typography variant="body1" paragraph>
                  Your attendance has been recorded for <strong>{className}</strong>.
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Student: {studentName}<br />
                  Date: {new Date().toLocaleDateString()}<br />
                  Time: {new Date().toLocaleTimeString()}
                </Typography>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleBackToPublic}
                  sx={{ mt: 4 }}
                >
                  Back to Attendance Page
                </Button>
              </Box>
            )}
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default AttendanceSuccessPage; 