import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

function Navbar() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNav = (e, to) => {
    e.preventDefault()
    if (location.pathname.startsWith('/exam-practice')) {
      navigate(to)
      return
    }
    window.location.href = to
  }

  // Get first name only
  const firstName = user?.firstName || user?.name?.split(' ')[0] || ''

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <a href="/" onClick={(e) => handleNav(e, '/')} className="navbar-logo">ExamBoard</a>
      </div>
      <div className="navbar-links">
        <a href="/" onClick={(e) => handleNav(e, '/')} className="navbar-link">Home</a>
        <a href="/dashboard" onClick={(e) => handleNav(e, '/dashboard')} className="navbar-link">Browse</a>
        <a href="/exam-practice" onClick={(e) => handleNav(e, '/exam-practice')} className="navbar-link">Exam Practice</a>
        <a href="/books" onClick={(e) => handleNav(e, '/books')} className="navbar-link">Books</a>
        <a href="/summary" onClick={(e) => handleNav(e, '/summary')} className="navbar-link">Summary</a>
        <a href="/study-tips" onClick={(e) => handleNav(e, '/study-tips')} className="navbar-link">Study Tips</a>

        {token ? (
          <>
            <a href="/my-uploads" onClick={(e) => handleNav(e, '/my-uploads')} className="navbar-link">My Uploads</a>
            <a href="/bookmarks" onClick={(e) => handleNav(e, '/bookmarks')} className="navbar-link">Bookmarks</a>
            <a href="/upload" onClick={(e) => handleNav(e, '/upload')} className="navbar-link">Upload Materials</a>
            {user?.role === 'admin' && (
              <a href="/admin" onClick={(e) => handleNav(e, '/admin')} className="navbar-link">Admin</a>
            )}
            <a href="/profile" onClick={(e) => handleNav(e, '/profile')} className="navbar-link navbar-username">
              👤 {firstName}
            </a>
            <button onClick={handleLogout} className="navbar-btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/login" onClick={(e) => handleNav(e, '/login')} className="navbar-link">Login</a>
            <a href="/register" onClick={(e) => handleNav(e, '/register')} className="navbar-btn">Register</a>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar