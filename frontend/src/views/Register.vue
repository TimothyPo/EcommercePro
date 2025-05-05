<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-sm my-5">
          <div class="card-body p-4">
            <h2 class="card-title text-center mb-4">Register</h2>
            
            <div v-if="error" class="alert alert-danger" role="alert">
              <pre class="mb-0">{{ error }}</pre>
            </div>
            
            <form @submit.prevent="handleRegister">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="first_name" class="form-label">First Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="first_name"
                    v-model="first_name"
                    required
                  >
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="last_name" class="form-label">Last Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="last_name"
                    v-model="last_name"
                    required
                  >
                </div>
              </div>
              
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="username"
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="email"
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="password_confirm" class="form-label">Confirm Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password_confirm"
                  v-model="password_confirm"
                  required
                >
              </div>
              
              <div class="d-grid gap-2">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Register
                </button>
                
                <div class="text-center mt-3">
                  <p>Already have an account? <router-link to="/login">Login</router-link></p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Register',
  data() {
    return {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password: '',
      password_confirm: ''
    }
  },
  computed: {
    ...mapGetters({
      isLoading: 'auth/isLoading',
      error: 'auth/getError'
    })
  },
  methods: {
    ...mapActions({
      register: 'auth/register'
    }),
    
    async handleRegister() {
      const userData = {
        first_name: this.first_name,
        last_name: this.last_name,
        username: this.username,
        email: this.email,
        password: this.password,
        password_confirm: this.password_confirm,
        is_employee: false // Always register as customer
      }
      
      const { success } = await this.register(userData)
      
      // Redirect is handled in the auth store
      if (!success) {
        // Keep user on registration page with error shown
      }
    }
  }
}
</script>
