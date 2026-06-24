import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import '../styles/Profile.css'

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="profile-container">
      <div className="profile-card">

        {/* Avatar */}
        <div className="profile-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        {/* User Info */}
        <h2 className="profile-name">{user?.name}</h2>
        <p className="profile-email">{user?.email}</p>
        <span className="profile-role">{user?.role}</span>

        {/* Divider */}
        <div className="profile-divider" />

        {/* Stats */}
        <div className="profile-stats">
          <div className="profile-stat">
            <p className="stat-number">0</p>
            <p className="stat-label">Uploads</p>
          </div>
          <div className="profile-stat">
            <p className="stat-number">0</p>
            <p className="stat-label">Bookmarks</p>
          </div>
          <div className="profile-stat">
            <p className="stat-number">0</p>
            <p className="stat-label">Upvotes</p>
          </div>
        </div>

        <div className="profile-divider" />

        {/* Logout Button */}
        <button onClick={handleLogout} className="profile-logout-btn">
          Logout
        </button>

      </div>
    </div>
  )
}

export default Profile