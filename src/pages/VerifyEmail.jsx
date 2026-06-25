import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyOTP, resendOTPCode } from '../api/auth.js'
import '../styles/VerifyEmail.css'

function VerifyEmail() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendSuccess, setResendSuccess] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingEmail')
    if (pendingEmail) setEmail(pendingEmail)

    // Check resend countdown from sessionStorage
    const savedResend = sessionStorage.getItem('resendExpiry')
    if (savedResend) {
      const remaining = Math.floor((parseInt(savedResend) - Date.now()) / 1000)
      if (remaining > 0) setResendCountdown(remaining)
    } else {
      // First time — start 60sec countdown immediately
      const resendExpiry = Date.now() + 60 * 1000
      sessionStorage.setItem('resendExpiry', resendExpiry.toString())
      setResendCountdown(60)
    }
  }, [])

  // Resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = setInterval(() => {
      setResendCountdown(prev => {
        const next = prev - 1
        if (next <= 0) { clearInterval(timer); return 0 }
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCountdown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const data = await verifyOTP({ email, otp })
      setSuccess(data.message)
      localStorage.removeItem('pendingEmail')
      sessionStorage.removeItem('resendExpiry')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setResendSuccess('')
    setError('')

    try {
      const data = await resendOTPCode({ email })
      setResendSuccess(data.message)

      // Reset resend countdown
      const resendExpiry = Date.now() + 60 * 1000
      sessionStorage.setItem('resendExpiry', resendExpiry.toString())
      setResendCountdown(60)

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="verify-container">
      <div className="verify-card">
        <div className="verify-icon">📧</div>
        <h2 className="verify-title">Verify Your Email</h2>
        <p className="verify-sub">
          Enter the OTP code we sent to <strong style={{ color: '#4a6cf7' }}>{email}</strong>
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {resendSuccess && <div className="alert alert-success">{resendSuccess}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>OTP Code</label>
            <input
              type="text"
              placeholder="Enter 6 digit code"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              className="otp-input"
              required
            />
          </div>

          <button type="submit" className="verify-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="verify-resend">
          {resendCountdown > 0 ? (
            <p className="verify-resend-countdown">
              Resend code in <strong style={{ color: '#4a6cf7' }}>{resendCountdown}s</strong>
            </p>
          ) : (
            <button
              className="verify-resend-btn"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending...' : '🔄 Resend OTP'}
            </button>
          )}
        </div>

        <p className="verify-link">
          Wrong email? <a href="/register">Register again</a>
        </p>
      </div>
    </div>
  )
}

export default VerifyEmail