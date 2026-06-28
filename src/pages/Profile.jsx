import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from '../api/axios.js'
import { getMaterials } from '../api/materials.js'
import { getBookmarks } from '../api/bookmarks.js'
import '../styles/Profile.css'

function Profile() {
  const { user, logout, login } = useAuth()
  const navigate = useNavigate()
  const [uploads, setUploads] = useState(0)
  const [bookmarks, setBookmarks] = useState(0)
  const [upvotes, setUpvotes] = useState(0)
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(user?.name || '')
  const [gradeInput, setGradeInput] = useState(user?.grade || JSON.parse(localStorage.getItem('user') || '{}')?.grade || 'grade 9')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [profileMsg, setProfileMsg] = useState('')

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNew, setConfirmNew] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({ label: '', level: '', score: 0 })
  const [passwordMatch, setPasswordMatch] = useState('')

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

  const getPasswordStrength = (value) => {
    if (!value) return { label: '', level: '', score: 0 }
    const checks = [
      /[a-z]/.test(value),
      /[A-Z]/.test(value),
      /\d/.test(value),
      /[^A-Za-z0-9]/.test(value),
      value.length >= 8,
    ]
    const score = checks.filter(Boolean).length
    if (score <= 2) return { label: 'Weak', level: 'weak', score }
    if (score <= 4) return { label: 'Medium', level: 'medium', score }
    return { label: 'Strong', level: 'strong', score }
  }

  const handlePasswordChange = (value) => {
    setNewPassword(value)
    setPasswordStrength(getPasswordStrength(value))
    if (confirmNew) {
      setPasswordMatch(value === confirmNew ? 'Passwords match' : 'Passwords do not match')
    }
  }

  const handleConfirmPasswordChange = (value) => {
    setConfirmNew(value)
    if (!newPassword) {
      setPasswordMatch('Enter a new password first')
    } else if (value === newPassword) {
      setPasswordMatch('Passwords match')
    } else {
      setPasswordMatch('Passwords do not match')
    }
  }

  const handleStartEdit = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    setEditing(true)
    setNameInput(user?.name || '')
    setGradeInput(user?.grade || storedUser?.grade || 'grade 9')
  }

  const handlePhotoChange = (e) => {
    const f = e.target.files[0]
    setPhotoFile(f)
    if (f) setPhotoPreview(URL.createObjectURL(f))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileMsg('')
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      const grade = gradeInput || user?.grade || storedUser?.grade || 'grade 9'
      const data = new FormData()
      data.append('name', nameInput)
      data.append('grade', grade)
      if (photoFile) data.append('photo', photoFile)

      const res = await axios.put('/auth/profile', data)
      // update local user
      const token = localStorage.getItem('token')
      // login is available from useAuth
      // eslint-disable-next-line
      const updatedUser = res.data.user || { ...user, name: nameInput }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      if (login) login(updatedUser, localStorage.getItem('token'))
      setProfileMsg('Profile updated')
      setEditing(false)
    } catch (err) {
      setProfileMsg(err.response?.data?.message || 'Could not update profile')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMsg('')
    if (!currentPassword || !newPassword) {
      setPasswordMsg('Please provide current and new password')
      return
    }
    if (newPassword !== confirmNew) {
      setPasswordMsg('New passwords do not match')
      return
    }
    if (passwordStrength.score < 4) {
      setPasswordMsg('Password should be at least 8 characters and include uppercase, lowercase, number, and symbol')
      return
    }
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      const grade = gradeInput || user?.grade || storedUser?.grade || 'grade 9'
      await axios.post('/auth/change-password', { currentPassword, newPassword, grade })
      setPasswordMsg('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNew('')
      setPasswordStrength({ label: '', level: '', score: 0 })
      setPasswordMatch('')
    } catch (err) {
      setPasswordMsg(err.response?.data?.message || 'Could not change password')
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-card">

        {/* Avatar */}
        <div className="profile-avatar">
            {photoPreview ? (
              <img src={photoPreview} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%' }} />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
        </div>

        {/* User Info */}
        <h2 className="profile-name">{user?.name}</h2>
        <p className="profile-email">{user?.email}</p>
        <span className="profile-role">{user?.role}</span>

        <div className="profile-divider" />

        {editing ? (
          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="profile-field">
              <label>Name</label>
              <input className="profile-input" value={nameInput} onChange={e => setNameInput(e.target.value)} />
            </div>
            <div className="profile-field">
              <label>Grade</label>
              <select className="profile-input" value={gradeInput} onChange={(e) => setGradeInput(e.target.value)}>
                <option value="grade 9">Grade 9</option>
                <option value="grade 10">Grade 10</option>
                <option value="grade 11">Grade 11</option>
                <option value="grade 12">Grade 12</option>
                <option value="university student">University student</option>
              </select>
            </div>
            <div className="profile-field">
              <label>Photo</label>
              <input className="profile-input" type="file" accept="image/*" onChange={handlePhotoChange} />
            </div>
            {profileMsg && <div className="profile-alert profile-alert-success">{profileMsg}</div>}
            <div className="profile-actions">
              <button className="profile-btn profile-btn-primary" type="submit">Save</button>
              <button type="button" className="profile-btn profile-btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ marginTop: 12 }}>
            <button className="profile-btn profile-btn-primary" onClick={handleStartEdit}>Edit profile</button>
          </div>
        )}

        <div className="profile-divider" />

        <div className="profile-password-section">
          <h4 className="profile-section-title">Change password</h4>
          {passwordMsg && <div className="profile-alert profile-alert-error">{passwordMsg}</div>}
          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="profile-field">
              <input className="profile-input" type="password" placeholder="Current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div className="profile-field">
              <input className="profile-input" type="password" placeholder="New password" value={newPassword} onChange={e => handlePasswordChange(e.target.value)} />
            </div>
            {newPassword && (
              <div className="profile-strength">
                <div className={`profile-strength-bar ${passwordStrength.level}`}></div>
                <span className={`profile-strength-text ${passwordStrength.level}`}>Strength: {passwordStrength.label || 'Enter a password'}</span>
              </div>
            )}
            <div className="profile-field">
              <input className="profile-input" type="password" placeholder="Confirm new password" value={confirmNew} onChange={e => handleConfirmPasswordChange(e.target.value)} />
            </div>
            {passwordMatch && <div className={`profile-match ${passwordMatch === 'Passwords match' ? 'match-success' : 'match-error'}`}>{passwordMatch}</div>}
            <button className="profile-btn profile-btn-primary" type="submit">Change password</button>
          </form>
        </div>

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