import { useEffect, useMemo, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from '../api/axios.js'
import { getBookById, getBookSignedUrl, getBooks } from '../api/books.js'
import '../styles/Books.css'
import { getSubjects } from '../utils/subjects.js'

const gradeOptions = ['grade 9', 'grade 10', 'grade 11', 'grade 12', 'university student']

function Books() {
  const navigate = useNavigate()
  const location = useLocation()
  const preselectGrade = (location.state?.preselectGrade || '').toLowerCase()
  const preselectSubject = (location.state?.preselectSubject || '')

  const [selectedGrade, setSelectedGrade] = useState(preselectGrade || '')
  const [selectedSubject, setSelectedSubject] = useState(preselectSubject || 'All')
  const [subjectOptions, setSubjectOptions] = useState(['All', ...getSubjects()])
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true)
        const data = await getBooks()
        setBooks(Array.isArray(data) ? data : [])
        setSelectedBook(null)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load books right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  useEffect(() => {
    setSubjectOptions(['All', ...getSubjects()])
  }, [])

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesGrade = !selectedGrade || book.grade?.toLowerCase() === selectedGrade.toLowerCase()
      const matchesSubject = selectedSubject === 'All' || book.subject?.toLowerCase() === selectedSubject.toLowerCase()
      return matchesGrade && matchesSubject
    })
  }, [books, selectedGrade, selectedSubject])

  const previewRef = useRef(null)
  const API_HOST = 'http://localhost:5000'

  const resolveFileUrl = (url) => {
    if (!url) return url
    if (url.startsWith('http')) return url
    return `${API_HOST}${url.startsWith('/') ? url : `/${url}`}`
  }

  const handleSelectBook = async (bookId) => {
    try {
      setError('')
      const book = await getBookById(bookId)
      // clear previous preview blob URL if any
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
        previewRef.current = null
      }

      let previewUrl = ''

      // Prefer backend-supplied signed URL for private Cloudinary assets
      if (book.filePublicId) {
        try {
          const signed = await getBookSignedUrl(bookId)
          previewUrl = signed?.url || ''
        } catch (signedErr) {
          console.warn('Signed URL fetch failed', signedErr)
        }
      }

      // If no signed URL, fetch the file through the backend and create a local object URL
      if (!previewUrl && book.fileUrl) {
        try {
          const fileReqUrl = resolveFileUrl(book.fileUrl)
          const resp = await axios.get(fileReqUrl, { responseType: 'blob' })
          const blobUrl = URL.createObjectURL(resp.data)
          previewRef.current = blobUrl
          previewUrl = blobUrl
        } catch (fetchErr) {
          console.warn('File preview failed', fetchErr)
        }
      }

      // Final fallback: request the backend file route directly if preview is still unavailable
      if (!previewUrl) {
        try {
          const resp = await axios.get(`${API_HOST}/api/books/${bookId}/file`, { responseType: 'blob' })
          const blobUrl = URL.createObjectURL(resp.data)
          previewRef.current = blobUrl
          previewUrl = blobUrl
        } catch (fileErr) {
          console.warn('Backend file route preview failed', fileErr)
          book.previewError = true
        }
      }

      if (previewUrl) {
        book.previewUrl = previewUrl
      }

      setSelectedBook(book)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to open this book.')
    }
  }

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
        previewRef.current = null
      }
    }
  }, [])

  const handleOpenInNewTab = () => {
    if (!selectedBook) return
    const directUrl = selectedBook.fileUrl ? resolveFileUrl(selectedBook.fileUrl) : ''
    const previewUrl = selectedBook.previewUrl || ''
    const url = previewUrl && !previewUrl.startsWith('blob:') ? previewUrl : directUrl || previewUrl
    if (!url) return setError('No file available to open')
    window.open(url, '_blank')
  }

  const handleDownload = async () => {
    if (!selectedBook) return
    // If we have a preview blob URL, use it for download
    if (selectedBook.previewUrl) {
      const a = document.createElement('a')
      a.href = selectedBook.previewUrl
      a.download = `${selectedBook.title || 'book'}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      return
    }

    // Otherwise try to fetch the file (authenticated) and trigger download
    if (selectedBook.fileUrl) {
      try {
        const fileReqUrl = resolveFileUrl(selectedBook.fileUrl)
        const resp = await axios.get(fileReqUrl, { responseType: 'blob' })
        const blob = resp.data
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `${selectedBook.title || 'book'}`
        document.body.appendChild(a)
        a.click()
        a.remove()
        // revoke after a short delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)
      } catch (err) {
        console.error('Download failed', err)
        setError('Download failed. The file may be protected or unavailable.')
      }
    }
  }

  return (
    <div className="books-page">
      <div className="books-shell">
        <div className="books-hero">
          <h1>Books & Recommended Reading</h1>
          <p className="home-subtitle">Browse books by grade and open detailed book information.</p>
        </div>

        <div className="books-panel">
          <div className="books-filter-group">
            <div className="books-filter-section">
              <h3>Grade</h3>
              <div className="books-grade-row">
                <button
                  className={`books-grade-btn ${!selectedGrade ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedGrade('')
                    setSelectedBook(null)
                  }}
                >
                  All grades
                </button>
                {gradeOptions.map((grade) => (
                  <button
                    key={grade}
                    className={`books-grade-btn ${selectedGrade === grade ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedGrade(grade)
                      setSelectedBook(null)
                    }}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            <div className="books-filter-section">
              <h3>Subject</h3>
              <div className="books-grade-row">
                {subjectOptions.map((subject) => (
                  <button
                    key={subject}
                    className={`books-grade-btn ${selectedSubject === subject ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSubject(subject)
                      setSelectedBook(null)
                    }}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading && <p className="book-empty">Loading books...</p>}
          {error && <p className="book-empty">{error}</p>}

          {!loading && !error && (
            <>
              <div className="books-grid">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <div key={book._id} className="book-card" onClick={() => handleSelectBook(book._id)}>
                      <h4>{book.title}</h4>
                      <p className="book-meta">By {book.author || 'Minister'}</p>
                      <p className="book-meta">Grade: {book.grade}</p>
                      <p className="book-description">{book.description || 'Helpful study book for this grade.'}</p>
                    </div>
                  ))
                ) : (
                  <p className="book-empty">No books available for this grade yet.</p>
                )}
              </div>

              {selectedBook && (
                <div className="book-detail">
                  <h3>{selectedBook.title}</h3>
                  <p className="book-meta">Author: {selectedBook.author || 'Minister'}</p>
                  <p className="book-meta">Grade: {selectedBook.grade}</p>
                  {selectedBook.isbn && <p className="book-meta">ISBN: {selectedBook.isbn}</p>}
                  <p className="book-description">{selectedBook.description || 'No description provided.'}</p>
                  {selectedBook.previewError && (
                    <p className="book-empty">Preview unavailable for this book. Please use the Open or Download buttons.</p>
                  )}
                  {(selectedBook.previewUrl || selectedBook.fileUrl) && (selectedBook.fileType === 'pdf' || !selectedBook.fileType) && (
                    <div className="book-embed">
                      <iframe
                        src={selectedBook.previewUrl || resolveFileUrl(selectedBook.fileUrl)}
                        title="Book PDF"
                        width="100%"
                        height="600"
                        style={{ border: '1px solid #eee', borderRadius: 6 }}
                      />
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        <button className="books-open-btn" onClick={handleOpenInNewTab}>Open in new tab</button>
                        <button className="books-download-link" type="button" onClick={handleDownload}>Download</button>
                      </div>
                    </div>
                  )}

                  {selectedBook.fileUrl && selectedBook.fileType === 'image' && (
                    <div style={{ marginTop: 12 }}>
                      <img src={resolveFileUrl(selectedBook.fileUrl)} alt={selectedBook.title} style={{ maxWidth: '100%', borderRadius: 6 }} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="books-actions">
            <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Books
