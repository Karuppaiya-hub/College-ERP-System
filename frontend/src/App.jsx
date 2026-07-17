import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Faculty from './pages/Faculty'
import Courses from './pages/Courses'
import Attendance from './pages/Attendance'
import Exams from './pages/Exams'
import Fees from './pages/Fees'
import Library from './pages/Library'
import Hostel from './pages/Hostel'
import Transport from './pages/Transport'
import Laboratory from './pages/Laboratory'
import Cafeteria from './pages/Cafeteria'
import Placement from './pages/Placement'
import Sports from './pages/Sports'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 18, color: '#6b7280' }}>
      Loading...
    </div>
  )
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
      <Route path="/faculty" element={<PrivateRoute><Faculty /></PrivateRoute>} />
      <Route path="/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
      <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
      <Route path="/exams" element={<PrivateRoute><Exams /></PrivateRoute>} />
      <Route path="/fees" element={<PrivateRoute><Fees /></PrivateRoute>} />
      <Route path="/library" element={<PrivateRoute><Library /></PrivateRoute>} />
      <Route path="/hostel" element={<PrivateRoute><Hostel /></PrivateRoute>} />
      <Route path="/transport" element={<PrivateRoute><Transport /></PrivateRoute>} />
      <Route path="/laboratory" element={<PrivateRoute><Laboratory /></PrivateRoute>} />
      <Route path="/cafeteria" element={<PrivateRoute><Cafeteria /></PrivateRoute>} />
      <Route path="/placement" element={<PrivateRoute><Placement /></PrivateRoute>} />
      <Route path="/sports" element={<PrivateRoute><Sports /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
