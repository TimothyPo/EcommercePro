<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-sm my-5">
          <div class="card-body p-4">
            <h2 class="card-title text-center mb-4">Login</h2>
            
            <div v-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>
            
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="username"
                  required
                  autofocus
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
              
              <div class="d-grid gap-2">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Login
                </button>
                
                <div class="text-center mt-3">
                  <p>Don't have an account? <router-link to="/register">Register</router-link></p>
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
  name: 'Login',
  data() {
    return {
      username: '',
      password: ''
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
      login: 'auth/login'
    }),
    
    async handleLogin() {
      const credentials = {
        username: this.username,
        password: this.password
      }
      
      const { success } = await this.login(credentials)
      
      // The redirect is handled in the auth store
      if (!success) {
        // Just keep user on the login page with error shown
      }
    }
  }
}
</script>
