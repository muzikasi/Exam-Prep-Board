import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth.js'
import '../styles/Register.css'

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    grade: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const navigate = useNavigate()

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    return strength
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const getPasswordStrengthLabel = () => {
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
    return labels[passwordStrength]
  }

  const getPasswordStrengthColor = () => {
    const colors = ['', '#ff6b6b', '#ffa940', '#faad14', '#52c41a']
    return colors[passwordStrength]
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required')
      return false
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!formData.grade) {
      setError('Please select your grade')
      return false
    }
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    if (passwordStrength < 2) {
      setError('Password must be stronger (include uppercase, lowercase, numbers/symbols)')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { confirmPassword, ...dataToSend } = formData
      const data = await registerUser(dataToSend)
      setSuccess(data.message)
      localStorage.setItem('pendingEmail', formData.email)
      setTimeout(() => {
        navigate('/verify-email')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Account</h2>
        <p className="register-sub">Join to share and access materials</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Grade</label>
            <select name="grade" value={formData.grade} onChange={handleChange} required>
              <option value="">Select your grade</option>
              <option value="grade 9">Grade 9</option>
              <option value="grade 10">Grade 10</option>
              <option value="grade 11">Grade 11</option>
              <option value="grade 12">Grade 12</option>
              <option value="university student">University student</option>
            </select>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{
                      width: `${(passwordStrength / 4) * 100}%`,
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  ></div>
                </div>
                <span 
                  className="strength-label"
                  style={{ color: getPasswordStrengthColor() }}
                >
                  {getPasswordStrengthLabel()}
                </span>
              </div>
            )}
            <div className="password-requirements">
              <p className={formData.password.length >= 8 ? 'valid' : 'invalid'}>
                ✓ At least 8 characters
              </p>
              <p className={formData.password.match(/[a-z]/) && formData.password.match(/[A-Z]/) ? 'valid' : 'invalid'}>
                ✓ Uppercase and lowercase letters
              </p>
              <p className={formData.password.match(/[0-9]/) ? 'valid' : 'invalid'}>
                ✓ At least one number
              </p>
              <p className={formData.password.match(/[^a-zA-Z0-9]/) ? 'valid' : 'invalid'}>
                ✓ At least one special character
              </p>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {formData.confirmPassword && (
              <div className={formData.password === formData.confirmPassword ? 'password-match valid' : 'password-match invalid'}>
                {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="register-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register