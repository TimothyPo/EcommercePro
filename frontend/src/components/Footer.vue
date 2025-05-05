<template>
  <footer class="footer mt-auto py-4 bg-light">
    <div class="container">
      <div class="row">
        <div class="col-md-4 mb-3">
          <h5 class="mb-3">E-Shop</h5>
          <p class="text-muted">
            Your one-stop shop for quality products at affordable prices.
          </p>
        </div>
        
        <div class="col-md-2 mb-3">
          <h5 class="mb-3">Shop</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <router-link to="/" class="text-decoration-none text-secondary">
                Products
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/cart" class="text-decoration-none text-secondary">
                Cart
              </router-link>
            </li>
          </ul>
        </div>
        
        <div class="col-md-2 mb-3">
          <h5 class="mb-3">Account</h5>
          <ul class="list-unstyled">
            <li v-if="!isAuthenticated" class="mb-2">
              <router-link to="/login" class="text-decoration-none text-secondary">
                Login
              </router-link>
            </li>
            <li v-if="!isAuthenticated" class="mb-2">
              <router-link to="/register" class="text-decoration-none text-secondary">
                Register
              </router-link>
            </li>
            <li v-if="isAuthenticated && !isEmployee" class="mb-2">
              <router-link to="/cart" class="text-decoration-none text-secondary">
                My Cart
              </router-link>
            </li>
            <li v-if="isAuthenticated && isEmployee" class="mb-2">
              <router-link to="/admin/dashboard" class="text-decoration-none text-secondary">
                Dashboard
              </router-link>
            </li>
          </ul>
        </div>
        
        <div class="col-md-4 mb-3">
          <h5 class="mb-3">Connect with Us</h5>
          <div class="d-flex gap-3 fs-4">
            <a href="#" class="text-decoration-none text-secondary">
              <i class="bi bi-facebook"></i>
            </a>
            <a href="#" class="text-decoration-none text-secondary">
              <i class="bi bi-twitter"></i>
            </a>
            <a href="#" class="text-decoration-none text-secondary">
              <i class="bi bi-instagram"></i>
            </a>
            <a href="#" class="text-decoration-none text-secondary">
              <i class="bi bi-linkedin"></i>
            </a>
          </div>
        </div>
      </div>
      
      <hr>
      
      <div class="row">
        <div class="col-12 text-center">
          <p class="text-muted mb-0">&copy; {{ currentYear }} E-Shop. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Footer',
  computed: {
    ...mapGetters({
      isAuthenticated: 'auth/isAuthenticated',
      isEmployee: 'auth/isEmployee'
    }),
    
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.footer {
  margin-top: 2rem;
  background-color: #f8f9fa;
}

h5 {
  font-weight: 600;
  font-size: 1.1rem;
}
</style>
