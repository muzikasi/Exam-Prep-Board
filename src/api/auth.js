import axios from './axios.js'

export const registerUser = async (data) => {
  const response = await axios.post('/auth/register', data)
  return response.data
}

export const loginUser = async (data) => {
  const response = await axios.post('/auth/login', data)
  return response.data
}

export const verifyEmailToken = async (token) => {
  const response = await axios.get(`/auth/verify-email/${token}`)
  return response.data
}

export const verifyOTP = async (data) => {
  const response = await axios.post('/auth/verify-otp', data)
  return response.data
}

export const getProfile = async () => {
  const response = await axios.get('/auth/profile')
  return response.data
}

export const resendOTPCode = async (data) => {
  const response = await axios.post('/auth/resend-otp', data)
  return response.data
}