import { Navigate } from 'react-router-dom'

function ForgotPassword() {
  return <Navigate to="/reset-password" replace />
}

export default ForgotPassword

