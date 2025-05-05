import api from '@/services/api'
import router from '@/router'

const state = {
  cart: null,
  isLoading: false,
  error: null
}

const getters = {
  getCart: state => state.cart,
  getCartItems: state => state.cart?.items || [],
  getCartTotal: state => state.cart?.total_price || 0,
  getItemCount: state => {
    if (!state.cart || !state.cart.items) return 0
    return state.cart.items.reduce((total, item) => total + item.quantity, 0)
  },
  isLoading: state => state.isLoading,
  getError: state => state.error
}

const actions = {
  // Fetch cart
  async fetchCart({ commit, rootGetters }) {
    if (!rootGetters['auth/isAuthenticated']) return null
    
    commit('SET_LOADING', true)
    
    try {
      const response = await api.get('/api/cart/')
      commit('SET_CART', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching cart:', error)
      commit('SET_ERROR', 'Failed to fetch cart. Please try again.')
      return null
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Add item to cart
  async addToCart({ commit, dispatch }, { productId, quantity = 1 }) {
    commit('SET_LOADING', true)
    
    try {
      const response = await api.post('/api/cart/add_item/', { product_id: productId, quantity })
      
      // Refresh cart after adding
      await dispatch('fetchCart')
      
      return { success: true, item: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to add item to cart. Please try again.'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Remove item from cart
  async removeFromCart({ commit, dispatch }, productId) {
    commit('SET_LOADING', true)
    
    try {
      await api.post('/api/cart/remove_item/', { product_id: productId })
      
      // Refresh cart after removing
      await dispatch('fetchCart')
      
      return { success: true }
    } catch (error) {
      const errorMessage = 'Failed to remove item from cart. Please try again.'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Update item quantity
  async updateQuantity({ commit, dispatch }, { productId, quantity }) {
    commit('SET_LOADING', true)
    
    try {
      await api.post('/api/cart/update_quantity/', { product_id: productId, quantity })
      
      // Refresh cart after updating
      await dispatch('fetchCart')
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update quantity. Please try again.'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Clear cart
  async clearCart({ commit, dispatch }) {
    commit('SET_LOADING', true)
    
    try {
      await api.post('/api/cart/clear/')
      
      // Refresh cart after clearing
      await dispatch('fetchCart')
      
      return { success: true }
    } catch (error) {
      const errorMessage = 'Failed to clear cart. Please try again.'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Checkout
  async checkout({ commit, dispatch }, { shippingAddress }) {
    commit('SET_LOADING', true)
    
    try {
      const response = await api.post('/api/cart/checkout/', { shipping_address: shippingAddress })
      
      // Refresh cart after checkout
      await dispatch('fetchCart')
      
      // Navigate to order summary
      router.push(`/order-summary/${response.data.id}`)
      
      return { success: true, order: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Checkout failed. Please try again.'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const mutations = {
  SET_CART(state, cart) {
    state.cart = cart
  },
  
  SET_LOADING(state, status) {
    state.isLoading = status
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  CLEAR_CART(state) {
    state.cart = null
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
