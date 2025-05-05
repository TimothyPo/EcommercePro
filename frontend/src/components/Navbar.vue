<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm sticky-top">
    <div class="container">
      <router-link class="navbar-brand" to="/">
        <i class="bi bi-shop me-2"></i>
        E-Shop
      </router-link>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
        aria-controls="navbarNav" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Customer Nav Items -->
        <ul v-if="isAuthenticated && !isEmployee" class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Products</router-link>
          </li>
        </ul>
        
        <!-- Employee Nav Items -->
        <ul v-if="isAuthenticated && isEmployee" class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/admin/dashboard">Dashboard</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/admin/products">Products</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/admin/checkouts">Orders</router-link>
          </li>
        </ul>
        
        <!-- Guest Nav Items -->
        <ul v-if="!isAuthenticated" class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Products</router-link>
          </li>
        </ul>
        
        <!-- Auth Nav Items -->
        <ul class="navbar-nav ms-auto">
          <!-- Cart for customers -->
          <li v-if="isAuthenticated && !isEmployee" class="nav-item">
            <router-link class="nav-link position-relative" to="/cart">
              <i class="bi bi-cart fs-5"></i>
              <span 
                v-if="cartItemCount > 0" 
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              >
                {{ cartItemCount }}
              </span>
            </router-link>
          </li>
          
          <!-- Authentication Links -->
          <li v-if="!isAuthenticated" class="nav-item">
            <router-link class="nav-link" to="/login">
              <i class="bi bi-box-arrow-in-right me-1"></i>
              Login
            </router-link>
          </li>
          <li v-if="!isAuthenticated" class="nav-item">
            <router-link class="nav-link" to="/register">
              <i class="bi bi-person-plus me-1"></i>
              Register
            </router-link>
          </li>
          
          <!-- User Dropdown -->
          <li v-if="isAuthenticated" class="nav-item dropdown">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              id="navbarDropdown" 
              role="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <i class="bi bi-person-circle me-1"></i>
              {{ username }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
              <li v-if="isEmployee">
                <router-link class="dropdown-item" to="/admin/dashboard">
                  <i class="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </router-link>
              </li>
              <li v-else>
                <router-link class="dropdown-item" to="/cart">
                  <i class="bi bi-cart me-2"></i>
                  Cart
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="logout">
                  <i class="bi bi-box-arrow-right me-2"></i>
                  Logout
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Navbar',
  computed: {
    ...mapGetters({
      isAuthenticated: 'auth/isAuthenticated',
      isEmployee: 'auth/isEmployee',
      user: 'auth/getUser',
      cartItemCount: 'cart/getItemCount'
    }),
    
    username() {
      if (!this.user) return ''
      return this.user.user.username
    }
  },
  methods: {
    ...mapActions({
      logoutAction: 'auth/logout',
      fetchCart: 'cart/fetchCart'
    }),
    
    logout() {
      this.logoutAction()
    }
  },
  mounted() {
    // Bootstrap collapse initialization for mobile menu
    document.querySelectorAll('.navbar-nav a.nav-link').forEach(link => {
      if (!link.classList.contains('dropdown-toggle')) {
        link.addEventListener('click', () => {
          const navbarCollapse = document.getElementById('navbarNav')
          if (navbarCollapse && navbarCollapse.classList.contains('show')) {
            const bsCollapse = new bootstrap.Collapse(navbarCollapse)
            bsCollapse.hide()
          }
        })
      }
    })
  },
  created() {
    // Fetch cart data if user is authenticated and is a customer
    if (this.isAuthenticated && !this.isEmployee) {
      this.fetchCart()
    }
  },
  watch: {
    // Watch for auth changes to fetch cart when user logs in
    isAuthenticated(newValue) {
      if (newValue && !this.isEmployee) {
        this.fetchCart()
      }
    }
  }
}
</script>

<style scoped>
.navbar-brand {
  font-weight: bold;
}

.nav-link {
  font-weight: 500;
}

.navbar-nav .nav-link.router-link-active {
  color: #0d6efd;
}
</style>
