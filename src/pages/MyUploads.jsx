import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMaterials, deleteMaterial } from '../api/materials.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/MyUploads.css'

function MyUploads() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchMyUploads()
  }, [])

  const fetchMyUploads = async () => {
    try {
      const data = await getMaterials()
      const myMaterials = data.filter(m => m.uploadedBy._id === user._id)
      setMaterials(myMaterials)
    } catch (error) {
      console.error('Error fetching uploads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return
    try {
      await deleteMaterial(id)
      setMaterials(materials.filter(m => m._id !== id))
    } catch (error) {
      console.error('Error deleting material:', error)
    }
  }

  return (
    <div className="myuploads-container">
      <div className="myuploads-header">
        <h1 className="myuploads-title">My Uploads</h1>
        <button
          className="myuploads-upload-btn"
          onClick={() => navigate('/upload')}
        >
          + Upload New
        </button>
      </div>

      {loading ? (
        <p className="myuploads-empty">Loading...</p>
      ) : materials.length === 0 ? (
        <div className="myuploads-empty-box">
          <p className="myuploads-empty">You haven't uploaded anything yet!</p>
          <button
            className="myuploads-upload-btn"
            onClick={() => navigate('/upload')}
          >
            Upload your first material
          </button>
        </div>
      ) : (
        <div className="myuploads-list">
          {materials.map(m => (
            <div key={m._id} className="myuploads-item">
              <div className="myuploads-item-icon">
                {m.fileType === 'pdf' ? '📄' : '🖼️'}
              </div>
              <div className="myuploads-item-info">
                <p className="myuploads-item-title">{m.title}</p>
                <p className="myuploads-item-meta">
                  {m.subject} · {m.year?.ec} EC · {m.type} · ▲ {m.upvotes?.length} upvotes
                </p>
              </div>
              <div className="myuploads-item-actions">
                <button
                  className="myuploads-view-btn"
                  onClick={() => navigate(`/material/${m._id}`)}
                >
                  View
                </button>
                <button
                  className="myuploads-delete-btn"
                  onClick={() => handleDelete(m._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyUploads