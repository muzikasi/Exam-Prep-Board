import { useState } from 'react'
import '../styles/Dashboard.css'

const subjects = [
  { icon: '📐', name: 'Mathematics', count: 84, years: '2018-2025' },
  { icon: '⚛️', name: 'Physics', count: 61, years: '2016-2026' },
  { icon: '📚', name: 'English', count: 74, years: '2012-2025' },
  { icon: '🌍', name: 'History', count: 50, years: '2018-2024' },
  { icon: '🧪', name: 'Chemistry', count: 65, years: '2019-2025' },
  { icon: '📊', name: 'Economics', count: 67, years: '2018-2026' },
]

const chips = ['All subjects', 'Mathematics', 'Physics', 'English', 'History', 'Chemistry', 'Economics']

const recentMaterials = [
  { icon: '📐', title: 'Mathematics paper 2 - model answers', meta: 'Mathematics 2024 · uploaded by Dawit.T' },
  { icon: '⚛️', title: 'Physics chapter 5 - electricity summary notes', meta: 'Physics 2024 · uploaded by Dawit.T' },
]

function Dashboard() {
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('')
  const [activeChip, setActiveChip] = useState('All subjects')

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
          <button className="dashboard-search-btn">Search</button>
        </div>
      </div>

      {/* Subject Chips */}
      <div className="dashboard-chips">
        {chips.map(chip => (
          <button
            key={chip}
            className={`chip ${activeChip === chip ? 'chip-active' : ''}`}
            onClick={() => setActiveChip(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Subject Cards */}
      <div className="dashboard-grid">
        {subjects.map((s, i) => (
          <div key={i} className="subject-card">
            <div className="subject-icon">{s.icon}</div>
            <p className="subject-name">{s.name}</p>
            <p className="subject-meta">{s.count} materials · {s.years}</p>
          </div>
        ))}
      </div>

      {/* Recent Uploads */}
      <div className="dashboard-recent">
        <p className="recent-label">Recent uploads</p>
        {recentMaterials.map((m, i) => (
          <div key={i} className="recent-item">
            <span className="recent-icon">{m.icon}</span>
            <div>
              <p className="recent-title">{m.title}</p>
              <p className="recent-meta">{m.meta}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Dashboard