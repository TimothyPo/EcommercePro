import api from '@/services/api'

const state = {
  products: [],
  product: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  totalProducts: 0
}

const getters = {
  getAllProducts: state => state.products,
  getProduct: state => state.product,
  isLoading: state => state.isLoading,
  getError: state => state.error,
  getSearchQuery: state => state.searchQuery,
  getTotalProducts: state => state.totalProducts
}

const actions = {
  // Fetch all products or search results
  async fetchProducts({ commit, state }, { query = state.searchQuery, page = 1 } = {}) {
    commit('SET_LOADING', true)
    
    try {
      let url = '/api/products/'
      
      // Add search params if provided
      if (query) {
        url += `?search=${query}`
      }
      
      const response = await api.get(url)
      
      commit('SET_PRODUCTS', response.data)
      commit('SET_SEARCH_QUERY', query)
      return response.data
    } catch (error) {
      commit('SET_ERROR', 'Failed to fetch products. Please try again.')
      return []
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Fetch single product by ID
  async fetchProduct({ commit }, productId) {
    commit('SET_LOADING', true)
    
    try {
      const response = await api.get(`/api/products/${productId}/`)
      commit('SET_PRODUCT', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', 'Failed to fetch product details. Please try again.')
      return null
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Create a new product (employee only)
  async createProduct({ commit }, productData) {
    commit('SET_LOADING', true)
    
    try {
      const response = await api.post('/api/products/', productData)
      return { success: true, product: response.data }
    } catch (error) {
      const errorMessage = 'Failed to create product. Please check the form and try again.'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Update an existing product (employee only)
  async updateProduct({ commit }, { productId, productData }) {
    commit('SET_LOADING', true)
    
    try {
      const response = await api.put(`/api/products/${productId}/`, productData)
      return { success: true, product: response.data }
    } catch (error) {
      const errorMessage = 'Failed to update product. Please check the form and try again.'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Delete a product (employee only)
  async deleteProduct({ commit }, productId) {
    commit('SET_LOADING', true)
    
    try {
      await api.delete(`/api/products/${productId}/`)
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete product. Please try again.'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Set search query
  setSearchQuery({ commit }, query) {
    commit('SET_SEARCH_QUERY', query)
  }
}

const mutations = {
  SET_PRODUCTS(state, products) {
    state.products = products
    state.totalProducts = products.length
  },
  
  SET_PRODUCT(state, product) {
    state.product = product
  },
  
  SET_LOADING(state, status) {
    state.isLoading = status
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  SET_SEARCH_QUERY(state, query) {
    state.searchQuery = query
  },
  
  CLEAR_PRODUCT(state) {
    state.product = null
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
