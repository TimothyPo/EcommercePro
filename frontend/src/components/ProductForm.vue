<template>
  <div class="product-form">
    <div v-if="formError" class="alert alert-danger">
      {{ formError }}
    </div>
    
    <form @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label for="name" class="form-label">Product Name *</label>
        <input 
          type="text" 
          class="form-control" 
          id="name" 
          v-model="formData.name"
          required
          :disabled="isProcessing"
        >
      </div>
      
      <div class="mb-3">
        <label for="description" class="form-label">Description *</label>
        <textarea 
          class="form-control" 
          id="description" 
          rows="3" 
          v-model="formData.description"
          required
          :disabled="isProcessing"
        ></textarea>
      </div>
      
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="price" class="form-label">Price ($) *</label>
          <input 
            type="number" 
            class="form-control" 
            id="price" 
            v-model.number="formData.price"
            step="0.01"
            min="0"
            required
            :disabled="isProcessing"
          >
        </div>
        
        <div class="col-md-6 mb-3">
          <label for="stock" class="form-label">Stock Quantity *</label>
          <input 
            type="number" 
            class="form-control" 
            id="stock" 
            v-model.number="formData.stock"
            min="0"
            required
            :disabled="isProcessing"
          >
        </div>
      </div>
      
      <div class="mb-3">
        <label for="image_url" class="form-label">Image URL *</label>
        <input 
          type="url" 
          class="form-control" 
          id="image_url" 
          v-model="formData.image_url"
          required
          :disabled="isProcessing"
          placeholder="https://example.com/image.jpg"
        >
        <div class="form-text">Enter a valid URL for the product image.</div>
      </div>
      
      <div v-if="formData.image_url" class="mb-3">
        <label class="form-label">Image Preview</label>
        <div class="image-preview border rounded p-2 text-center">
          <img 
            :src="formData.image_url" 
            alt="Preview" 
            class="img-fluid"
            style="max-height: 200px;"
            @error="handleImageError"
          >
        </div>
      </div>
      
      <div class="d-flex justify-content-end gap-2">
        <button 
          type="button" 
          class="btn btn-secondary"
          @click="cancel"
          :disabled="isProcessing"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="isProcessing"
        >
          <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ isEdit ? 'Update Product' : 'Create Product' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ProductForm',
  props: {
    product: {
      type: Object,
      default: () => ({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        image_url: ''
      })
    },
    isProcessing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: {
        name: '',
        description: '',
        price: 0,
        stock: 0,
        image_url: ''
      },
      formError: null,
      imageError: false
    }
  },
  computed: {
    isEdit() {
      return !!this.product.id
    }
  },
  methods: {
    handleSubmit() {
      // Validate form
      if (!this.formData.name || !this.formData.description || !this.formData.image_url) {
        this.formError = 'Please fill in all required fields.'
        return
      }
      
      if (this.formData.price <= 0) {
        this.formError = 'Price must be greater than zero.'
        return
      }
      
      if (this.formData.stock < 0) {
        this.formError = 'Stock cannot be negative.'
        return
      }
      
      // Clear any previous errors
      this.formError = null
      
      // Emit save event with form data
      this.$emit('save', { ...this.formData })
    },
    
    cancel() {
      this.$emit('cancel')
    },
    
    resetForm() {
      this.formData = {
        name: '',
        description: '',
        price: 0,
        stock: 0,
        image_url: ''
      }
      this.formError = null
    },
    
    handleImageError() {
      this.imageError = true
    }
  },
  created() {
    // Initialize form data with product data
    if (this.product) {
      this.formData = { ...this.product }
    }
  },
  watch: {
    product(newProduct) {
      // Update form data when product changes
      this.formData = { ...newProduct }
    }
  }
}
</script>

<style scoped>
.image-preview {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
