import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, verifyOTP, resendOTPCode } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/Login.css'

const RESEND_WAIT_SECONDS = 60
const RESEND_EXPIRY_KEY = 'loginOtpResendExpiry'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  // OTP verification flow (shown when login fails due to unverified account)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [otpMessage, setOtpMessage] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  // null = "not yet determined", avoids a flash before we read localStorage
  const [resendCountdown, setResendCountdown] = useState(null)
  const intervalRef = useRef(null)

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

  // When we enter the OTP screen, resolve countdown from storage (or start fresh)
  useEffect(() => {
    if (!needsVerification) return
    const hasExpiry = localStorage.getItem(RESEND_EXPIRY_KEY)
    if (hasExpiry) {
      setResendCountdown(getRemainingSeconds())
    } else {
      startCountdown(RESEND_WAIT_SECONDS)
    }
  }, [needsVerification])

  // Tick every second, recomputing from the stored timestamp (survives reload/backgrounding)
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await loginUser(formData)
      login(data, data.token)
      navigate('/dashboard')
    } catch (err) {
      const res = err.response?.data

      if (res?.needsVerification) {
        // Account exists but isn't verified — backend already sent a fresh OTP,
        // so the resend countdown starts now too.
        setNeedsVerification(true)
        setOtpMessage(res.message || 'We sent a verification code to your email.')
        setError('')
        startCountdown(RESEND_WAIT_SECONDS)
      } else {
        setError(res?.message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setOtpLoading(true)
    setOtpError('')

    try {
      await verifyOTP({ email: formData.email, otp })
      localStorage.removeItem(RESEND_EXPIRY_KEY)
      // Verified — now log them in with the credentials they already entered
      const data = await loginUser(formData)
      login(data, data.token)
      navigate('/dashboard')
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired code')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return
    setResendLoading(true)
    setOtpError('')
    setOtpMessage('')

    try {
      const data = await resendOTPCode({ email: formData.email })
      setOtpMessage(data.message || 'A new code has been sent to your email.')
      startCountdown(RESEND_WAIT_SECONDS)
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Could not resend code')
    } finally {
      setResendLoading(false)
    }
  }

  if (needsVerification) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Verify Your Email</h2>
          <p className="login-sub">
            Enter the 6-digit code sent to <strong>{formData.email}</strong>
          </p>

          {otpMessage && <div className="alert alert-success">{otpMessage}</div>}
          {otpError && <div className="alert alert-error">{otpError}</div>}

          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label>Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6 digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={otpLoading || otp.length !== 6}>
              {otpLoading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>

          <div className="login-link" style={{ marginTop: 12 }}>
            {resendCountdown === null ? null : resendCountdown > 0 ? (
              <p>
                Resend code in <strong>{resendCountdown}s</strong>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
              >
                {resendLoading ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>

          <p className="login-link">
            <button
              type="button"
              onClick={() => setNeedsVerification(false)}
              style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
            >
              ← Back to login
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-sub">Login to access your study materials</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="forgot-row">
            <Link to="/reset-password" className="forgot-link">Forgot password?</Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="login-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login