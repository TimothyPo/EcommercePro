<template>
  <div class="card h-100 product-card">
    <div class="card-img-container">
      <img 
        :src="product.image_url" 
        class="card-img-top" 
        :alt="product.name"
        @error="handleImageError"
      >
      <div v-if="product.stock <= 0" class="out-of-stock-overlay">
        <span>Out of Stock</span>
      </div>
    </div>
    
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ product.name }}</h5>
      <p class="card-text text-muted small mb-2 flex-grow-1">
        {{ truncateDescription(product.description) }}
      </p>
      
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="text-primary fw-bold">${{ product.price }}</span>
        <span :class="stockBadgeClass">{{ stockLabel }}</span>
      </div>
      
      <div class="d-grid gap-2">
        <router-link 
          :to="`/product/${product.id}`" 
          class="btn btn-outline-primary btn-sm"
        >
          <i class="bi bi-info-circle me-1"></i>
          View Details
        </router-link>
        
        <button 
          v-if="isAuthenticated && !isEmployee && product.stock > 0" 
          class="btn btn-primary btn-sm"
          @click="addToCart"
          :disabled="isAddingToCart"
        >
          <span v-if="isAddingToCart" class="spinner-border spinner-border-sm me-1" role="status"></span>
          <i v-else class="bi bi-cart-plus me-1"></i>
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isAddingToCart: false,
      imageError: false
    }
  },
  computed: {
    ...mapGetters({
      isAuthenticated: 'auth/isAuthenticated',
      isEmployee: 'auth/isEmployee'
    }),
    
    stockBadgeClass() {
      if (this.product.stock <= 0) {
        return 'badge bg-danger'
      } else if (this.product.stock < 10) {
        return 'badge bg-warning text-dark'
      } else {
        return 'badge bg-success'
      }
    },
    
    stockLabel() {
      if (this.product.stock <= 0) {
        return 'Out of Stock'
      } else if (this.product.stock < 10) {
        return `Only ${this.product.stock} left`
      } else {
        return 'In Stock'
      }
    }
  },
  methods: {
    ...mapActions({
      addToCartAction: 'cart/addToCart'
    }),
    
    truncateDescription(description) {
      if (description.length > 80) {
        return description.substring(0, 80) + '...'
      }
      return description
    },
    
    async addToCart() {
      this.isAddingToCart = true
      
      try {
        const result = await this.addToCartAction({
          productId: this.product.id,
          quantity: 1
        })
        
        if (!result.success) {
          console.error(result.error)
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
      } finally {
        this.isAddingToCart = false
      }
    },
    
    handleImageError(e) {
      this.imageError = true
      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image+Available'
    }
  }
}
</script>

<style scoped>
.product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.card-img-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-img-top {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0.5rem;
}

.out-of-stock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.out-of-stock-overlay span {
  background-color: #dc3545;
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transform: rotate(-15deg);
}
</style>
