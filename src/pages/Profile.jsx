import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getMaterials } from '../api/materials.js'
import { getBookmarks } from '../api/bookmarks.js'
import '../styles/Profile.css'

function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [uploads, setUploads] = useState(0)
  const [bookmarks, setBookmarks] = useState(0)
  const [upvotes, setUpvotes] = useState(0)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get uploads
      const materials = await getMaterials()
      const myMaterials = materials.filter(m => m.uploadedBy._id === user._id)
      setUploads(myMaterials.length)

      // Get total upvotes received
      const totalUpvotes = myMaterials.reduce((sum, m) => sum + (m.upvotes?.length || 0), 0)
      setUpvotes(totalUpvotes)

      // Get bookmarks
      const bookmarkData = await getBookmarks()
      setBookmarks(bookmarkData.length)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

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
          <div className="profile-stat" onClick={() => navigate('/my-uploads')} style={{ cursor: 'pointer' }}>
            <p className="stat-number">{uploads}</p>
            <p className="stat-label">Uploads</p>
          </div>
          <div className="profile-stat" onClick={() => navigate('/bookmarks')} style={{ cursor: 'pointer' }}>
            <p className="stat-number">{bookmarks}</p>
            <p className="stat-label">Bookmarks</p>
          </div>
          <div className="profile-stat">
            <p className="stat-number">{upvotes}</p>
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