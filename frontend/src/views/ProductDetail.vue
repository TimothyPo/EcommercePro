<template>
  <div class="container py-4">
    <div v-if="isLoading" class="d-flex justify-content-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="!product" class="alert alert-danger text-center">
      Product not found.
    </div>
    
    <div v-else class="row">
      <!-- Product Image -->
      <div class="col-md-6 mb-4">
        <div class="card">
          <img 
            :src="product.image_url" 
            alt="Product Image" 
            class="card-img-top img-fluid product-image"
            onerror="this.src='https://via.placeholder.com/400x300?text=No+Image+Available'"
          >
        </div>
      </div>
      
      <!-- Product Details -->
      <div class="col-md-6">
        <h1 class="mb-3">{{ product.name }}</h1>
        <p class="lead text-muted mb-4">{{ product.description }}</p>
        
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="text-primary fw-bold mb-0">${{ product.price }}</h2>
          <span :class="stockClass">{{ stockStatus }}</span>
        </div>
        
        <div v-if="isAuthenticated && !isEmployee" class="mb-4">
          <div class="d-flex align-items-center">
            <div class="input-group me-3" style="width: 140px;">
              <button 
                class="btn btn-outline-secondary" 
                type="button"
                @click="decrementQuantity" 
                :disabled="quantity <= 1"
              >
                <i class="bi bi-dash"></i>
              </button>
              <input 
                type="number" 
                class="form-control text-center" 
                v-model.number="quantity"
                min="1"
                :max="product.stock"
              >
              <button 
                class="btn btn-outline-secondary" 
                type="button"
                @click="incrementQuantity"
                :disabled="quantity >= product.stock"
              >
                <i class="bi bi-plus"></i>
              </button>
            </div>
            
            <button 
              class="btn btn-primary flex-grow-1"
              @click="addToCart"
              :disabled="isAddingToCart || !product.stock"
            >
              <span v-if="isAddingToCart" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="bi bi-cart-plus me-2"></i>
              Add to Cart
            </button>
          </div>
          
          <div v-if="cartError" class="alert alert-danger mt-3">
            {{ cartError }}
          </div>
        </div>
        
        <div v-else-if="!isAuthenticated" class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          <router-link to="/login">Sign in</router-link> to add this product to your cart.
        </div>
        
        <div class="mt-4">
          <h4>Product Details</h4>
          <hr>
          <div class="row">
            <div class="col-6">
              <p><strong>ID:</strong> {{ product.id }}</p>
            </div>
            <div class="col-6">
              <p><strong>Stock:</strong> {{ product.stock }} units</p>
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
  name: 'ProductDetail',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      quantity: 1,
      isAddingToCart: false,
      cartError: null
    }
  },
  computed: {
    ...mapGetters({
      product: 'products/getProduct',
      isLoading: 'products/isLoading',
      isAuthenticated: 'auth/isAuthenticated',
      isEmployee: 'auth/isEmployee'
    }),
    
    stockStatus() {
      if (!this.product) return ''
      
      if (this.product.stock > 10) {
        return 'In Stock'
      } else if (this.product.stock > 0) {
        return `Only ${this.product.stock} left!`
      } else {
        return 'Out of Stock'
      }
    },
    
    stockClass() {
      if (!this.product) return ''
      
      if (this.product.stock > 10) {
        return 'badge bg-success fs-6'
      } else if (this.product.stock > 0) {
        return 'badge bg-warning text-dark fs-6'
      } else {
        return 'badge bg-danger fs-6'
      }
    }
  },
  methods: {
    ...mapActions({
      fetchProduct: 'products/fetchProduct',
      addToCartAction: 'cart/addToCart'
    }),
    
    incrementQuantity() {
      if (this.product && this.quantity < this.product.stock) {
        this.quantity++
      }
    },
    
    decrementQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },
    
    async addToCart() {
      if (!this.product || this.product.stock === 0) return
      
      this.isAddingToCart = true
      this.cartError = null
      
      try {
        const { success, error } = await this.addToCartAction({
          productId: this.product.id,
          quantity: this.quantity
        })
        
        if (success) {
          // Show success message with bootstrap toast
          this.$bvToast.toast(`Added ${this.quantity} ${this.product.name} to cart`, {
            title: 'Success',
            variant: 'success',
            solid: true
          })
        } else {
          this.cartError = error
        }
      } catch (error) {
        this.cartError = 'Failed to add product to cart. Please try again.'
      } finally {
        this.isAddingToCart = false
      }
    }
  },
  created() {
    this.fetchProduct(this.id)
  },
  watch: {
    id(newId) {
      this.fetchProduct(newId)
      this.quantity = 1
    }
  }
}
</script>

<style scoped>
.product-image {
  max-height: 500px;
  object-fit: contain;
  padding: 20px;
}
</style>
