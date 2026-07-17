import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import StudentDashboard from './pages/StudentDashboard'
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

function PrivateRoute({ children, allowRoles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
      <div className="loading" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to={user.role === 'student' ? '/student' : '/'} replace />
  }
  return children
}

function AdminRoute({ children }) {
  return (
    <PrivateRoute allowRoles={['admin', 'faculty']}>
      <Layout>{children}</Layout>
    </PrivateRoute>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  const loginRedirect = user
    ? (user.role === 'student' ? '/student' : '/')
    : null

  return (
    <Routes>
      <Route path="/login" element={loginRedirect ? <Navigate to={loginRedirect} replace /> : <Login />} />

      {/* Student portal */}
      <Route path="/student" element={
        <PrivateRoute allowRoles={['student']}>
          <StudentDashboard />
        </PrivateRoute>
      } />

      {/* Admin / Faculty routes */}
      <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/students" element={<AdminRoute><Students /></AdminRoute>} />
      <Route path="/faculty" element={<AdminRoute><Faculty /></AdminRoute>} />
      <Route path="/courses" element={<AdminRoute><Courses /></AdminRoute>} />
      <Route path="/attendance" element={<AdminRoute><Attendance /></AdminRoute>} />
      <Route path="/exams" element={<AdminRoute><Exams /></AdminRoute>} />
      <Route path="/fees" element={<AdminRoute><Fees /></AdminRoute>} />
      <Route path="/library" element={<AdminRoute><Library /></AdminRoute>} />
      <Route path="/hostel" element={<AdminRoute><Hostel /></AdminRoute>} />
      <Route path="/transport" element={<AdminRoute><Transport /></AdminRoute>} />
      <Route path="/laboratory" element={<AdminRoute><Laboratory /></AdminRoute>} />
      <Route path="/cafeteria" element={<AdminRoute><Cafeteria /></AdminRoute>} />
      <Route path="/placement" element={<AdminRoute><Placement /></AdminRoute>} />
      <Route path="/sports" element={<AdminRoute><Sports /></AdminRoute>} />
      <Route path="*" element={<Navigate to={user?.role === 'student' ? '/student' : '/'} replace />} />
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
