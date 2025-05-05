<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Product Management</h1>
      <button class="btn btn-primary" @click="showProductForm()">
        <i class="bi bi-plus-circle me-2"></i>
        Add New Product
      </button>
    </div>
    
    <div class="card mb-4">
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Product List</h5>
          <div class="input-group" style="max-width: 300px;">
            <input 
              type="text"
              class="form-control"
              placeholder="Search products..."
              v-model="searchQuery"
              @input="searchProducts"
            >
            <button class="btn btn-outline-secondary" type="button">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div v-if="isLoading" class="text-center p-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="!products.length" class="text-center p-4">
          <p class="mb-0">No products found. Create a new product to get started.</p>
        </div>
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in products" :key="product.id">
                  <td>{{ product.id }}</td>
                  <td>{{ product.name }}</td>
                  <td>${{ product.price }}</td>
                  <td>
                    <span 
                      :class="getStockBadgeClass(product.stock)"
                    >
                      {{ product.stock }}
                    </span>
                  </td>
                  <td>{{ formatDate(product.created_at) }}</td>
                  <td>
                    <div class="btn-group" role="group">
                      <button 
                        class="btn btn-sm btn-outline-primary" 
                        @click="showProductForm(product)"
                        title="Edit"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-danger" 
                        @click="deleteProduct(product)"
                        title="Delete"
                        :disabled="isProcessing"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Product Form Modal -->
    <div class="modal fade" id="productFormModal" tabindex="-1" aria-hidden="true" ref="productFormModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <ProductForm 
              :product="currentProduct" 
              :is-processing="isProcessing"
              @save="saveProduct"
              @cancel="hideProductForm"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ProductForm from '@/components/ProductForm.vue'

export default {
  name: 'ProductManagement',
  components: {
    ProductForm
  },
  data() {
    return {
      currentProduct: null,
      isEditing: false,
      isProcessing: false,
      searchQuery: '',
      productFormModal: null
    }
  },
  computed: {
    ...mapGetters({
      products: 'products/getAllProducts',
      isLoading: 'products/isLoading',
      error: 'products/getError'
    })
  },
  methods: {
    ...mapActions({
      fetchProducts: 'products/fetchProducts',
      createProduct: 'products/createProduct',
      updateProduct: 'products/updateProduct',
      deleteProductAction: 'products/deleteProduct'
    }),
    
    showProductForm(product = null) {
      this.isEditing = !!product
      this.currentProduct = product ? { ...product } : {
        name: '',
        description: '',
        price: 0,
        stock: 0,
        image_url: ''
      }
      
      // Show modal
      this.productFormModal.show()
    },
    
    hideProductForm() {
      this.productFormModal.hide()
    },
    
    async saveProduct(productData) {
      this.isProcessing = true
      
      try {
        if (this.isEditing) {
          await this.updateProduct({
            productId: this.currentProduct.id,
            productData
          })
        } else {
          await this.createProduct(productData)
        }
        
        // Refresh product list
        this.fetchProducts()
        
        // Hide form
        this.hideProductForm()
      } catch (error) {
        console.error('Error saving product:', error)
      } finally {
        this.isProcessing = false
      }
    },
    
    async deleteProduct(product) {
      if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
        return
      }
      
      this.isProcessing = true
      
      try {
        const { success, error } = await this.deleteProductAction(product.id)
        
        if (success) {
          // Refresh product list
          this.fetchProducts()
        } else {
          alert(error)
        }
      } catch (error) {
        console.error('Error deleting product:', error)
      } finally {
        this.isProcessing = false
      }
    },
    
    searchProducts() {
      this.fetchProducts({ query: this.searchQuery })
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date)
    },
    
    getStockBadgeClass(stock) {
      if (stock <= 0) {
        return 'badge bg-danger'
      } else if (stock < 10) {
        return 'badge bg-warning text-dark'
      } else {
        return 'badge bg-success'
      }
    }
  },
  mounted() {
    // Initialize Bootstrap modal
    this.productFormModal = new bootstrap.Modal(this.$refs.productFormModal)
  },
  created() {
    this.fetchProducts()
  }
}
</script>
