import { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Box,
  Tooltip,
  Stack,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import apiService from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'teacher'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounce function for search
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Debounced search function
  const debouncedSearch = debounce((query) => {
    if (query.trim() === '') {
      fetchUsers();
    } else {
      searchUsers(query);
    }
  }, 500);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.users.getAll();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    try {
      setSearchLoading(true);
      const response = await apiService.users.search(query);
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchUsers();
  };

  const handleOpenAddDialog = () => {
    console.log('Opening add user dialog');
    setUserForm({
      username: '',
      email: '',
      password: '',
      role: 'teacher'
    });
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    console.log('Closing add user dialog');
    setOpenAddDialog(false);
    setError(null);
  };

  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      password: '', // Empty password field for edit
      role: user.role
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedUser(null);
    setError(null);
  };

  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleInputChange = (field, value) => {
    console.log(`handleInputChange called with field: ${field}, value:`, value);
    setUserForm(prevForm => {
      const newForm = {
        ...prevForm,
        [field]: value
      };
      console.log('New form state:', newForm);
      return newForm;
    });
  };

  const handleAddUser = async () => {
    try {
      console.log('Starting handleAddUser...');
      console.log('Form data:', userForm);

      // Validate required fields
      if (!userForm.username || !userForm.email || !userForm.password) {
        console.log('Validation failed: Missing required fields');
        setError('All fields are required');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userForm.email)) {
        console.log('Validation failed: Invalid email format');
        setError('Invalid email format');
        return;
      }

      setError(null); // clear previous errors
      setSuccess(null);
      setLoading(true);

      console.log('Making API request to register user...');
      const response = await apiService.users.register(userForm);
      console.log('API response:', response.data);

      // Add the new user to the list
      const newUser = response.data;
      setUsers(prevUsers => [...prevUsers, newUser]);
      setSuccess('User added successfully');
      setLoading(false);

      // Close dialog and reset form immediately
      setOpenAddDialog(false);
      setUserForm({
        username: '',
        email: '',
        password: '',
        role: 'teacher'
      });
      setError(null);
      console.log('Dialog closed and form reset');

    } catch (error) {
      setLoading(false);
      console.error('Error adding user:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.message || 'Failed to add user');
    }
  };

  const handleDialogClose = () => {
    setOpenAddDialog(false);
    setUserForm({
      username: '',
      email: '',
      password: '',
      role: 'teacher'
    });
    setError(null);
    setSuccess(null);
  };

  const handleEditUser = async () => {
    if (!selectedUser) {
      console.log('No user selected for editing');
      return;
    }
    
    try {
      console.log('Editing user:', selectedUser);
      console.log('Form state:', userForm);
      
      // Only include password if it was changed
      const updateData = {
        username: userForm.username,
        email: userForm.email,
        role: userForm.role
      };
      
      if (userForm.password) {
        updateData.password = userForm.password;
      }
      
      console.log('Sending update data:', updateData);
      const response = await apiService.users.update(selectedUser.id, updateData);
      console.log('Update response:', response);
      
      // Update the users list
      setUsers(users.map(u => u.id === selectedUser.id ? response.data : u));
      setSuccess('User updated successfully');
      handleCloseEditDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating user:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update user. Please try again.');
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) {
      console.log('No user selected for deletion');
      return;
    }
    
    try {
      console.log('Deleting user:', selectedUser);
      await apiService.users.delete(selectedUser.id);
      console.log('User deleted successfully');
      
      // Remove the deleted user from the list
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setSuccess('User deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedUser(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setOpenDeleteDialog(false);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  // Check if current user is admin
  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Users Management
        </Typography>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Add User
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search users by username, email, or role"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created</TableCell>
                {isAdmin && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                        color={user.role === 'admin' ? 'primary' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleOpenEditDialog(user)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {/* Don't allow deleting yourself */}
                          {currentUser.id !== user.id && (
                            <Tooltip title="Delete">
                              <IconButton onClick={() => handleOpenDeleteDialog(user)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add User Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={handleDialogClose}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="username"
            label="Username"
            type="text"
            fullWidth
            value={userForm.username}
            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            id="email"
            label="Email"
            type="email"
            fullWidth
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            required
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              value={userForm.role}
              label="Role"
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              required
            >
              <MenuItem value="admin">Admin</MenuItem>
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddUser();
        }}>
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="username"
              label="Username"
              type="text"
              fullWidth
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              id="email"
              label="Email"
              type="email"
              fullWidth
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              id="password"
              label="Password"
              type="password"
              fullWidth
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                value={userForm.role}
                label="Role"
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                required
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add User
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              autoComplete="new-username"
              value={userForm.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              autoComplete="new-email"
              value={userForm.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="New Password (leave blank to keep current)"
              name="password"
              type="password"
              autoComplete="new-password"
              value={userForm.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={userForm.role}
                label="Role"
                onChange={(e) => handleInputChange('role', e.target.value)}
              >
                <MenuItem value="teacher">Teacher</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleEditUser}
            disabled={!userForm.username || !userForm.email || !userForm.role}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user "{selectedUser?.username}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default UsersPage; 