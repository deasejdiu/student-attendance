import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Link,
  Divider,
} from "@mui/material";
import {
  MenuBook as RegistersIcon,
  School as StudentsIcon,
  AssignmentTurnedIn as AttendanceIcon,
  People as UsersIcon,
  QrCode as QrCodeIcon,
  Person as ProfileIcon,
  Dashboard as DashboardIcon,
  Download as ExportsIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.username || "User"}! What would you like to do
          today?
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Registers Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <RegistersIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Registers
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Create and manage class registers, track attendance, and view
                register history.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleNavigate("/registers")}>
                View Registers
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Students Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <StudentsIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Students
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage student information, view attendance records, and add new
                students.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleNavigate("/students")}>
                Manage Students
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Attendance Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AttendanceIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Attendance
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View and analyze attendance records, track student attendance
                patterns.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => handleNavigate("/attendance")}
              >
                View Attendance
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Exports Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ExportsIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Exports
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Access and download your exported attendance data in various
                formats.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleNavigate("/exports")}>
                View Exports
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Users Card - Only visible to admins */}
        {isAdmin() && (
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <UsersIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    Users
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Manage system users, add new teachers or administrators, and
                  control access.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleNavigate("/users")}>
                  Manage Users
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}

        {/* Profile Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ProfileIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Profile
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                View and update your profile information and account settings.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleNavigate("/profile")}>
                View Profile
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Public Attendance Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <QrCodeIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Public Attendance
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Access the public attendance page for students to mark their
                attendance.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                target="_blank"
                component={Link}
                href="/attendance-public"
              >
                Open Public Page
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {isAdmin() && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Admin Quick Stats
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            As an administrator, you have access to all system features and can
            manage users, registers, and students.
          </Typography>
        </Box>
      )}
    </>
  );
}

export default DashboardPage;
