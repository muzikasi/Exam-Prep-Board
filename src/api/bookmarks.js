import axios from './axios.js'

export const getBookmarks = async () => {
  const response = await axios.get('/bookmarks')
  return response.data
}

export const addBookmark = async (id) => {
  const response = await axios.post(`/bookmarks/${id}`)
  return response.data
}

export const removeBookmark = async (id) => {
  const response = await axios.delete(`/bookmarks/${id}`)
  return response.data
}