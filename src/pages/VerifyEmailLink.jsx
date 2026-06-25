import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifyEmailToken } from '../api/auth.js'

function VerifyEmailLink() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      try {
        const data = await verifyEmailToken(token)
        setMessage(data.message)
        setStatus('success')
        setTimeout(() => navigate('/login'), 3000)
      } catch (err) {
        const errMsg = err.response?.data?.message || ''
        if (errMsg.includes('already verified')) {
          setStatus('success')
          setMessage('Email already verified! You can now login.')
        } else {
          setStatus('error')
        }
        setTimeout(() => navigate('/login'), 3000)
      }
    }
    verify()
  }, [token])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f1e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#1a1a2e',
        border: '1px solid #333',
        borderRadius: '16px',
        padding: '48px',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: 'white', fontSize: '20px', fontWeight: '600' }}>Verifying your email...</p>
            <p style={{ color: '#888', fontSize: '14px' }}>Please wait</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ color: 'white', fontSize: '22px', margin: '0 0 8px' }}>Email Verified!</h2>
            <p style={{ color: '#888', fontSize: '14px', margin: '0 0 24px' }}>
              {message || 'Your account is now active!'} Redirecting to login...
            </p>
            <div style={{
              background: '#1e1e3a',
              border: '1px solid #4a6cf7',
              borderRadius: '8px',
              padding: '12px',
              color: '#4a6cf7',
              fontSize: '14px'
            }}>
              ✅ You can now login to ExamBoard
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>😔</div>
            <h2 style={{ color: 'white', fontSize: '22px', margin: '0 0 8px' }}>Link Expired!</h2>
            <p style={{ color: '#888', fontSize: '14px', margin: '0 0 24px' }}>
              This verification link has expired. Redirecting...
            </p>
            <a href="/register" style={{
              display: 'block',
              background: '#4a6cf7',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Register again
            </a>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmailLink