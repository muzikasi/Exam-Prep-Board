import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword, resetPassword } from '../api/auth.js'
import '../styles/Register.css'

const RESET_STAGE_KEY = 'resetPasswordStage'
const RESET_EMAIL_KEY = 'resetPasswordEmail'
const RESET_CODE_KEY = 'resetPasswordCode'

function ResetPassword() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [stage, setStage] = useState('email') // email | verify | reset | done
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const navigate = useNavigate()

  const resendTimerRef = useRef(null)
  const errorTimerRef = useRef(null)
  const messageTimerRef = useRef(null)

  useEffect(() => {
    const storedStage = sessionStorage.getItem(RESET_STAGE_KEY)
    const storedEmail = sessionStorage.getItem(RESET_EMAIL_KEY)
    const storedCode = sessionStorage.getItem(RESET_CODE_KEY)

    if (storedEmail) {
      setEmail(storedEmail)
      setStage(storedStage || 'verify')
    }

    if (storedCode) {
      setCode(storedCode)
    }

    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current)
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!error) return
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    errorTimerRef.current = setTimeout(() => setError(''), 10000)
    return () => clearTimeout(errorTimerRef.current)
  }, [error])

  useEffect(() => {
    if (!message) return
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current)
    messageTimerRef.current = setTimeout(() => setMessage(''), 10000)
    return () => clearTimeout(messageTimerRef.current)
  }, [message])

  useEffect(() => {
    if (stage === 'verify' || stage === 'reset') {
      sessionStorage.setItem(RESET_STAGE_KEY, stage)
    }
  }, [stage])

  useEffect(() => {
    if (email) {
      sessionStorage.setItem(RESET_EMAIL_KEY, email)
    }
  }, [email])

  useEffect(() => {
    if (code) {
      sessionStorage.setItem(RESET_CODE_KEY, code)
    }
  }, [code])

  useEffect(() => {
    if (resendCountdown <= 0) {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current)
        resendTimerRef.current = null
      }
      return
    }

    resendTimerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(resendTimerRef.current)
          resendTimerRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current)
    }
  }, [resendCountdown])

  const startResendCountdown = () => {
    setResendCountdown(60)
  }

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }
    setLoading(true)
    try {
      await forgotPassword({ email })
      setMessage('A reset code has been sent to your email.')
      setStage('verify')
      startResendCountdown()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')
    if (!code.trim()) {
      setError('Please enter the reset code sent to your email.')
      return
    }
    setLoading(true)
    try {
      // The server validates the code on final reset, so proceed to the password screen.
      setMessage('Code entered. Please enter a new password.')
      setStage('reset')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const lengthOk = password.length >= 8
    const casesOk = /[a-z]/.test(password) && /[A-Z]/.test(password)
    const numberOk = /[0-9]/.test(password)
    const specialOk = /[^a-zA-Z0-9]/.test(password)

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.')
      return
    }

    if (!lengthOk || !casesOk || !numberOk || !specialOk) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await resetPassword({
        email,
        resetCode: code,
        newPassword: password,
        confirmPassword
      })
      setMessage('Password changed successfully.')
      setStage('done')
      sessionStorage.removeItem(RESET_STAGE_KEY)
      sessionStorage.removeItem(RESET_EMAIL_KEY)
      sessionStorage.removeItem(RESET_CODE_KEY)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email.trim()) return
    setError('')
    setCode('')
    setLoading(true)
    try {
      await forgotPassword({ email })
      setMessage('A new reset code has been sent.')
      setStage('verify')
      startResendCountdown()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeEmail = () => {
    setStage('email')
    setCode('')
    setMessage('')
    setError('')
    sessionStorage.removeItem(RESET_STAGE_KEY)
    sessionStorage.removeItem(RESET_EMAIL_KEY)
    sessionStorage.removeItem(RESET_CODE_KEY)
  }

  const calculatePasswordStrength = (pwd) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength++
    if (pwd.match(/[0-9]/)) strength++
    if (pwd.match(/[^a-zA-Z0-9]/)) strength++
    return strength
  }

  const passwordRequirements = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Uppercase and lowercase letters', ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'At least one number', ok: /[0-9]/.test(password) },
    { label: 'At least one special character', ok: /[^a-zA-Z0-9]/.test(password) }
  ]

  const strength = calculatePasswordStrength(password)

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Forgot Password</h2>
        <p className="register-sub">A secure flow to reset your password</p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && stage !== 'done' && <div className="alert alert-success">{message}</div>}

        {stage === 'email' && (
          <form onSubmit={handleSendCode}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button className="register-btn" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send code'}</button>
          </form>
        )}

        {stage === 'verify' && (
          <form onSubmit={handleVerifyCode}>
            <p style={{ color: '#aaa', fontSize: 13, marginBottom: 16 }}>
              We’ve sent a 6-digit code to your email. Enter it below and press Next to verify it.
            </p>

            <div className="form-group">
              <label>Email</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="email" value={email} readOnly style={{ backgroundColor: '#131d27', cursor: 'not-allowed' }} />
                <button type="button" className="resend-btn" onClick={handleChangeEmail} disabled={loading}>Change email</button>
              </div>
            </div>

            <div className="form-group">
              <label>Reset code</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter 6-digit reset code" required />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                {resendCountdown > 0 ? (
                  <span style={{ color: '#aaa', fontSize: 12 }}>Resend available in {resendCountdown}s</span>
                ) : (
                  <button type="button" className="resend-btn" onClick={handleResend} disabled={loading}>Resend code</button>
                )}
              </div>
            </div>

            <button className="register-btn" type="submit" disabled={loading}>{loading ? 'Checking...' : 'Next'}</button>
          </form>
        )}

        {stage === 'reset' && (
          <form onSubmit={handleResetSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="password-strength">
              <div className="strength-bar">
                <div className="strength-fill" style={{ width: `${(strength / 4) * 100}%`, backgroundColor: strength >= 3 ? '#52c41a' : strength === 2 ? '#faad14' : '#ff6b6b' }} />
              </div>
              <span className="strength-label">{['', 'Weak', 'Fair', 'Good', 'Strong'][strength]}</span>
            </div>

            <div className="password-requirements">
              {passwordRequirements.map((req) => (
                <p key={req.label} style={{ color: req.ok ? '#52c41a' : '#ff4d4f' }}>
                  {req.ok ? '✓' : '✗'} {req.label}
                </p>
              ))}
            </div>

            <button className="register-btn" type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Change password'}</button>
          </form>
        )}

        {stage === 'done' && (
          <div style={{ textAlign: 'center', padding: 12 }}>
            <p className="alert alert-success">{message || 'Password reset successful'}</p>
            <p><button type="button" className="register-btn" onClick={() => navigate('/login')}>Return to login</button></p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
