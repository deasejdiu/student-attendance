import { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import apiService from "../utils/api";

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form states
  const [studentForm, setStudentForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
  });

  useEffect(() => {
    fetchStudents();
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
    if (query.trim() === "") {
      fetchStudents();
    } else {
      searchStudents(query);
    }
  }, 500);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await apiService.students.getAll();
      setStudents(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load students. Please try again later.");
      setLoading(false);
    }
  };

  const searchStudents = async (query) => {
    setSearchLoading(true);
    try {
      const response = await apiService.students.search(query);
      setStudents(response.data);
      setSearchLoading(false);
    } catch (err) {
      console.error("Error searching students:", err);
      setError("Failed to search students. Please try again.");
      setSearchLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    // Reset form before opening add dialog
    resetStudentForm();
    setOpenAddDialog(true);
  };

  const handleAddStudent = async () => {
    try {
      const response = await apiService.students.create(studentForm);
      setStudents([...students, response.data]);
      setOpenAddDialog(false);
      resetStudentForm();
    } catch (err) {
      console.error("Error creating student:", err);
      setError("Failed to create student. Please try again.");
    }
  };

  const handleEditStudent = async () => {
    if (!selectedStudent) return;

    try {
      const response = await apiService.students.update(
        selectedStudent.id,
        studentForm
      );
      setStudents(
        students.map((s) => (s.id === selectedStudent.id ? response.data : s))
      );
      setOpenEditDialog(false);
      resetStudentForm();
    } catch (err) {
      console.error("Error updating student:", err);
      setError("Failed to update student. Please try again.");
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      await apiService.students.delete(selectedStudent.id);
      setStudents(students.filter((s) => s.id !== selectedStudent.id));
      setOpenDeleteDialog(false);
      setSelectedStudent(null);
    } catch (err) {
      console.error("Error deleting student:", err);
      setError("Failed to delete student. Please try again.");
    }
  };

  const resetStudentForm = () => {
    setStudentForm({
      firstName: "",
      lastName: "",
      email: "",
      studentId: "",
    });
  };

  const handleInputChange = (field, value) => {
    setStudentForm({
      ...studentForm,
      [field]: value,
    });
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setStudentForm({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      studentId: student.studentId,
    });
    setOpenEditDialog(true);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    resetStudentForm();
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    resetStudentForm();
  };

  if (loading && !searchLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Students
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Student
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, email, or student ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searchLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  searchTerm && (
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon />
                    </IconButton>
                  )
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                First Name
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Last Name
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Email
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Student ID
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm
                      ? "No students match your search criteria."
                      : "No students found. Add a new student to get started."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>{student.firstName}</TableCell>
                  <TableCell>{student.lastName}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit Student">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleEditClick(student)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Student">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => {
                            setSelectedStudent(student);
                            setOpenDeleteDialog(true);
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

      {/* Add Student Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={studentForm.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              value={studentForm.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={studentForm.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Student ID"
              value={studentForm.studentId}
              onChange={(e) => handleInputChange("studentId", e.target.value)}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddStudent}
            disabled={
              !studentForm.firstName ||
              !studentForm.lastName ||
              !studentForm.email ||
              !studentForm.studentId
            }
          >
            Add Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={studentForm.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              value={studentForm.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={studentForm.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Student ID"
              value={studentForm.studentId}
              onChange={(e) => handleInputChange("studentId", e.target.value)}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditStudent}
            disabled={
              !studentForm.firstName ||
              !studentForm.lastName ||
              !studentForm.email ||
              !studentForm.studentId
            }
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Student Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Student</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedStudent?.firstName}{" "}
            {selectedStudent?.lastName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteStudent}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default StudentsPage;
