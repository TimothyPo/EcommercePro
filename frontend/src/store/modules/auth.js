import api from '@/services/api'
import router from '@/router'

const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  isLoading: false,
  error: null
}

const getters = {
  isAuthenticated: state => !!state.token,
  isEmployee: state => state.user && state.user.profile && state.user.profile.is_employee,
  getUser: state => state.user,
  getError: state => state.error,
  isLoading: state => state.isLoading
}

const actions = {
  // Initialize auth state from local storage
  initAuth({ commit }) {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user'))
    
    if (token && user) {
      commit('SET_AUTH', { token, user })
    }
  },
  
  // Login action
  async login({ commit }, credentials) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      const response = await api.post('/api/token/', credentials)
      const token = response.data.access
      
      // Set token in Axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Get user profile
      const userResponse = await api.get('/api/profile/')
      const user = userResponse.data
      
      // Save to localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      commit('SET_AUTH', { token, user })
      
      // Redirect based on user type
      if (user.profile.is_employee) {
        router.push('/admin/dashboard')
      } else {
        // Redirect to intended destination or home page
        const redirectPath = router.currentRoute.value.query.redirect || '/'
        router.push(redirectPath)
      }
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Register action
  async register({ commit }, userData) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    
    try {
      await api.post('/api/auth/register/', userData)
      
      // Auto-login after registration
      const loginCredentials = {
        username: userData.username,
        password: userData.password
      }
      
      commit('SET_LOADING', false)
      return this.dispatch('auth/login', loginCredentials)
    } catch (error) {
      const errors = error.response?.data || { detail: 'Registration failed. Please try again.' }
      
      // Format errors for display
      let errorMessage = ''
      for (const key in errors) {
        if (Array.isArray(errors[key])) {
          errorMessage += `${key}: ${errors[key].join(', ')}\n`
        } else {
          errorMessage += `${key}: ${errors[key]}\n`
        }
      }
      
      commit('SET_ERROR', errorMessage)
      commit('SET_LOADING', false)
      return { success: false, error: errorMessage }
    }
  },
  
  // Logout action
  logout({ commit }) {
    // Remove token from axios headers
    delete api.defaults.headers.common['Authorization']
    
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Reset state
    commit('RESET_AUTH')
    
    // Redirect to login
    router.push('/login')
  },
  
  // Update profile
  async updateProfile({ commit, state }, profileData) {
    commit('SET_LOADING', true)
    
    try {
      const response = await api.patch('/api/profile/', profileData)
      
      // Update local storage with new user data
      const updatedUser = {
        ...state.user,
        profile: response.data
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser))
      commit('SET_USER', updatedUser)
      
      return { success: true }
    } catch (error) {
      const errorMessage = 'Failed to update profile. Please try again.'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const mutations = {
  SET_AUTH(state, { token, user }) {
    state.token = token
    state.user = user
    
    // Set token in Axios headers for future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  },
  
  SET_USER(state, user) {
    state.user = user
  },
  
  SET_LOADING(state, status) {
    state.isLoading = status
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  RESET_AUTH(state) {
    state.token = null
    state.user = null
    state.error = null
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
