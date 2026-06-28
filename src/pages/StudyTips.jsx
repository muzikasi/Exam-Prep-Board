import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMaterials } from '../api/materials.js'
import '../styles/Dashboard.css'

function StudyTips() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchTips() }, [])

  const fetchTips = async () => {
    try {
      setLoading(true)
      const data = await getMaterials({ type: 'Study tips' })
      const filtered = (Array.isArray(data) ? data : []).filter((material) => {
        const type = String(material?.type || '').toLowerCase()
        return type === 'study tips' || type === 'studytips' || type === 'study tip'
      })
      setMaterials(filtered)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <h1 className="dashboard-title">Study Tips</h1>
        <p className="dashboard-sub">Helpful study strategies and tips shared by users</p>
      </div>

      <div className="dashboard-recent">
        <p className="recent-label">Study tips ({materials.length})</p>

        {loading ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Loading...</p>
        ) : materials.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No study tips found!</p>
        ) : (
          materials.map((m) => (
            <div key={m._id} className="recent-item" onClick={() => navigate(`/material/${m._id}`)}>
              <span className="recent-icon">{m.fileType === 'pdf' ? '📄' : '🖼️'}</span>
              <div style={{ flex: 1 }}>
                <p className="recent-title">{m.title}</p>
                <p className="recent-meta">{m.subject} · {m.year?.ec} EC / {m.year?.gc} GC · uploaded by {m.uploadedBy?.name}</p>
              </div>
              <div style={{ color: '#4a6cf7', fontSize: '13px' }}>▲ {m.upvotes?.length}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default StudyTips
