import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Cart from '../views/Cart.vue'
import Checkout from '../views/Checkout.vue'
import OrderSummary from '../views/OrderSummary.vue'
import Dashboard from '../views/admin/Dashboard.vue'
import ProductManagement from '../views/admin/ProductManagement.vue'
import CheckoutMonitoring from '../views/admin/CheckoutMonitoring.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    props: true
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: { requiresAuth: true, customerOnly: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
    meta: { requiresAuth: true, customerOnly: true }
  },
  {
    path: '/order-summary/:id',
    name: 'OrderSummary',
    component: OrderSummary,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, employeeOnly: true }
  },
  {
    path: '/admin/products',
    name: 'ProductManagement',
    component: ProductManagement,
    meta: { requiresAuth: true, employeeOnly: true }
  },
  {
    path: '/admin/checkouts',
    name: 'CheckoutMonitoring',
    component: CheckoutMonitoring,
    meta: { requiresAuth: true, employeeOnly: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Always scroll to top
    return { top: 0 }
  }
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const isEmployee = store.getters['auth/isEmployee']

  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else if (to.matched.some(record => record.meta.employeeOnly) && !isEmployee) {
      next({ path: '/' }) // Redirect to home if not an employee
    } else if (to.matched.some(record => record.meta.customerOnly) && isEmployee) {
      next({ path: '/admin/dashboard' }) // Redirect to dashboard if employee tries to access customer pages
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.guestOnly) && isAuthenticated) {
    // Redirect authenticated users away from guest-only pages
    next(isEmployee ? '/admin/dashboard' : '/')
  } else {
    next()
  }
})

export default router
