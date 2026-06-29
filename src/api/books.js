import axios from './axios.js'

export const getBooks = async () => {
  const response = await axios.get('/books')
  return response.data
}

export const getBookById = async (id) => {
  const response = await axios.get(`/books/${id}`)
  return response.data
}

export const createBook = async (data) => {
  const response = await axios.post('/books', data)
  return response.data
}

export const updateBook = async (id, data) => {
  const response = await axios.put(`/books/${id}`, data)
  return response.data
}

export const getBookSignedUrl = async (id) => {
  const response = await axios.get(`/books/${id}/signed-url`)
  return response.data
}

export const deleteBook = async (id) => {
  const response = await axios.delete(`/books/${id}`)
  return response.data
}
