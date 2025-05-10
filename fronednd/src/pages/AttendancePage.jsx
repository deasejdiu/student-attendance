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
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
} from "@mui/material";
import {
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  AccessTime as LateIcon,
  CalendarMonth as DateIcon,
  Schedule as TimeIcon,
  Class as ClassIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import apiService from "../utils/api";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

function AttendancePage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentLoading, setStudentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    percentage: 0,
  });

  // Export states
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportForm, setExportForm] = useState({
    format: "excel",
    startDate: null,
    endDate: null,
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentAttendance(selectedStudent);
    }
  }, [selectedStudent]);

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

  const fetchStudentAttendance = async (studentId) => {
    setStudentLoading(true);
    try {
      const response = await apiService.students.getById(studentId);

      // Assuming the response includes attendances with register details
      const attendances = response.data.attendances || [];

      // Sort by date (newest first)
      const sortedAttendances = [...attendances].sort((a, b) => {
        return new Date(b.register.date) - new Date(a.register.date);
      });

      setAttendanceRecords(sortedAttendances);

      // Calculate statistics
      const present = attendances.filter((a) => a.status === "present").length;
      const late = attendances.filter((a) => a.status === "late").length;
      const absent = attendances.filter((a) => a.status === "absent").length;
      const total = attendances.length;
      const percentage =
        total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      setStats({
        present,
        absent,
        late,
        total,
        percentage,
      });

      setStudentLoading(false);
    } catch (err) {
      console.error("Error fetching student attendance:", err);
      setError("Failed to load attendance records. Please try again.");
      setAttendanceRecords([]);
      setStudentLoading(false);
    }
  };

  const handleExportData = () => {
    setExportForm({
      format: "excel",
      startDate: null,
      endDate: null,
    });
    setExportError(null);
    setOpenExportDialog(true);
  };

  const handleExportSubmit = async () => {
    if (!selectedStudent) return;

    setExportLoading(true);
    setExportError(null);

    try {
      const payload = {
        studentId: selectedStudent,
        format: exportForm.format,
        startDate: exportForm.startDate
          ? dayjs(exportForm.startDate).format("YYYY-MM-DD")
          : null,
        endDate: exportForm.endDate
          ? dayjs(exportForm.endDate).format("YYYY-MM-DD")
          : null,
      };

      const response = await apiService.exports.create(payload);

      setExportSuccess(true);
      setOpenExportDialog(false);
      console.log("Export job created:", response.data);
    } catch (err) {
      console.error("Error creating export:", err);
      setExportError("Failed to create export. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportFormChange = (field, value) => {
    setExportForm({
      ...exportForm,
      [field]: value,
    });
  };

  const handleCloseSnackbar = () => {
    setExportSuccess(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <PresentIcon sx={{ color: "success.main" }} />;
      case "absent":
        return <AbsentIcon sx={{ color: "error.main" }} />;
      case "late":
        return <LateIcon sx={{ color: "warning.main" }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "success";
      case "absent":
        return "error";
      case "late":
        return "warning";
      default:
        return "default";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    // If timeString is already in HH:MM format, return it
    if (timeString.length <= 5) return timeString;

    // If it's a full ISO date string, format it
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return timeString;
    }
  };

  const handleStudentChange = (event) => {
    setSelectedStudent(event.target.value);
  };

  if (loading) {
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

  const selectedStudentData = students.find((s) => s.id === selectedStudent);

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
          Attendance Records
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="student-select-label">Select Student</InputLabel>
          <Select
            labelId="student-select-label"
            id="student-select"
            value={selectedStudent}
            label="Select Student"
            onChange={handleStudentChange}
          >
            {students.map((student) => (
              <MenuItem key={student.id} value={student.id}>
                {student.firstName} {student.lastName} ({student.studentId})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedStudent && (
        <>
          {studentLoading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Student Info and Stats */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Student Info Card */}
                <Grid item xs={12} md={6}>
                  <Card elevation={3} sx={{ height: "100%", borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Student Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body1">
                        <strong>Name:</strong> {selectedStudentData?.firstName}{" "}
                        {selectedStudentData?.lastName}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Student ID:</strong>{" "}
                        {selectedStudentData?.studentId}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Email:</strong> {selectedStudentData?.email}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Attendance Stats Card */}
                <Grid item xs={12} md={6}>
                  <Card elevation={3} sx={{ height: "100%", borderRadius: 2 }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6">
                          Attendance Statistics
                        </Typography>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={handleExportData}
                          disabled={!attendanceRecords.length}
                        >
                          Export Data
                        </Button>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body1">
                          <strong>Present:</strong> {stats.present}
                        </Typography>
                        <Chip
                          icon={<PresentIcon />}
                          label={`${
                            Math.round((stats.present / stats.total) * 100) || 0
                          }%`}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body1">
                          <strong>Late:</strong> {stats.late}
                        </Typography>
                        <Chip
                          icon={<LateIcon />}
                          label={`${
                            Math.round((stats.late / stats.total) * 100) || 0
                          }%`}
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body1">
                          <strong>Absent:</strong> {stats.absent}
                        </Typography>
                        <Chip
                          icon={<AbsentIcon />}
                          label={`${
                            Math.round((stats.absent / stats.total) * 100) || 0
                          }%`}
                          color="error"
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body1">
                          <strong>Overall Attendance:</strong>
                        </Typography>
                        <Chip
                          label={`${stats.percentage}%`}
                          color={
                            stats.percentage >= 75
                              ? "success"
                              : stats.percentage >= 50
                              ? "warning"
                              : "error"
                          }
                          variant="filled"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Attendance Records Table */}
              {attendanceRecords.length > 0 ? (
                <TableContainer
                  component={Paper}
                  elevation={3}
                  sx={{ borderRadius: 2, overflow: "hidden" }}
                >
                  <Table>
                    <TableHead sx={{ bgcolor: "primary.main" }}>
                      <TableRow>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Class
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Date
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Time
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          Check-in Time
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceRecords.map((record) => (
                        <TableRow key={record.id} hover>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <ClassIcon color="primary" fontSize="small" />
                              {record.register.className}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <DateIcon color="primary" fontSize="small" />
                              {new Date(
                                record.register.date
                              ).toLocaleDateString()}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <TimeIcon color="primary" fontSize="small" />
                              {record.register.startTime} -{" "}
                              {record.register.endTime}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(record.status)}
                              label={record.status}
                              color={getStatusColor(record.status)}
                              variant="outlined"
                              sx={{ textTransform: "capitalize" }}
                            />
                          </TableCell>
                          <TableCell>
                            {record.checkInTime ? (
                              new Date(record.checkInTime).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Not checked in
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No attendance records found for this student.
                </Alert>
              )}
            </>
          )}
        </>
      )}

      {!selectedStudent && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            Please select a student to view their attendance records.
          </Typography>
        </Box>
      )}

      {/* Export Data Dialog */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dialog
          open={openExportDialog}
          onClose={() => setOpenExportDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Export Attendance Data</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Export attendance data for {selectedStudentData?.firstName}{" "}
              {selectedStudentData?.lastName}.
            </DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="export-format-label">
                    Export Format
                  </InputLabel>
                  <Select
                    labelId="export-format-label"
                    value={exportForm.format}
                    label="Export Format"
                    onChange={(e) =>
                      handleExportFormChange("format", e.target.value)
                    }
                  >
                    <MenuItem value="excel">Excel</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Start Date"
                  value={exportForm.startDate}
                  onChange={(date) => handleExportFormChange("startDate", date)}
                  slotProps={{
                    textField: { fullWidth: true, margin: "normal" },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="End Date"
                  value={exportForm.endDate}
                  onChange={(date) => handleExportFormChange("endDate", date)}
                  slotProps={{
                    textField: { fullWidth: true, margin: "normal" },
                  }}
                  minDate={exportForm.startDate}
                />
              </Grid>
            </Grid>
            {exportError && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="error">{exportError}</Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenExportDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleExportSubmit}
              disabled={exportLoading}
              startIcon={
                exportLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <DownloadIcon />
                )
              }
            >
              {exportLoading ? "Processing" : "Export Data"}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      {/* Success Snackbar */}
      <Snackbar
        open={exportSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          Export request submitted successfully! Check the exports page to
          download when ready.
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AttendancePage;
