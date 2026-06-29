import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import UploadMaterial from './pages/UploadMaterial'
import AdminPanel from './pages/AdminPanel'
import ExamPractice from './pages/ExamPractice'
import Summary from './pages/Summary'
import StudyTips from './pages/StudyTips'
import Books from './pages/Books'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import VerifyEmail from './pages/VerifyEmail'
import VerifyEmailLink from './pages/VerifyEmailLink'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import MaterialDetail from './pages/MaterialDetail'
import MyUploads from './pages/MyUploads'
import Bookmarks from './pages/Bookmarks'
import { useAuth } from './context/AuthContext.jsx'

// Admin Route component — outside App function!
function AdminRoute({ children }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email/:token" element={<VerifyEmailLink />} />
        <Route path="/forgot-password" element={<Navigate to="/reset-password" replace />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/material/:id" element={<MaterialDetail />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/exam-practice" element={
          <ProtectedRoute>
            <ExamPractice />
          </ProtectedRoute>
        } />
        <Route path="/summary" element={
          <ProtectedRoute>
            <Summary />
          </ProtectedRoute>
        } />
        <Route path="/study-tips" element={
          <ProtectedRoute>
            <StudyTips />
          </ProtectedRoute>
        } />
        <Route path="/books" element={
          <ProtectedRoute>
            <Books />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <UploadMaterial />
          </ProtectedRoute>
        } />
        <Route path="/my-uploads" element={
          <ProtectedRoute>
            <MyUploads />
          </ProtectedRoute>
        } />
        <Route path="/bookmarks" element={
          <ProtectedRoute>
            <Bookmarks />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App