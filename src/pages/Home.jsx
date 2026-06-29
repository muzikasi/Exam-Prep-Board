import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useEffect, useState } from 'react'
import '../styles/Home.css'

function Home() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const SUBJECTS = [
    { name: '📚 Mathematics', emoji: '🔢' },
    { name: '🔬 Physics', emoji: '⚛️' },
    { name: '📖 English', emoji: '📝' },
    { name: '🧪 Chemistry', emoji: '🧬' },
    { name: '📜 History', emoji: '🏛️' },
    { name: '💰 Economics', emoji: '📊' },
    { name: '🌱 Biology', emoji: '🧫' },
    { name: '🏛️ Civics', emoji: '⚖️' },
    { name: '🧠 Aptitude', emoji: '🎯' },
  ]

  // no latest books fetch here — Home shows a single Books card

  const handleExamPractice = () => {
    if (token) {
      navigate('/exam-practice')
    } else {
      navigate('/register')
    }
  }

  return (
    <div className="home">
      <div className="falling-subjects">
        {SUBJECTS.map((subject, index) => (
          <button
            key={subject.name}
            className="subject-item"
            onClick={() => navigate('/exam-practice')}
            style={{
              '--delay': `${index * 0.35}s`,
              '--duration': `${8 + (index % 3) * 2}s`,
              '--left': `${(index * 13) % 100}%`,
              '--direction': index % 2 === 0 ? '1' : '-1',
            }}
          >
            <span className="subject-emoji">{subject.emoji}</span>
            <span className="subject-text">{subject.name}</span>
          </button>
        ))}
      </div>

      <div className="home-hero">
        <div className="animated-student">
          <div className="student">🎓</div>
        </div>
        
        <h1 className="home-title">📝 ExamBoard</h1>
        <p className="home-subtitle">
          Unlock past exam questions, study materials, and smart revision tips in one calm, focused place.
        </p>
        
        <div className="features-grid">
          <div className="feature-card" onClick={() => navigate('/dashboard')}>
            <div className="feature-icon">📚</div>
            <h3>Study Materials</h3>
            <p>Access curated notes, past papers, and resources by subject.</p>
          </div>
          <div className="feature-card" onClick={handleExamPractice}>
            <div className="feature-icon">✏️</div>
            <h3>Practice Tests</h3>
            <p>Choose a subject and grade, then practice with quiz questions.</p>
          </div>
          <div className="feature-card" onClick={() => navigate('/summary')}>
            <div className="feature-icon">📝</div>
            <h3>Summary Notes</h3>
            <p>Review concise summary notes for fast revision.</p>
          </div>
          <div className="feature-card" onClick={() => navigate('/study-tips')}>
            <div className="feature-icon">💡</div>
            <h3>Study Tips</h3>
            <p>Get study strategies and exam-ready tips.</p>
          </div>
          <div className="feature-card" onClick={() => navigate('/books')}>
            <div className="feature-icon">📖</div>
            <h3>Books</h3>
            <p>Browse uploaded textbooks and recommended readings.</p>
          </div>
        </div>

        <div className="home-buttons">
          <button
            className="btn-primary"
            onClick={() => navigate(token ? '/dashboard' : '/register')}
          >
            {token ? 'Go to Dashboard' : 'Get Started'}
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Browse Materials
          </button>
          <button
            className="btn-exam"
            onClick={handleExamPractice}
          >
            🎯 Exam Practice
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home