import { useState, useEffect } from 'react'
import axios from '../api/axios.js'
import { createMaterial, updateMaterial } from '../api/materials.js'
import { readPracticeSets, savePracticeSets } from '../utils/practiceSets.js'
import '../styles/AdminPanel.css'

const examSubjects = ['Mathematics', 'Physics', 'English', 'History', 'Chemistry', 'Economics', 'Biology', 'Civics', 'Aptitude']
const gradeOptions = ['grade 9', 'grade 10', 'grade 11', 'grade 12', 'university student']

function AdminPanel() {
  const [materials, setMaterials] = useState([])
  const [users, setUsers] = useState([])
  const [activeSection, setActiveSection] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [materialForm, setMaterialForm] = useState({
    title: '',
    subject: '',
    grade: '',
    yearEC: '',
    yearGC: '',
    type: ''
  })
  const [materialFile, setMaterialFile] = useState(null)
  const [editingMaterialId, setEditingMaterialId] = useState(null)
  const [materialLoading, setMaterialLoading] = useState(false)
  const [materialError, setMaterialError] = useState('')
  const [materialSuccess, setMaterialSuccess] = useState('')
  const [practiceSets, setPracticeSets] = useState([])
  const [practiceForm, setPracticeForm] = useState({ subject: '', grade: '', description: '' })
  const [practiceQuestions, setPracticeQuestions] = useState([{ question: '', options: '', answer: '' }])
  const [editingPracticeId, setEditingPracticeId] = useState(null)
  const [practiceLoading, setPracticeLoading] = useState(false)
  const [practiceError, setPracticeError] = useState('')
  const [practiceSuccess, setPracticeSuccess] = useState('')

  useEffect(() => {
    fetchData()
    loadPracticeSets()
  }, [])

  const fetchData = async () => {
    try {
      const [materialsRes, usersRes] = await Promise.all([
        axios.get('/admin/materials'),
        axios.get('/admin/users')
      ])
      setMaterials(materialsRes.data)
      setUsers(usersRes.data)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPracticeSets = () => {
    setPracticeSets(readPracticeSets())
  }

  const formatYear = (year) => {
    if (!year) return 'N/A'
    return `${year.ec || '-'} EC / ${year.gc || '-'} GC`
  }

  const convertECtoGC = (year) => {
    return year ? Number(year) + 8 : ''
  }

  const handleMaterialChange = (e) => {
    const { name, value } = e.target
    if (name === 'yearEC') {
      setMaterialForm({
        ...materialForm,
        yearEC: value,
        yearGC: convertECtoGC(value)
      })
    } else {
      setMaterialForm({ ...materialForm, [name]: value })
    }
  }

  const handleMaterialFile = (e) => {
    setMaterialFile(e.target.files[0])
  }

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return
    try {
      await axios.delete(`/admin/materials/${id}`)
      setMaterials(materials.filter((m) => m._id !== id))
    } catch (error) {
      console.error('Error deleting material:', error)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await axios.delete(`/admin/users/${id}`)
      setUsers(users.filter((u) => u._id !== id))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleMaterialSubmit = async (e) => {
    e.preventDefault()
    if (!editingMaterialId && !materialFile) {
      setMaterialError('Please select a file to upload')
      return
    }

    setMaterialLoading(true)
    setMaterialError('')
    setMaterialSuccess('')

    try {
      const data = new FormData()
      data.append('title', materialForm.title)
      data.append('subject', materialForm.subject)
      if (materialForm.grade) data.append('grade', materialForm.grade)
      data.append('year[ec]', materialForm.yearEC)
      data.append('year[gc]', materialForm.yearGC)
      data.append('type', materialForm.type)
      if (materialFile) data.append('file', materialFile)

      if (editingMaterialId) {
        await updateMaterial(editingMaterialId, data)
        setMaterialSuccess('Material updated successfully')
        setEditingMaterialId(null)
      } else {
        await createMaterial(data)
        setMaterialSuccess('Material posted successfully')
      }

      setMaterialForm({ title: '', subject: '', grade: '', yearEC: '', yearGC: '', type: '' })
      setMaterialFile(null)
      await fetchData()
    } catch (err) {
      setMaterialError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setMaterialLoading(false)
    }
  }

  const startEditMaterial = (m) => {
    setActiveSection('post-material')
    setEditingMaterialId(m._id)
    setMaterialForm({
      title: m.title || '',
      subject: m.subject || '',
      grade: m.grade || '',
      yearEC: m.year?.ec || '',
      yearGC: m.year?.gc || '',
      type: m.type || ''
    })
    setMaterialFile(null)
  }

  const cancelEdit = () => {
    setEditingMaterialId(null)
    setMaterialForm({ title: '', subject: '', grade: '', yearEC: '', yearGC: '', type: '' })
    setMaterialFile(null)
    setMaterialError('')
    setMaterialSuccess('')
  }

  const handlePracticeChange = (e) => {
    const { name, value } = e.target
    setPracticeForm({ ...practiceForm, [name]: value })
  }

  const handlePracticeQuestionChange = (index, field, value) => {
    const updated = [...practiceQuestions]
    updated[index][field] = value
    setPracticeQuestions(updated)
  }

  const addPracticeQuestion = () => {
    setPracticeQuestions([...practiceQuestions, { question: '', options: '', answer: '' }])
  }

  const removePracticeQuestion = (index) => {
    if (practiceQuestions.length === 1) return
    const updated = practiceQuestions.filter((_, i) => i !== index)
    setPracticeQuestions(updated)
  }

  const handlePracticeEdit = (set) => {
    setEditingPracticeId(set.id)
    setPracticeForm({ subject: set.subject, grade: set.grade || '', description: set.description || '' })
    setPracticeQuestions(set.questions.map((q) => ({ question: q.question || '', options: Array.isArray(q.options) ? q.options.join(', ') : String(q.options), answer: q.answer || '' })))
    setPracticeError('')
    setPracticeSuccess('')
  }

  const handlePracticeDelete = (id) => {
    const updatedSets = practiceSets.filter((set) => set.id !== id)
    setPracticeSets(updatedSets)
    savePracticeSets(updatedSets)
  }

  const handlePracticeSubmit = (e) => {
    e.preventDefault()
    if (!practiceForm.subject.trim()) {
      setPracticeError('Please choose a subject for the practice set')
      return
    }
    if (!practiceForm.grade) {
      setPracticeError('Please choose the grade for this practice set')
      return
    }

    setPracticeLoading(true)
    setPracticeError('')
    setPracticeSuccess('')

    const cleanedQuestions = practiceQuestions
      .filter((item) => item.question.trim())
      .map((item) => ({
        question: item.question.trim(),
        options: item.options.split(',').map((opt) => opt.trim()).filter(Boolean),
        answer: item.answer.trim()
      }))

    if (!cleanedQuestions.length) {
      setPracticeError('Please add at least one question')
      setPracticeLoading(false)
      return
    }

    const updatedSet = {
      id: editingPracticeId || Date.now(),
      subject: practiceForm.subject.trim(),
      grade: practiceForm.grade,
      description: practiceForm.description.trim(),
      questions: cleanedQuestions
    }

    const updatedSets = editingPracticeId
      ? practiceSets.map((set) => (set.id === editingPracticeId ? updatedSet : set))
      : [updatedSet, ...practiceSets]

    setPracticeSets(updatedSets)
    savePracticeSets(updatedSets)
    setPracticeSuccess(editingPracticeId ? 'Practice set updated successfully' : 'Exam practice set created successfully')
    setPracticeForm({ subject: '', grade: '', description: '' })
    setPracticeQuestions([{ question: '', options: '', answer: '' }])
    setEditingPracticeId(null)
    setPracticeLoading(false)
  }

  if (loading) return <div className="admin-loading">Loading...</div>

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div>
          <h2 className="admin-sidebar-title">Admin Center</h2>
          <p className="admin-sidebar-sub">Manage everything in one place</p>
        </div>

        <nav className="admin-nav">
          <button className={`admin-nav-btn ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => setActiveSection('overview')}>
            📊 Overview
          </button>
          <button className={`admin-nav-btn ${activeSection === 'users' ? 'active' : ''}`} onClick={() => setActiveSection('users')}>
            👤 Users ({users.length})
          </button>
          <button className={`admin-nav-btn ${activeSection === 'materials' ? 'active' : ''}`} onClick={() => setActiveSection('materials')}>
            📚 Materials ({materials.length})
          </button>
          <button className={`admin-nav-btn ${activeSection === 'post-material' ? 'active' : ''}`} onClick={() => setActiveSection('post-material')}>
            ➕ Post Material
          </button>
          <button className={`admin-nav-btn ${activeSection === 'exam-practice' ? 'active' : ''}`} onClick={() => setActiveSection('exam-practice')}>
            📝 Create Exam Practice
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Admin Panel</h1>
            <p className="admin-sub">Manage users, posted materials, uploads and exam practice</p>
          </div>
        </div>

        {activeSection === 'overview' && (
          <div className="admin-overview-grid">
            <div className="admin-card">
              <p className="admin-card-label">Registered Users</p>
              <h3 className="admin-card-value">{users.length}</h3>
            </div>
            <div className="admin-card">
              <p className="admin-card-label">Posted Materials</p>
              <h3 className="admin-card-value">{materials.length}</h3>
            </div>
            <div className="admin-card">
              <p className="admin-card-label">Exam Practice Sets</p>
              <h3 className="admin-card-value">{practiceSets.length}</h3>
            </div>

            <div className="admin-card admin-card-wide">
              <h3 className="admin-card-title">Quick Actions</h3>
              <div className="admin-action-row">
                <button className="admin-action-btn" onClick={() => setActiveSection('users')}>View users</button>
                <button className="admin-action-btn" onClick={() => setActiveSection('materials')}>View materials</button>
                <button className="admin-action-btn" onClick={() => setActiveSection('post-material')}>Post new material</button>
                <button className="admin-action-btn" onClick={() => setActiveSection('exam-practice')}>Create practice set</button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3>Users</h3>
              <span>{users.length} total</span>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={`admin-role ${u.role}`}>{u.role}</span></td>
                      <td>{u.isVerified ? '✅' : '❌'}</td>
                      <td>
                        {u.role !== 'admin' && (
                          <button className="admin-delete-btn" onClick={() => handleDeleteUser(u._id)}>
                            🗑 Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'materials' && (
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3>Posted Materials</h3>
              <span>{materials.length} total</span>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Subject</th>
                    <th>Year</th>
                    <th>Uploaded By</th>
                    <th>Upvotes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => (
                    <tr key={m._id}>
                      <td>{m.title}</td>
                      <td>{m.subject}</td>
                      <td>{formatYear(m.year)}</td>
                      <td>{m.uploadedBy?.name || 'Unknown'}</td>
                      <td>▲ {m.upvotes?.length || 0}</td>
                      <td>
                        <button className="admin-link-btn" onClick={() => startEditMaterial(m)}>
                          ✏️ Edit
                        </button>
                        <button className="admin-delete-btn" onClick={() => handleDeleteMaterial(m._id)}>
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'post-material' && (
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3>Post Material</h3>
              <span>Upload a study resource</span>
            </div>

            {materialError && <div className="alert alert-error">{materialError}</div>}
            {materialSuccess && <div className="alert alert-success">{materialSuccess}</div>}

            <form className="admin-form" onSubmit={handleMaterialSubmit}>
              <div className="admin-form-grid">
                <label className="admin-field">
                  <span>Title</span>
                  <input type="text" name="title" value={materialForm.title} onChange={handleMaterialChange} required />
                </label>

                <label className="admin-field">
                  <span>Subject</span>
                  <select name="subject" value={materialForm.subject} onChange={handleMaterialChange} required>
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
                    <option>Summary notes</option>
                  </select>
                </label>

                <label className="admin-field">
                  <span>Year EC</span>
                  <input type="number" name="yearEC" value={materialForm.yearEC} onChange={handleMaterialChange} required />
                </label>

                <label className="admin-field">
                  <span>Year GC</span>
                  <input type="number" name="yearGC" value={materialForm.yearGC} readOnly />
                </label>

                <label className="admin-field">
                  <span>Type</span>
                  <select name="type" value={materialForm.type} onChange={handleMaterialChange} required>
                    <option value="">Select type</option>
                    <option>Past exam question</option>
                    <option>Summary notes</option>
                    <option>Study tips</option>
                  </select>
                </label>

                <label className="admin-field">
                  <span>File</span>
                  <input type="file" accept=".pdf,image/*" onChange={handleMaterialFile} {...(editingMaterialId ? {} : { required: true })} />
                </label>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="admin-submit-btn" type="submit" disabled={materialLoading}>
                  {materialLoading ? (editingMaterialId ? 'Updating...' : 'Posting...') : (editingMaterialId ? 'Update Material' : 'Post Material')}
                </button>
                {editingMaterialId && (
                  <button type="button" className="admin-secondary-btn" onClick={cancelEdit}>Cancel</button>
                )}
              </div>
            </form>
          </div>
        )}

        {activeSection === 'exam-practice' && (
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h3>Create Exam Practice</h3>
              <span>Build a new practice set</span>
            </div>

            {practiceError && <div className="alert alert-error">{practiceError}</div>}
            {practiceSuccess && <div className="alert alert-success">{practiceSuccess}</div>}

            <form className="admin-form" onSubmit={handlePracticeSubmit}>
              <div className="admin-form-grid">
                <label className="admin-field">
                  <span>Subject</span>
                  <select name="subject" value={practiceForm.subject} onChange={handlePracticeChange} required>
                    <option value="">Select a subject</option>
                    {examSubjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </label>

                <label className="admin-field">
                  <span>For Grade</span>
                  <select name="grade" value={practiceForm.grade} onChange={handlePracticeChange} required>
                    <option value="">Select grade</option>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </label>

                <label className="admin-field admin-field-full">
                  <span>Description</span>
                  <textarea name="description" rows="3" value={practiceForm.description} onChange={handlePracticeChange} placeholder="Short description of the set" />
                </label>
              </div>

              <div className="admin-question-list">
                {practiceQuestions.map((item, index) => (
                  <div className="admin-question-card" key={index}>
                    <div className="admin-question-head">
                      <h4>Question {index + 1}</h4>
                      {practiceQuestions.length > 1 && (
                        <button type="button" className="admin-link-btn" onClick={() => removePracticeQuestion(index)}>Remove</button>
                      )}
                    </div>

                    <label className="admin-field admin-field-full">
                      <span>Question</span>
                      <textarea rows="2" value={item.question} onChange={(e) => handlePracticeQuestionChange(index, 'question', e.target.value)} required />
                    </label>

                    <label className="admin-field admin-field-full">
                      <span>Options (comma separated)</span>
                      <input type="text" value={item.options} onChange={(e) => handlePracticeQuestionChange(index, 'options', e.target.value)} placeholder="Option A, Option B, Option C" />
                    </label>

                    <label className="admin-field admin-field-full">
                      <span>Correct Answer</span>
                      <input type="text" value={item.answer} onChange={(e) => handlePracticeQuestionChange(index, 'answer', e.target.value)} placeholder="Enter correct answer" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="admin-action-row">
                <button type="button" className="admin-secondary-btn" onClick={addPracticeQuestion}>+ Add Question</button>
                <button className="admin-submit-btn" type="submit" disabled={practiceLoading}>
                  {practiceLoading ? (editingPracticeId ? 'Saving...' : 'Creating...') : (editingPracticeId ? 'Save Practice Set' : 'Create Exam Practice')}
                </button>
              </div>
            </form>

            {practiceSets.length > 0 && (
              <div className="admin-practice-list">
                <h3 className="admin-card-title">Created Practice Sets</h3>
                {practiceSets.map((set) => (
                  <div className="admin-practice-item" key={set.id}>
                    <div>
                      <strong>{set.subject}</strong>
                      <p>{set.description || `${set.questions.length} custom questions`}</p>
                      <small>{set.grade}</small>
                    </div>
                    <div className="admin-practice-actions">
                      <button type="button" className="admin-link-btn" onClick={() => handlePracticeEdit(set)}>Edit</button>
                      <button type="button" className="admin-link-btn" onClick={() => handlePracticeDelete(set.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminPanel