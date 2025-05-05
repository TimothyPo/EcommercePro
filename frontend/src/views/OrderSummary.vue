<template>
  <div class="container py-4">
    <div class="text-center" v-if="!order && isLoading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div class="alert alert-danger" v-else-if="!order && !isLoading">
      <i class="bi bi-exclamation-triangle me-2"></i>
      Order not found.
    </div>
    
    <div v-else>
      <div class="alert alert-success mb-4">
        <i class="bi bi-check-circle me-2"></i>
        Thank you for your order!
      </div>
      
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Order Summary</h5>
        </div>
        <div class="card-body">
          <div class="row mb-4">
            <div class="col-md-6">
              <p><strong>Order ID:</strong> #{{ order.id }}</p>
              <p><strong>Date:</strong> {{ formatDate(order.created_at) }}</p>
              <p><strong>Status:</strong> <span class="badge bg-info">{{ order.status }}</span></p>
            </div>
            <div class="col-md-6">
              <p><strong>Customer:</strong> {{ order.username }}</p>
              <p><strong>Shipping Address:</strong></p>
              <p class="text-muted">{{ formatAddress(order.shipping_address) }}</p>
            </div>
          </div>
          
          <h6 class="mb-3">Items</h6>
          <div class="table-responsive">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th class="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in order.items" :key="item.id">
                  <td>{{ item.product_name }}</td>
                  <td>${{ item.price }}</td>
                  <td>{{ item.quantity }}</td>
                  <td class="text-end">${{ (item.price * item.quantity).toFixed(2) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-end"><strong>Total</strong></td>
                  <td class="text-end"><strong>${{ order.total_amount }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      
      <div class="d-flex justify-content-between">
        <router-link to="/" class="btn btn-primary">
          <i class="bi bi-arrow-left me-2"></i>
          Continue Shopping
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'OrderSummary',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  computed: {
    ...mapGetters({
      order: 'orders/getOrder',
      isLoading: 'orders/isLoading'
    })
  },
  methods: {
    ...mapActions({
      fetchOrder: 'orders/fetchOrder'
    }),
    
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    },
    
    formatAddress(address) {
      if (!address) return ''
      
      return address.replace(/\n/g, '<br>')
    }
  },
  created() {
    this.fetchOrder(this.id)
  },
  watch: {
    id(newId) {
      this.fetchOrder(newId)
    }
  }
}
</script>
