import axios from './axios.js'

export const getMaterials = async (params) => {
  const response = await axios.get('/materials', { params })
  return response.data
}

export const getMaterial = async (id) => {
  const response = await axios.get(`/materials/${id}`)
  return response.data
}

export const createMaterial = async (formData) => {
  const response = await axios.post('/materials', formData)
  return response.data
}

export const updateMaterial = async (id, data) => {
  const response = await axios.put(`/materials/${id}`, data)
  return response.data
}

export const deleteMaterial = async (id) => {
  const response = await axios.delete(`/materials/${id}`)
  return response.data
}

export const upvoteMaterial = async (id) => {
  const response = await axios.put(`/materials/${id}/upvote`)
  return response.data
}