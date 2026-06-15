import { useState } from 'react'
import '../styles/UploadMaterial.css'

function UploadMaterial() {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    year: '',
    type: '',
  })
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFile = (e) => {
    setFile(e.target.files[0])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    setFile(e.dataTransfer.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Upload data:', formData, file)
    // we will connect to backend later
  }

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2 className="upload-title">Upload Study Material</h2>

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
                placeholder="e.g. Math paper 2 answers"
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
              </select>
            </div>

            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                name="year"
                placeholder="e.g. 2024"
                value={formData.year}
                onChange={handleChange}
                required
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

          <button type="submit" className="upload-btn">Upload Material</button>
        </form>
      </div>
    </div>
  )
}

export default UploadMaterial