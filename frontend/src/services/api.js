import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: '/', // This will use the relative URL which works with Vue's proxy configuration
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor for authentication
api.interceptors.request.use(
  config => {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // Handle session expiration or auth errors
    if (error.response && error.response.status === 401) {
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Redirect to login
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api
