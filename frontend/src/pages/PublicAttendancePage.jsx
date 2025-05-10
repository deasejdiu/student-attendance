import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

// Create a separate API instance without auth headers
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

function PublicAttendancePage() {
  const [registers, setRegisters] = useState([]);
  const [selectedRegister, setSelectedRegister] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchTodayRegisters();
  }, []);

  useEffect(() => {
    if (selectedRegister) {
      // Extract students from the selected register's attendances
      const register = registers.find(r => r.id === selectedRegister);
      if (register && register.students) {
        setStudents(register.students);
      } else {
        setStudents([]);
      }
    } else {
      setStudents([]);
    }
    setSelectedStudent('');
    setQrCodeUrl('');
  }, [selectedRegister, registers]);

  useEffect(() => {
    if (selectedStudent && selectedRegister) {
      generateQrCode(selectedRegister, selectedStudent);
    } else {
      setQrCodeUrl('');
    }
  }, [selectedStudent, selectedRegister]);

  const fetchTodayRegisters = async () => {
    setLoading(true);
    try {
      const response = await publicApi.get('/public/registers/today');
      setRegisters(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching registers:', err);
      setError('Failed to load today\'s registers. Please try again later.');
      setLoading(false);
    }
  };

  const generateQrCode = async (registerId, studentId) => {
    try {
      // Get the base URL from the environment or use a default
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      
      // Create the URL for the success page (frontend route)
      const successUrl = `${baseUrl}/attendance-success/${registerId}/${studentId}`;
      
      // Set the QR code URL to the success page URL
      setQrCodeUrl(successUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code. Please try again.');
    }
  };

  const handleRegisterChange = (event) => {
    setSelectedRegister(event.target.value);
  };

  const handleStudentChange = (event) => {
    setSelectedStudent(event.target.value);
  };

  const handleMarkAttendance = async () => {
    if (!selectedRegister || !selectedStudent) return;
    
    try {
      setLoading(true);
      const response = await publicApi.get(`/attendance/mark/${selectedRegister}/${selectedStudent}`);
      setSuccess(`Attendance marked successfully for ${students.find(s => s.id === selectedStudent)?.firstName} ${students.find(s => s.id === selectedStudent)?.lastName}`);
      setLoading(false);
      
      // Refresh the registers data after marking attendance
      setTimeout(() => {
        fetchTodayRegisters();
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Failed to mark attendance. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: 4
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Class Attendance
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Select your class and scan the QR code to mark your attendance
          </Typography>
        </Box>

        {loading && !selectedRegister && !selectedStudent ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : success ? (
          <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>
        ) : null}

        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="register-select-label">Select Class</InputLabel>
                <Select
                  labelId="register-select-label"
                  id="register-select"
                  value={selectedRegister}
                  label="Select Class"
                  onChange={handleRegisterChange}
                  disabled={loading}
                >
                  <MenuItem value="">
                    <em>Select a class</em>
                  </MenuItem>
                  {registers.map((register) => (
                    <MenuItem key={register.id} value={register.id}>
                      {register.className} ({new Date(register.date).toLocaleDateString()} {register.startTime.substring(0, 5)}-{register.endTime.substring(0, 5)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!selectedRegister || loading}>
                <InputLabel id="student-select-label">Select Student</InputLabel>
                <Select
                  labelId="student-select-label"
                  id="student-select"
                  value={selectedStudent}
                  label="Select Student"
                  onChange={handleStudentChange}
                >
                  <MenuItem value="">
                    <em>Select a student</em>
                  </MenuItem>
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.studentId})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {qrCodeUrl && (
          <Card sx={{ mb: 4, p: 2, textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scan this QR code to mark your attendance
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <QRCodeSVG value={qrCodeUrl} size={200} />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Or click the button below
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleMarkAttendance}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                Mark Attendance
              </Button>
            </CardContent>
          </Card>
        )}

        {registers.length === 0 && !loading && (
          <Alert severity="info">
            No classes scheduled for today.
          </Alert>
        )}
      </Container>
    </Box>
  );
}

export default PublicAttendancePage; 