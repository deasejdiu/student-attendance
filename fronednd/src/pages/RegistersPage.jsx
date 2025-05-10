import { useState, useEffect } from 'react'
import { 
  Container, 
  Typography, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Tooltip,
  Stack,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  DialogContentText
} from '@mui/material'
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon
} from '@mui/icons-material'
import apiService from '../utils/api'

// Style for the multi-select
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function RegistersPage() {
  const [registers, setRegisters] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedRegister, setSelectedRegister] = useState(null)
  
  // Form states
  const [newRegister, setNewRegister] = useState({
    className: '',
    date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
    startTime: '09:00',
    endTime: '10:00',
    studentIds: []
  })

  useEffect(() => {
    Promise.all([fetchRegisters(), fetchStudents()])
      .then(() => setLoading(false))
      .catch(err => {
        console.error('Error initializing page:', err)
        setError('Failed to load data. Please try again later.')
        setLoading(false)
      })
  }, [])

  // Add a sortRegisters function to sort registers by date and time
  const sortRegisters = (regs) => {
    return [...regs].sort((a, b) => {
      // First compare by date
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime(); // Newest first
      }
      
      // If same date, compare by start time
      return a.startTime.localeCompare(b.startTime);
    });
  };

  // Update fetchRegisters to sort the registers
  const fetchRegisters = async () => {
    try {
      const response = await apiService.registers.getAll();
      const sortedRegisters = sortRegisters(response.data);
      setRegisters(sortedRegisters);
      return response.data;
    } catch (err) {
      console.error('Error fetching registers:', err);
      throw err;
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await apiService.students.getAll()
      setStudents(response.data)
      return response.data
    } catch (err) {
      console.error('Error fetching students:', err)
      throw err
    }
  }

  // Update handleToggleStatus to sort registers after updating
  const handleToggleStatus = async (register) => {
    try {
      const newStatus = register.status === 'active' ? 'closed' : 'active';
      await apiService.registers.update(register.id, {
        ...register,
        status: newStatus
      });
      
      // Update local state with sorted registers
      const updatedRegisters = registers.map(r => 
        r.id === register.id ? { ...r, status: newStatus } : r
      );
      setRegisters(sortRegisters(updatedRegisters));
    } catch (err) {
      console.error('Error updating register status:', err);
      setError('Failed to update register status. Please try again.');
    }
  };

  // Update handleAddRegister to sort registers after adding
  const handleAddRegister = async () => {
    try {
      // Format the data for the API
      const formattedRegister = {
        className: newRegister.className,
        date: newRegister.date,
        startTime: `${newRegister.startTime}:00`, // Add seconds
        endTime: `${newRegister.endTime}:00`,     // Add seconds
        studentIds: newRegister.studentIds
      };
      
      const response = await apiService.registers.create(formattedRegister);
      const updatedRegisters = [...registers, response.data];
      setRegisters(sortRegisters(updatedRegisters));
      setOpenAddDialog(false);
      resetNewRegister();
    } catch (err) {
      console.error('Error creating register:', err);
      setError('Failed to create register. Please try again.');
    }
  };

  // Update handleEditRegister to sort registers after editing
  const handleEditRegister = async () => {
    if (!selectedRegister) return;
    
    try {
      // Format the data for the API
      const formattedRegister = {
        className: newRegister.className,
        date: newRegister.date,
        startTime: `${newRegister.startTime}:00`, // Add seconds
        endTime: `${newRegister.endTime}:00`,     // Add seconds
        studentIds: newRegister.studentIds
      };
      
      const response = await apiService.registers.update(selectedRegister.id, formattedRegister);
      
      // Update local state with sorted registers
      const updatedRegisters = registers.map(r => 
        r.id === selectedRegister.id ? response.data : r
      );
      setRegisters(sortRegisters(updatedRegisters));
      
      setOpenEditDialog(false);
      resetNewRegister();
    } catch (err) {
      console.error('Error updating register:', err);
      setError('Failed to update register. Please try again.');
    }
  };

  const handleDeleteRegister = async () => {
    if (!selectedRegister) return
    
    try {
      await apiService.registers.delete(selectedRegister.id)
      setRegisters(registers.filter(r => r.id !== selectedRegister.id))
      setOpenDeleteDialog(false)
      setSelectedRegister(null)
    } catch (err) {
      console.error('Error deleting register:', err)
      setError('Failed to delete register. Please try again.')
    }
  }

  const resetNewRegister = () => {
    setNewRegister({
      className: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      studentIds: []
    })
  }

  const handleInputChange = (field, value) => {
    setNewRegister({
      ...newRegister,
      [field]: value
    })
  }

  const handleOpenEditDialog = (register) => {
    setSelectedRegister(register)
    
    // Format times to remove seconds
    const startTime = register.startTime.substring(0, 5)
    const endTime = register.endTime.substring(0, 5)
    
    setNewRegister({
      className: register.className,
      date: register.date,
      startTime,
      endTime,
      studentIds: register.students ? register.students.map(s => s.id) : []
    })
    
    setOpenEditDialog(true)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Class Registers
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
          sx={{ borderRadius: 2 }}
        >
          New Register
        </Button>
      </Box>
      
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Class Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Start Time</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>End Time</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Students</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No registers found. Create a new one to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              registers.map((register) => (
                <TableRow key={register.id}>
                  <TableCell>{register.className}</TableCell>
                  <TableCell>{new Date(register.date).toLocaleDateString()}</TableCell>
                  <TableCell>{register.startTime.substring(0, 5)}</TableCell>
                  <TableCell>{register.endTime.substring(0, 5)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${register.students ? register.students.length : 0} students`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={register.status} 
                      color={register.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title={register.status === 'active' ? 'Close Register' : 'Reopen Register'}>
                        <IconButton 
                          size="small" 
                          color={register.status === 'active' ? 'success' : 'default'}
                          onClick={() => handleToggleStatus(register)}
                        >
                          {register.status === 'active' ? <CheckIcon /> : <CloseIcon />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Edit Register">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenEditDialog(register)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete Register">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => {
                            setSelectedRegister(register)
                            setOpenDeleteDialog(true)
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add Register Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Register</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Class Name"
              value={newRegister.className}
              onChange={(e) => handleInputChange('className', e.target.value)}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={newRegister.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={newRegister.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={newRegister.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="students-select-label">Assign Students</InputLabel>
              <Select
                labelId="students-select-label"
                id="students-select"
                multiple
                value={newRegister.studentIds}
                onChange={(e) => handleInputChange('studentIds', e.target.value)}
                input={<OutlinedInput label="Assign Students" />}
                renderValue={(selected) => {
                  const selectedStudents = students.filter(s => selected.includes(s.id));
                  return `${selectedStudents.length} students selected`;
                }}
                MenuProps={MenuProps}
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    <Checkbox checked={newRegister.studentIds.indexOf(student.id) > -1} />
                    <ListItemText primary={`${student.firstName} ${student.lastName} (${student.studentId})`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddRegister}
            disabled={!newRegister.className || !newRegister.date || !newRegister.startTime || !newRegister.endTime}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Register Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Register</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Class Name"
              value={newRegister.className}
              onChange={(e) => handleInputChange('className', e.target.value)}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={newRegister.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={newRegister.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={newRegister.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="edit-students-select-label">Assign Students</InputLabel>
              <Select
                labelId="edit-students-select-label"
                id="edit-students-select"
                multiple
                value={newRegister.studentIds}
                onChange={(e) => handleInputChange('studentIds', e.target.value)}
                input={<OutlinedInput label="Assign Students" />}
                renderValue={(selected) => {
                  const selectedStudents = students.filter(s => selected.includes(s.id));
                  return `${selectedStudents.length} students selected`;
                }}
                MenuProps={MenuProps}
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    <Checkbox checked={newRegister.studentIds.indexOf(student.id) > -1} />
                    <ListItemText primary={`${student.firstName} ${student.lastName} (${student.studentId})`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleEditRegister}
            disabled={!newRegister.className || !newRegister.date || !newRegister.startTime || !newRegister.endTime}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Register Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Register</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the register for "{selectedRegister?.className}" on {selectedRegister ? new Date(selectedRegister.date).toLocaleDateString() : ''}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteRegister}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default RegistersPage 