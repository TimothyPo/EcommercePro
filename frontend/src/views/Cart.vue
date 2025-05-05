<template>
  <div class="container py-4">
    <h1 class="mb-4">Your Shopping Cart</h1>
    
    <div v-if="isLoading" class="d-flex justify-content-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="!cartItems.length" class="text-center my-5">
      <div class="alert alert-info">
        <i class="bi bi-cart me-2"></i>
        Your cart is empty
      </div>
      <router-link to="/" class="btn btn-primary mt-3">
        <i class="bi bi-arrow-left me-2"></i>
        Continue Shopping
      </router-link>
    </div>
    
    <div v-else>
      <div class="alert alert-danger" v-if="error">{{ error }}</div>
      
      <div class="row">
        <!-- Cart Items -->
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Items ({{ cartItems.length }})</h5>
                <button 
                  class="btn btn-outline-danger btn-sm"
                  @click="clearCart"
                  :disabled="isProcessing"
                >
                  <i class="bi bi-trash me-1"></i>
                  Clear Cart
                </button>
              </div>
            </div>
            <div class="card-body">
              <ul class="list-group list-group-flush">
                <CartItem 
                  v-for="item in cartItems" 
                  :key="item.id"
                  :item="item"
                  @remove="removeFromCart"
                  @update-quantity="updateQuantity"
                  :disabled="isProcessing"
                />
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Order Summary -->
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Order Summary</h5>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between mb-3">
                <span>Subtotal:</span>
                <span>${{ cartTotal.toFixed(2) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between mb-4">
                <strong>Total:</strong>
                <strong>${{ cartTotal.toFixed(2) }}</strong>
              </div>
              
              <button 
                class="btn btn-primary w-100" 
                @click="goToCheckout"
                :disabled="isProcessing || !cartItems.length"
              >
                <i class="bi bi-credit-card me-2"></i>
                Proceed to Checkout
              </button>
              
              <div class="text-center mt-3">
                <router-link to="/" class="text-decoration-none">
                  <i class="bi bi-arrow-left me-1"></i>
                  Continue Shopping
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CartItem from '@/components/CartItem.vue'

export default {
  name: 'Cart',
  components: {
    CartItem
  },
  data() {
    return {
      isProcessing: false
    }
  },
  computed: {
    ...mapGetters({
      cartItems: 'cart/getCartItems',
      cartTotal: 'cart/getCartTotal',
      isLoading: 'cart/isLoading',
      error: 'cart/getError'
    })
  },
  methods: {
    ...mapActions({
      fetchCart: 'cart/fetchCart',
      removeFromCartAction: 'cart/removeFromCart',
      updateQuantityAction: 'cart/updateQuantity',
      clearCartAction: 'cart/clearCart'
    }),
    
    async removeFromCart(productId) {
      this.isProcessing = true
      try {
        await this.removeFromCartAction(productId)
      } catch (error) {
        console.error('Error removing item:', error)
      } finally {
        this.isProcessing = false
      }
    },
    
    async updateQuantity({ productId, quantity }) {
      this.isProcessing = true
      try {
        await this.updateQuantityAction({ productId, quantity })
      } catch (error) {
        console.error('Error updating quantity:', error)
      } finally {
        this.isProcessing = false
      }
    },
    
    async clearCart() {
      if (confirm('Are you sure you want to clear your cart?')) {
        this.isProcessing = true
        try {
          await this.clearCartAction()
        } catch (error) {
          console.error('Error clearing cart:', error)
        } finally {
          this.isProcessing = false
        }
      }
    },
    
    goToCheckout() {
      this.$router.push('/checkout')
    }
  },
  created() {
    this.fetchCart()
  }
}
</script>
