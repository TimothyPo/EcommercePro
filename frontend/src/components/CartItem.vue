<template>
  <li class="list-group-item py-3">
    <div class="row align-items-center">
      <!-- Product Image -->
      <div class="col-md-2 col-4 mb-2 mb-md-0">
        <img 
          :src="item.product.image_url" 
          class="img-fluid rounded"
          :alt="item.product.name"
          @error="handleImageError"
        >
      </div>
      
      <!-- Product Details -->
      <div class="col-md-4 col-8 mb-2 mb-md-0">
        <h6 class="mb-1">{{ item.product.name }}</h6>
        <div class="text-muted small">${{ item.product.price }} each</div>
      </div>
      
      <!-- Quantity Control -->
      <div class="col-md-3 col-6">
        <div class="input-group">
          <button 
            class="btn btn-outline-secondary" 
            type="button"
            @click="updateQuantity(item.quantity - 1)"
            :disabled="item.quantity <= 1 || disabled"
          >
            <i class="bi bi-dash"></i>
          </button>
          <input 
            type="number" 
            class="form-control text-center" 
            v-model.number="quantity"
            @change="handleQuantityChange"
            min="1"
            :max="item.product.stock"
            :disabled="disabled"
          >
          <button 
            class="btn btn-outline-secondary" 
            type="button"
            @click="updateQuantity(item.quantity + 1)"
            :disabled="item.quantity >= item.product.stock || disabled"
          >
            <i class="bi bi-plus"></i>
          </button>
        </div>
      </div>
      
      <!-- Item Total Price -->
      <div class="col-md-2 col-3 text-end">
        <strong>${{ (item.product.price * item.quantity).toFixed(2) }}</strong>
      </div>
      
      <!-- Remove Button -->
      <div class="col-md-1 col-3 text-end">
        <button 
          class="btn btn-sm btn-outline-danger" 
          @click="removeItem"
          :disabled="disabled"
          title="Remove item"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  </li>
</template>

<script>
export default {
  name: 'CartItem',
  props: {
    item: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      quantity: this.item.quantity
    }
  },
  methods: {
    removeItem() {
      this.$emit('remove', this.item.product.id)
    },
    
    updateQuantity(newQuantity) {
      if (newQuantity <= 0) {
        this.removeItem()
        return
      }
      
      if (newQuantity > this.item.product.stock) {
        newQuantity = this.item.product.stock
      }
      
      this.quantity = newQuantity
      this.$emit('update-quantity', {
        productId: this.item.product.id,
        quantity: newQuantity
      })
    },
    
    handleQuantityChange() {
      if (this.quantity <= 0) {
        this.removeItem()
        return
      }
      
      if (this.quantity > this.item.product.stock) {
        this.quantity = this.item.product.stock
      }
      
      this.updateQuantity(this.quantity)
    },
    
    handleImageError(e) {
      e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'
    }
  },
  watch: {
    'item.quantity'(newVal) {
      this.quantity = newVal
    }
  }
}
</script>

<style scoped>
img {
  max-height: 60px;
  object-fit: contain;
}

input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
