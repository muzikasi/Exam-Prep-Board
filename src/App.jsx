import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import UploadMaterial from './pages/UploadMaterial'
import AdminPanel from './pages/AdminPanel'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import VerifyEmail from './pages/VerifyEmail'
import Profile from './pages/Profile'
import MaterialDetail from './pages/MaterialDetail'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <UploadMaterial />
          </ProtectedRoute>
        } />
        <Route path="/material/:id" element={<MaterialDetail />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        } />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App