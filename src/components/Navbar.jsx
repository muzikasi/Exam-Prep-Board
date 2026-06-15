import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

function Navbar() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" className="navbar-logo">ExamBoard</Link>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard" className="navbar-link">Browse</Link>

        {token ? (
          <>
            <Link to="/upload" className="navbar-link">My Uploads</Link>
            <Link to="/dashboard" className="navbar-link">Bookmarks</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="navbar-link">Admin</Link>
            )}
            <button onClick={handleLogout} className="navbar-btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-btn">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar