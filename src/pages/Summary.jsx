import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMaterials } from '../api/materials.js'
import '../styles/Dashboard.css'

function Summary() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchSummary() }, [])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const data = await getMaterials({ type: 'Summary notes' })
      const filtered = (Array.isArray(data) ? data : []).filter((material) => {
        const type = String(material?.type || '').toLowerCase()
        return type === 'summary notes' || type === 'summary' || type === 'summary-notes'
      })
      setMaterials(filtered)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <h1 className="dashboard-title">Summary Notes</h1>
        <p className="dashboard-sub">Concise summaries and notes uploaded by the community</p>
      </div>

      <div className="dashboard-recent">
        <p className="recent-label">Summary notes ({materials.length})</p>

        {loading ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Loading...</p>
        ) : materials.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No summaries found!</p>
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

export default Summary
