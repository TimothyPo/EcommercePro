<template>
  <div class="container">
    <div class="row my-4">
      <div class="col-md-8 mx-auto">
        <SearchBar @search="searchProducts" />
      </div>
    </div>
    
    <div class="row">
      <div class="col-12">
        <h1 class="text-center mb-4">Our Products</h1>
      </div>
    </div>
    
    <div v-if="isLoading" class="d-flex justify-content-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="products.length === 0" class="text-center my-5">
      <div class="alert alert-info">
        <i class="bi bi-search me-2"></i>
        No products found. Try a different search term.
      </div>
    </div>
    
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div v-for="product in products" :key="product.id" class="col">
        <ProductCard :product="product" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ProductCard from '@/components/ProductCard.vue'
import SearchBar from '@/components/SearchBar.vue'

export default {
  name: 'Home',
  components: {
    ProductCard,
    SearchBar
  },
  computed: {
    ...mapGetters({
      products: 'products/getAllProducts',
      isLoading: 'products/isLoading',
      searchQuery: 'products/getSearchQuery'
    })
  },
  methods: {
    ...mapActions({
      fetchProducts: 'products/fetchProducts'
    }),
    
    searchProducts(query) {
      this.fetchProducts({ query })
    }
  },
  created() {
    // Fetch all products when component is created
    this.fetchProducts()
  }
}
</script>

<style scoped>
.container {
  min-height: 60vh;
}
</style>
