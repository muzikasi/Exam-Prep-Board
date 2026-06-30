import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyOTP, resendOTPCode } from '../api/auth.js'
import '../styles/VerifyEmail.css'

const RESEND_WAIT_SECONDS = 60
const RESEND_EXPIRY_KEY = 'resendExpiry'

function VerifyEmail() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendSuccess, setResendSuccess] = useState('')
  // null = "not yet determined" (avoids a flash of the Resend button before we read storage)
  const [resendCountdown, setResendCountdown] = useState(null)
  const navigate = useNavigate()
  const intervalRef = useRef(null)

  // Reads the stored expiry timestamp and returns seconds remaining (>= 0)
  const getRemainingSeconds = () => {
    const savedExpiry = localStorage.getItem(RESEND_EXPIRY_KEY)
    if (!savedExpiry) return 0
    const remaining = Math.ceil((parseInt(savedExpiry, 10) - Date.now()) / 1000)
    return remaining > 0 ? remaining : 0
  }

  const startCountdown = (seconds) => {
    const expiry = Date.now() + seconds * 1000
    localStorage.setItem(RESEND_EXPIRY_KEY, expiry.toString())
    setResendCountdown(seconds)
  }

  // On mount: load email, then resolve countdown from storage (or start fresh if none saved)
  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingEmail')
    if (pendingEmail) setEmail(pendingEmail)

    const hasExpiry = localStorage.getItem(RESEND_EXPIRY_KEY)
    if (hasExpiry) {
      setResendCountdown(getRemainingSeconds())
    } else {
      startCountdown(RESEND_WAIT_SECONDS)
    }
  }, [])

  // Tick every second, always recomputing from the stored timestamp rather than
  // just decrementing in-memory state — this keeps it accurate even if the tab
  // was backgrounded/throttled, and removes the expiry key once it hits 0.
  useEffect(() => {
    if (resendCountdown === null || resendCountdown <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      const remaining = getRemainingSeconds()
      setResendCountdown(remaining)
      if (remaining <= 0) {
        localStorage.removeItem(RESEND_EXPIRY_KEY)
        clearInterval(intervalRef.current)
      }
    }, 1000)

    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resendCountdown === null])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const data = await verifyOTP({ email, otp })
      setSuccess(data.message)
      localStorage.removeItem('pendingEmail')
      localStorage.removeItem(RESEND_EXPIRY_KEY)
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
      startCountdown(RESEND_WAIT_SECONDS)
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
          {resendCountdown === null ? null : resendCountdown > 0 ? (
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