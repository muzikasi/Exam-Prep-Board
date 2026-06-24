import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyOTP } from '../api/auth.js'
import '../styles/VerifyEmail.css'

function VerifyEmail() {
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const data = await verifyOTP({ email, otp })
            setSuccess(data.message)
            setTimeout(() => {
                navigate('/login')
            }, 2000)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="verify-container">
            <div className="verify-card">
                <div className="verify-icon">📧</div>
                <h2 className="verify-title">Verify Your Email</h2>
                <p className="verify-sub">
                    Enter your email and the OTP code we sent you
                </p>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

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

                <p className="verify-link">
                    Didn't receive the code? <a href="/register">Register again</a>
                </p>
            </div>
        </div>
    )
}

export default VerifyEmail