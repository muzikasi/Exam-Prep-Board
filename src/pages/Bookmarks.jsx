import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBookmarks, removeBookmark } from '../api/bookmarks.js'
import '../styles/Bookmarks.css'

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      const data = await getBookmarks()
      setBookmarks(data)
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (materialId) => {
    try {
      await removeBookmark(materialId)
      setBookmarks(bookmarks.filter(b => b.material._id !== materialId))
    } catch (error) {
      console.error('Error removing bookmark:', error)
    }
  }

  return (
    <div className="bookmarks-container">
      <div className="bookmarks-header">
        <h1 className="bookmarks-title">My Bookmarks</h1>
      </div>

      {loading ? (
        <p className="bookmarks-empty">Loading...</p>
      ) : bookmarks.length === 0 ? (
        <div className="bookmarks-empty-box">
          <p className="bookmarks-empty">No bookmarks yet!</p>
          <button
            className="bookmarks-browse-btn"
            onClick={() => navigate('/dashboard')}
          >
            Browse Materials
          </button>
        </div>
      ) : (
        <div className="bookmarks-list">
          {bookmarks.map(b => (
            <div key={b._id} className="bookmarks-item">
              <div className="bookmarks-item-icon">
                {b.material.fileType === 'pdf' ? '📄' : '🖼️'}
              </div>
              <div className="bookmarks-item-info">
                <p className="bookmarks-item-title">{b.material.title}</p>
                <p className="bookmarks-item-meta">
                  {b.material.subject} · {b.material.year?.ec} EC · ▲ {b.material.upvotes?.length} upvotes
                </p>
              </div>
              <div className="bookmarks-item-actions">
                <button
                  className="bookmarks-view-btn"
                  onClick={() => navigate(`/material/${b.material._id}`)}
                >
                  View
                </button>
                <button
                  className="bookmarks-remove-btn"
                  onClick={() => handleRemove(b.material._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Bookmarks