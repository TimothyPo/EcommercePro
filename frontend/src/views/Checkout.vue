<template>
  <div class="container py-4">
    <h1 class="mb-4">Checkout</h1>
    
    <div v-if="isLoading" class="d-flex justify-content-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="!cartItems.length" class="text-center my-5">
      <div class="alert alert-info">
        <i class="bi bi-cart me-2"></i>
        Your cart is empty. Please add items before checkout.
      </div>
      <router-link to="/" class="btn btn-primary mt-3">
        <i class="bi bi-arrow-left me-2"></i>
        Go to Products
      </router-link>
    </div>
    
    <div v-else class="row">
      <!-- Checkout Form -->
      <div class="col-lg-8">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Shipping Information</h5>
          </div>
          <div class="card-body">
            <div v-if="error" class="alert alert-danger mb-4">
              {{ error }}
            </div>
            
            <form @submit.prevent="placeOrder">
              <div class="mb-3">
                <label for="full_name" class="form-label">Full Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="full_name" 
                  v-model="shippingInfo.fullName" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="shippingInfo.email" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="phone" class="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  class="form-control" 
                  id="phone" 
                  v-model="shippingInfo.phone" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="address" class="form-label">Address</label>
                <textarea 
                  class="form-control" 
                  id="address" 
                  rows="3" 
                  v-model="shippingInfo.address" 
                  required
                ></textarea>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="city" class="form-label">City</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="city" 
                    v-model="shippingInfo.city" 
                    required
                  >
                </div>
                
                <div class="col-md-4 mb-3">
                  <label for="state" class="form-label">State/Province</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="state" 
                    v-model="shippingInfo.state" 
                    required
                  >
                </div>
                
                <div class="col-md-2 mb-3">
                  <label for="zip" class="form-label">Zip/Postal</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="zip" 
                    v-model="shippingInfo.zip" 
                    required
                  >
                </div>
              </div>
              
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="isProcessing"
                >
                  <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="bi bi-credit-card me-2"></i>
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Order Summary -->
      <div class="col-lg-4">
        <div class="card sticky-top" style="top: 20px;">
          <div class="card-header">
            <h5 class="mb-0">Order Summary</h5>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between mb-2">
              <span>Items ({{ cartItems.length }}):</span>
              <span>${{ cartTotal.toFixed(2) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <hr>
            <div class="d-flex justify-content-between mb-3">
              <strong>Total:</strong>
              <strong>${{ cartTotal.toFixed(2) }}</strong>
            </div>
            
            <div class="card mb-3">
              <div class="card-header">
                <h6 class="mb-0">Items in Cart</h6>
              </div>
              <ul class="list-group list-group-flush">
                <li 
                  v-for="item in cartItems" 
                  :key="item.id"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <span>{{ item.product.name }} x {{ item.quantity }}</span>
                  </div>
                  <span>${{ (item.product.price * item.quantity).toFixed(2) }}</span>
                </li>
              </ul>
            </div>
            
            <div class="text-center">
              <router-link to="/cart" class="text-decoration-none">
                <i class="bi bi-arrow-left me-1"></i>
                Back to Cart
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Checkout',
  data() {
    return {
      shippingInfo: {
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: ''
      },
      isProcessing: false
    }
  },
  computed: {
    ...mapGetters({
      cartItems: 'cart/getCartItems',
      cartTotal: 'cart/getCartTotal',
      isLoading: 'cart/isLoading',
      error: 'cart/getError',
      user: 'auth/getUser'
    })
  },
  methods: {
    ...mapActions({
      fetchCart: 'cart/fetchCart',
      checkout: 'cart/checkout'
    }),
    
    async placeOrder() {
      this.isProcessing = true
      
      // Format the shipping address
      const shippingAddress = `${this.shippingInfo.fullName}\n${this.shippingInfo.address}\n${this.shippingInfo.city}, ${this.shippingInfo.state} ${this.shippingInfo.zip}\nPhone: ${this.shippingInfo.phone}\nEmail: ${this.shippingInfo.email}`
      
      try {
        const { success, order, error } = await this.checkout({
          shippingAddress
        })
        
        if (success) {
          // The redirection will be handled by the checkout action
          // which redirects to order summary
        }
      } catch (error) {
        console.error('Error during checkout:', error)
      } finally {
        this.isProcessing = false
      }
    }
  },
  created() {
    this.fetchCart()
    
    // Pre-fill form with user data if available
    if (this.user && this.user.profile) {
      this.shippingInfo.fullName = `${this.user.user.first_name} ${this.user.user.last_name}`.trim()
      this.shippingInfo.email = this.user.user.email
      if (this.user.profile.phone_number) {
        this.shippingInfo.phone = this.user.profile.phone_number
      }
      if (this.user.profile.address) {
        // Attempt to parse the address if it's in a standard format
        const address = this.user.profile.address
        const addressLines = address.split('\n')
        
        if (addressLines.length > 0) {
          this.shippingInfo.address = addressLines[0]
          
          // Try to parse city, state, zip from the second line if it exists
          if (addressLines.length > 1) {
            const cityStateZip = addressLines[1].split(',')
            if (cityStateZip.length > 1) {
              this.shippingInfo.city = cityStateZip[0].trim()
              
              // Try to parse state and zip
              const stateZip = cityStateZip[1].trim().split(' ')
              if (stateZip.length > 0) {
                this.shippingInfo.state = stateZip[0]
              }
              if (stateZip.length > 1) {
                this.shippingInfo.zip = stateZip[1]
              }
            }
          }
        }
      }
    }
  }
}
</script>
