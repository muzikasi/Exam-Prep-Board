import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../styles/Home.css'

const gradeOptions = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'University']

// Curriculum mapping (simplified from the provided breakdown)
const curriculum = {
  'Grade 9': [
    'English', 'Amharic', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Civics and Ethical Education', 'Information Technology', 'Performing and Visual Arts', 'Physical and Health Education'
  ],
  'Grade 10': [
    'English', 'Amharic', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Civics and Ethical Education', 'Information Technology', 'Performing and Visual Arts', 'Physical and Health Education'
  ],
  'Grade 11': [
    'English', 'Mathematics (Natural/Social track)', 'Information Technology', 'Civics and Ethical Education',
    'Physics', 'Chemistry', 'Biology', 'Technical Drawing / Agriculture / History / Geography / Economics / Business (stream dependent)'
  ],
  'Grade 12': [
    'English', 'Mathematics (Natural/Social track)', 'Information Technology', 'Civics and Ethical Education',
    'Physics', 'Chemistry', 'Biology', 'Technical Drawing / Agriculture / History / Geography / Economics / Business (stream dependent)'
  ],
  'University': [
    'Subject specific textbooks and references'
  ]
}

function Books() {
  const navigate = useNavigate()
  const location = useLocation()
  const preselect = location.state?.preselectGrade || null

  const [selectedGrade, setSelectedGrade] = useState(preselect)
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    if (selectedGrade) {
      setSubjects(curriculum[selectedGrade] || [])
    }
  }, [selectedGrade])

  const handleOpenMaterial = (subject) => {
    // For now navigate to dashboard materials listing; future: deep-link to subject
    navigate('/dashboard')
  }

  return (
    <div className="books-page">
      <div className="home-hero" style={{ padding: '40px 20px' }}>
        <h1>Books & Recommended Reading</h1>
        <p className="home-subtitle">Select your grade to see suggested subjects and starter texts.</p>

        <div style={{ margin: '20px 0' }}>
          <h3>Choose Grade</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {gradeOptions.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                style={{ padding: '8px 12px', borderRadius: 8, border: selectedGrade === g ? '2px solid #4a6cf7' : '1px solid #444', background: 'transparent', color: '#fff' }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {selectedGrade && (
          <div style={{ marginTop: 24, textAlign: 'left', maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
            <h3>Suggested subjects for {selectedGrade}</h3>
            <ul>
              {subjects.map((s) => (
                <li key={s} style={{ marginBottom: 8 }}>
                  <strong>{s}</strong>
                  <div style={{ marginTop: 6 }}>
                    <button onClick={() => handleOpenMaterial(s)} style={{ marginRight: 8 }}>Browse materials</button>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Open sample book placeholder') }}>Open sample book</a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        </div>
      </div>
    </div>
  )
}

export default Books
