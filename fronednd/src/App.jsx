import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import RegistersPage from './pages/RegistersPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import StudentsPage from './pages/StudentsPage'
import AttendancePage from './pages/AttendancePage'
import PublicAttendancePage from './pages/PublicAttendancePage'
import AttendanceSuccessPage from './pages/AttendanceSuccessPage'
import UsersPage from './pages/UsersPage'
import { AuthProvider } from './contexts/AuthContext'
import ExportsPage from './pages/ExportsPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/attendance-public" element={<PublicAttendancePage />} />
          <Route path="/attendance-success/:registerId/:studentId" element={<AttendanceSuccessPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/registers" element={<RegistersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/attendance" element={<AttendancePage />} /> 
              <Route path="/users" element={<UsersPage />} />
              <Route path="/exports" element={<ExportsPage />} />
            </Route>
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
