import { useState, useEffect } from 'react'
import axios from '../api/axios.js'
import '../styles/AdminPanel.css'

function AdminPanel() {
  const [materials, setMaterials] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('materials')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [materialsRes, usersRes] = await Promise.all([
        axios.get('/admin/materials'),
        axios.get('/admin/users')
      ])
      setMaterials(materialsRes.data)
      setUsers(usersRes.data)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return
    try {
      await axios.delete(`/admin/materials/${id}`)
      setMaterials(materials.filter(m => m._id !== id))
    } catch (error) {
      console.error('Error deleting material:', error)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await axios.delete(`/admin/users/${id}`)
      setUsers(users.filter(u => u._id !== id))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  if (loading) return <div className="admin-loading">Loading...</div>

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Panel</h1>
      <p className="admin-sub">Manage all materials and users</p>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          📚 Materials ({materials.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👤 Users ({users.length})
        </button>
      </div>

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Year</th>
                <th>Uploaded By</th>
                <th>Upvotes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(m => (
                <tr key={m._id}>
                  <td>{m.title}</td>
                  <td>{m.subject}</td>
                  <td>{m.year}</td>
                  <td>{m.uploadedBy?.name}</td>
                  <td>▲ {m.upvotes?.length}</td>
                  <td>
                    <button
                      className="admin-delete-btn"
                      onClick={() => handleDeleteMaterial(m._id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`admin-role ${u.role}`}>{u.role}</span>
                  </td>
                  <td>{u.isVerified ? '✅' : '❌'}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <button
                        className="admin-delete-btn"
                        onClick={() => handleDeleteUser(u._id)}
                      >
                        🗑 Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminPanel