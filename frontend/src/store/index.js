import { createStore } from 'vuex'
import auth from './modules/auth'
import products from './modules/products'
import cart from './modules/cart'
import orders from './modules/orders'

export default createStore({
  modules: {
    auth,
    products,
    cart,
    orders
  }
})
