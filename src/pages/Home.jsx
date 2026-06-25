import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/Home.css'

function Home() {
  const { token } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="home">
      <div className="home-hero">
        <h1 className="home-title">📝 Exam Prep Board</h1>
        <p className="home-subtitle">
          Your one stop place to find past exam questions, 
          study materials and tips organized by subject and year.
        </p>
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
        </div>
      </div>
    </div>
  )
}

export default Home