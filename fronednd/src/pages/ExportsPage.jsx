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
  Button,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  Divider,
  Snackbar,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  CheckCircle as CompleteIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import apiService from "../utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

function ExportsPage() {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchExports();
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchExports(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchExports = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    if (isBackground) setRefreshing(true);

    try {
      const response = await apiService.exports.getAll();

      // Extract the jobs array from the response
      const jobsData = response.data.jobs || [];

      // Sort by createdAt, newest first
      const sortedExports = jobsData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setExports(sortedExports);
      setError(null);
    } catch (err) {
      console.error("Error fetching exports:", err);
      if (!isBackground) {
        setError("Failed to load exports. Please try again later.");
      }
    } finally {
      if (!isBackground) setLoading(false);
      if (isBackground) setRefreshing(false);
    }
  };

  const handleDownload = async (downloadUrl, studentId) => {
    try {
      await apiService.exports.download(downloadUrl, studentId);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error downloading export:", error);
    }
  };

  const refreshExports = () => {
    fetchExports(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getStatusChip = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <Chip
            icon={<CompleteIcon />}
            label="Completed"
            color="success"
            variant="outlined"
          />
        );
      case "failed":
        return (
          <Chip
            icon={<ErrorIcon />}
            label="Failed"
            color="error"
            variant="outlined"
          />
        );
      case "processing":
        return (
          <Chip
            icon={<CircularProgress size={16} />}
            label="Processing"
            color="primary"
            variant="outlined"
          />
        );
      case "pending":
      default:
        return (
          <Chip
            icon={<PendingIcon />}
            label="Pending"
            color="warning"
            variant="outlined"
          />
        );
    }
  };

  const getFormatLabel = (format) => {
    switch (format.toLowerCase()) {
      case "excel":
        return "Excel (.xlsx)";
      case "csv":
        return "CSV (.csv)";
      case "pdf":
        return "PDF (.pdf)";
      case "json":
        return "JSON (.json)";
      default:
        return format.toUpperCase();
    }
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
          Exports
        </Typography>
        <Tooltip title="Refresh exports">
          <IconButton onClick={refreshExports} disabled={refreshing}>
            {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {exports.length === 0 ? (
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <HistoryIcon
              color="disabled"
              sx={{ fontSize: 60, opacity: 0.3, mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Export History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You haven't created any exports yet. Go to Student Attendance page
              to export attendance data.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "primary.main" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Format
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Created
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exports.map((exportItem) => (
                <TableRow key={exportItem.jobId} hover>
                  <TableCell>{getFormatLabel(exportItem.format)}</TableCell>
                  <TableCell>
                    <Tooltip
                      title={dayjs(exportItem.createdAt).format(
                        "MMM D, YYYY h:mm A"
                      )}
                    >
                      <Typography>
                        {dayjs(exportItem.createdAt).fromNow()}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{getStatusChip(exportItem.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() =>
                        handleDownload(
                          exportItem.downloadUrl,
                          exportItem.studentId
                        )
                      }
                      disabled={exportItem.status.toLowerCase() !== "completed"}
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Auto-refresh notice */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Exports refresh automatically every 30 seconds
        </Typography>
      </Box>

      {/* Snackbar for download notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Download started"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Container>
  );
}

export default ExportsPage;
