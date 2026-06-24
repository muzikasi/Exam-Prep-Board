import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMaterial, upvoteMaterial } from '../api/materials.js'
import { addBookmark, removeBookmark, getBookmarks } from '../api/bookmarks.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/MaterialDetail.css'

function MaterialDetail() {
    const { id } = useParams()
    const { user, token } = useAuth()
    const navigate = useNavigate()

    const [material, setMaterial] = useState(null)
    const [loading, setLoading] = useState(true)
    const [upvoted, setUpvoted] = useState(false)
    const [upvoteCount, setUpvoteCount] = useState(0)
    const [bookmarked, setBookmarked] = useState(false)

    useEffect(() => {
        fetchMaterial()
        if (token) checkBookmark()
    }, [id])

    const fetchMaterial = async () => {
        try {
            const data = await getMaterial(id)
            setMaterial(data)
            setUpvoteCount(data.upvotes?.length || 0)
            if (user) {
                setUpvoted(data.upvotes?.includes(user._id))
            }
        } catch (error) {
            console.error('Error fetching material:', error)
        } finally {
            setLoading(false)
        }
    }

    const checkBookmark = async () => {
        try {
            const bookmarks = await getBookmarks()
            const isBookmarked = bookmarks.some(b => b.material._id === id)
            setBookmarked(isBookmarked)
        } catch (error) {
            console.error('Error checking bookmark:', error)
        }
    }

    const handleUpvote = async () => {
        if (!token) return navigate('/login')
        try {
            const data = await upvoteMaterial(id)
            setUpvoteCount(data.upvotes)
            setUpvoted(data.upvoted)
        } catch (error) {
            console.error('Error upvoting:', error)
        }
    }

    const handleBookmark = async () => {
        if (!token) return navigate('/login')
        try {
            if (bookmarked) {
                await removeBookmark(id)
                setBookmarked(false)
            } else {
                await addBookmark(id)
                setBookmarked(true)
            }
        } catch (error) {
            console.error('Error bookmarking:', error)
        }
    }

    if (loading) return <div className="detail-loading">Loading...</div>
    if (!material) return <div className="detail-loading">Material not found!</div>

    return (
        <div className="detail-container">

            {/* Breadcrumb */}
            <div className="detail-breadcrumb">
                <span onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', color: '#4a6cf7' }}>
                    Browse
                </span>
                {' > '}
                <span onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', color: '#4a6cf7' }}>
                    {material.subject}
                </span>
                {' > '}
                <span style={{ color: '#888' }}>{material.title}</span>
            </div>

            <div className="detail-grid">

                {/* Main Panel */}
                <div className="detail-main">
                    <div className="detail-viewer">
                        <div className="detail-viewer-header">
                            <span className="detail-viewer-title">{material.title}</span>
                        </div>

                        {/* File Preview */}
                        <div className="detail-preview">
                            {material.fileType === 'pdf' ? (
                                <iframe
                                    src={material.fileUrl}
                                    width="100%"
                                    height="500px"
                                    title={material.title}
                                    style={{ border: 'none', borderRadius: '8px' }}
                                />
                            ) : (
                                <img
                                    src={material.fileUrl}
                                    alt={material.title}
                                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Side Panel */}
                <div className="detail-side">

                    {/* Info Card */}
                    <div className="detail-info-card">
                        <h3 className="detail-info-title">{material.title}</h3>
                        <div className="detail-info-rows">
                            <div className="detail-info-row">
                                <span className="detail-info-label">Subject</span>
                                <span className="detail-info-badge">{material.subject}</span>
                            </div>
                            <div className="detail-info-row">
                                <span className="detail-info-label">Year</span>
                                <span className="detail-info-value">{material.year}</span>
                            </div>
                            <div className="detail-info-row">
                                <span className="detail-info-label">Type</span>
                                <span className="detail-info-value">{material.type}</span>
                            </div>
                            <div className="detail-info-row">
                                <span className="detail-info-label">File</span>
                                <span className="detail-info-value">{material.fileType.toUpperCase()}</span>
                            </div>
                        </div>

                        {/* Upvote */}
                        <button
                            className={`detail-upvote-btn ${upvoted ? 'upvoted' : ''}`}
                            onClick={handleUpvote}
                        >
                            ▲ {upvoted ? 'Upvoted' : 'Upvote this material'}
                        </button>
                        <p className="detail-upvote-count">{upvoteCount} students found this helpful</p>

                        {/* Bookmark */}
                        <button
                            className={`detail-bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
                            onClick={handleBookmark}
                        >
                            {bookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}
                        </button>

                        {/* Download */}
                        <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="detail-download-btn"
                        >
                            ⬇ Download
                        </a>
                    </div>

                    {/* Uploader Card */}
                    <div className="detail-uploader-card">
                        <p className="detail-uploader-label">Uploaded by</p>
                        <div className="detail-uploader-info">
                            <div className="detail-uploader-avatar">
                                {material.uploadedBy?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="detail-uploader-name">{material.uploadedBy?.name}</p>
                                <p className="detail-uploader-date">
                                    {new Date(material.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default MaterialDetail