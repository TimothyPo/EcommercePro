<template>
  <div class="search-bar">
    <div class="input-group">
      <input 
        type="text" 
        class="form-control" 
        placeholder="Search products..." 
        v-model="searchQuery"
        @keyup.enter="search"
      >
      <button 
        class="btn btn-primary" 
        type="button"
        @click="search"
      >
        <i class="bi bi-search me-1"></i>
        Search
      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'SearchBar',
  props: {
    initialQuery: {
      type: String,
      default: ''
    },
    autoSearch: {
      type: Boolean,
      default: false
    },
    debounceTime: {
      type: Number,
      default: 500
    }
  },
  emits: ['search'],
  setup(props, { emit }) {
    const searchQuery = ref(props.initialQuery)
    let debounceTimer = null
    
    const search = () => {
      emit('search', searchQuery.value)
    }
    
    // If autoSearch is enabled, debounce the search
    watch(searchQuery, (newValue) => {
      if (props.autoSearch) {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          emit('search', newValue)
        }, props.debounceTime)
      }
    })
    
    return {
      searchQuery,
      search
    }
  }
}
</script>

<style scoped>
.search-bar {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
</style>
