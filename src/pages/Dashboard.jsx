import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMaterials } from '../api/materials.js'
import '../styles/Dashboard.css'

const subjects = [
  { icon: '📐', name: 'Mathematics' },
  { icon: '⚛️', name: 'Physics' },
  { icon: '📚', name: 'English' },
  { icon: '🌍', name: 'History' },
  { icon: '🧪', name: 'Chemistry' },
  { icon: '📊', name: 'Economics' },
]

const chips = ['All subjects', 'Mathematics', 'Physics', 'English', 'History', 'Chemistry', 'Economics']

function Dashboard() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('')
  const [activeChip, setActiveChip] = useState('All subjects')
  const navigate = useNavigate()

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async (params = {}) => {
    try {
      setLoading(true)
      const data = await getMaterials(params)
      setMaterials(data)
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const params = {}
    if (search) params.search = search
    if (year) params.year = year
    if (activeChip !== 'All subjects') params.subject = activeChip
    fetchMaterials(params)
  }

  const handleChip = (chip) => {
    setActiveChip(chip)
    const params = {}
    if (search) params.search = search
    if (year) params.year = year
    if (chip !== 'All subjects') params.subject = chip
    fetchMaterials(params)
  }

  const handleSubjectCard = (subject) => {
    setActiveChip(subject)
    fetchMaterials({ subject })
  }

  return (
    <div className="dashboard">

      {/* Hero / Search */}
      <div className="dashboard-hero">
        <h1 className="dashboard-title">Find your study materials</h1>
        <p className="dashboard-sub">
          Past exam questions, summaries, and tips — organised by subject and year
        </p>
        <div className="dashboard-search-row">
          <input
            className="dashboard-search"
            placeholder="🔍 Search by subject or keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <select
            className="dashboard-year"
            value={year}
            onChange={e => setYear(e.target.value)}
          >
            <option value="">All years</option>
            {[2026,2025,2024,2023,2022,2021,2020].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button className="dashboard-search-btn" onClick={handleSearch}>Search</button>
        </div>
      </div>

      {/* Subject Chips */}
      <div className="dashboard-chips">
        {chips.map(chip => (
          <button
            key={chip}
            className={`chip ${activeChip === chip ? 'chip-active' : ''}`}
            onClick={() => handleChip(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Subject Cards */}
      <div className="dashboard-grid">
        {subjects.map((s, i) => (
          <div key={i} className="subject-card" onClick={() => handleSubjectCard(s.name)}>
            <div className="subject-icon">{s.icon}</div>
            <p className="subject-name">{s.name}</p>
          </div>
        ))}
      </div>

      {/* Materials List */}
      <div className="dashboard-recent">
        <p className="recent-label">
          {activeChip === 'All subjects' ? 'Recent uploads' : activeChip}
          {' '}({materials.length})
        </p>

        {loading ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Loading...</p>
        ) : materials.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No materials found!</p>
        ) : (
          materials.map((m) => (
            <div
              key={m._id}
              className="recent-item"
              onClick={() => navigate(`/material/${m._id}`)}
            >
              <span className="recent-icon">
                {m.fileType === 'pdf' ? '📄' : '🖼️'}
              </span>
              <div style={{ flex: 1 }}>
                <p className="recent-title">{m.title}</p>
                <p className="recent-meta">
                  {m.subject} · {m.year} · uploaded by {m.uploadedBy?.name}
                </p>
              </div>
              <div style={{ color: '#4a6cf7', fontSize: '13px' }}>
                ▲ {m.upvotes?.length}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}

export default Dashboard