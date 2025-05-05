import api from '@/services/api'

const state = {
  orders: [],
  order: null,
  isLoading: false,
  error: null
}

const getters = {
  getAllOrders: state => state.orders,
  getOrder: state => state.order,
  isLoading: state => state.isLoading,
  getError: state => state.error
}

const actions = {
  // Fetch all orders
  async fetchOrders({ commit }, { startDate, endDate } = {}) {
    commit('SET_LOADING', true)
    
    try {
      let url = '/api/orders/'
      
      // Add date filtering if provided
      if (startDate && endDate) {
        url += `?created_at__gte=${startDate}&created_at__lte=${endDate}`
      } else if (startDate) {
        url += `?created_at__gte=${startDate}`
      } else if (endDate) {
        url += `?created_at__lte=${endDate}`
      }
      
      const response = await api.get(url)
      commit('SET_ORDERS', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', 'Failed to fetch orders. Please try again.')
      return []
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // Fetch single order by ID
  async fetchOrder({ commit }, orderId) {
    commit('SET_LOADING', true)
    
    try {
      const response = await api.get(`/api/orders/${orderId}/`)
      commit('SET_ORDER', response.data)
      return response.data
    } catch (error) {
      commit('SET_ERROR', 'Failed to fetch order details. Please try again.')
      return null
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const mutations = {
  SET_ORDERS(state, orders) {
    state.orders = orders
  },
  
  SET_ORDER(state, order) {
    state.order = order
  },
  
  SET_LOADING(state, status) {
    state.isLoading = status
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  CLEAR_ORDER(state) {
    state.order = null
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
