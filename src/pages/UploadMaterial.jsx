import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMaterial } from '../api/materials.js'
import '../styles/UploadMaterial.css'

function UploadMaterial() {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    yearEC: '',
    yearGC: '',
    type: '',
  })
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const convertECtoGC = (year) => {
    return year ? Number(year) + 8 : ''
  }


  const handleChange = (e) => {

    const { name, value } = e.target

    if (name === 'yearEC') {

      setFormData({
        ...formData,
        yearEC: value,
        yearGC: convertECtoGC(value)
      })

    } else {

      setFormData({
        ...formData,
        [name]: value
      })

    }

  }

  const handleFile = (e) => {
    setFile(e.target.files[0])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    setFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('subject', formData.subject)
      data.append('year[ec]', formData.yearEC)
      data.append('year[gc]', formData.yearGC)
      data.append('type', formData.type)
      data.append('file', file)

      await createMaterial(data)
      setSuccess('Material uploaded successfully!')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2 className="upload-title">Upload Material</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>

          {/* Drop Zone */}
          <div
            className={`upload-dropzone ${dragOver ? 'dragover' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <div className="upload-drop-icon">⬆️</div>
            {file ? (
              <p className="upload-drop-text">✅ {file.name}</p>
            ) : (
              <p className="upload-drop-text">
                Drag and drop your file here or click to browse
              </p>
            )}
            <input
              id="fileInput"
              type="file"
              accept=".pdf,image/*"
              onChange={handleFile}
              style={{ display: 'none' }}
            />
          </div>

          {/* Form Fields */}
          <div className="upload-form-grid">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. English Entranc Exam"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Subject</label>
              <select name="subject" value={formData.subject} onChange={handleChange} required>
                <option value="">Select subject</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>English</option>
                <option>History</option>
                <option>Chemistry</option>
                <option>Economics</option>
                <option>Biology</option>
                <option>Civics</option>
                <option>Aptitude</option>
                <option>Study tips</option>
                <option>Summery notes</option>
              </select>
            </div>

            <div className="form-group">
              <label>Year EC</label>
              <input
                type="number"
                name="yearEC"
                placeholder="e.g. 2016"
                value={formData.yearEC}
                onChange={handleChange}
                required
              />
            </div>


            <div className="form-group">
              <label>Year GC</label>
              <input
                type="number"
                name="yearGC"
                value={formData.yearGC}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                <option value="">Select type</option>
                <option>Past exam question</option>
                <option>Summary notes</option>
                <option>Study tips</option>
              </select>
            </div>
          </div>

          <button type="submit" className="upload-btn" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Material'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UploadMaterial