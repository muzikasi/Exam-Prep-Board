import '../styles/Home.css'

function Home() {
  return (
    <div className="home">
      <div className="home-hero">
        <h1 className="home-title">📝 Exam Prep Board</h1>
        <p className="home-subtitle">
          Your one stop place to find past exam questions, 
          study materials and tips organized by subject and year.
        </p>
        <div className="home-buttons">
          <a href="/register" className="btn-primary">Get Started</a>
          <a href="/dashboard" className="btn-secondary">Browse Materials</a>
        </div>
      </div>
    </div>
  )
}

export default Home