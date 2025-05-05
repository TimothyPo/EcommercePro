<template>
  <div class="container py-4">
    <h1 class="mb-4">Order Monitoring</h1>
    
    <div class="card mb-4">
      <div class="card-header">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h5 class="mb-0">Orders</h5>
          </div>
          <div class="col-md-6">
            <div class="d-flex gap-2">
              <input 
                type="date" 
                class="form-control"
                v-model="startDate"
                @change="filterOrders"
              >
              <input 
                type="date" 
                class="form-control"
                v-model="endDate"
                @change="filterOrders"
              >
              <button class="btn btn-outline-secondary" @click="resetFilters">
                <i class="bi bi-x-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div v-if="isLoading" class="text-center p-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="!orders.length" class="text-center p-4">
          <p class="mb-0">No orders found.</p>
        </div>
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in orders" :key="order.id">
                  <td>#{{ order.id }}</td>
                  <td>{{ order.username }}</td>
                  <td>{{ formatDate(order.created_at) }}</td>
                  <td>${{ order.total_amount }}</td>
                  <td>
                    <span :class="getStatusBadge(order.status)">
                      {{ order.status }}
                    </span>
                  </td>
                  <td>
                    <button 
                      class="btn btn-sm btn-outline-primary"
                      @click="viewOrderDetails(order)"
                    >
                      <i class="bi bi-eye me-1"></i>
                      View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Order Details Modal -->
    <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-hidden="true" ref="orderDetailsModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Order Details #{{ selectedOrder?.id }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedOrder">
              <div class="row mb-4">
                <div class="col-md-6">
                  <p><strong>Customer:</strong> {{ selectedOrder.username }}</p>
                  <p><strong>Date:</strong> {{ formatDate(selectedOrder.created_at, true) }}</p>
                  <p>
                    <strong>Status:</strong> 
                    <span :class="getStatusBadge(selectedOrder.status)">
                      {{ selectedOrder.status }}
                    </span>
                  </p>
                </div>
                <div class="col-md-6">
                  <p><strong>Shipping Address:</strong></p>
                  <p class="text-muted">{{ formatAddress(selectedOrder.shipping_address) }}</p>
                </div>
              </div>
              
              <h6 class="mb-3">Order Items</h6>
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
                    <tr v-for="item in selectedOrder.items" :key="item.id">
                      <td>{{ item.product_name }}</td>
                      <td>${{ item.price }}</td>
                      <td>{{ item.quantity }}</td>
                      <td class="text-end">${{ (item.price * item.quantity).toFixed(2) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" class="text-end"><strong>Total</strong></td>
                      <td class="text-end"><strong>${{ selectedOrder.total_amount }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CheckoutMonitoring',
  data() {
    return {
      startDate: '',
      endDate: '',
      selectedOrder: null,
      orderDetailsModal: null
    }
  },
  computed: {
    ...mapGetters({
      orders: 'orders/getAllOrders',
      isLoading: 'orders/isLoading'
    })
  },
  methods: {
    ...mapActions({
      fetchOrders: 'orders/fetchOrders',
      fetchOrder: 'orders/fetchOrder'
    }),
    
    filterOrders() {
      this.fetchOrders({
        startDate: this.startDate,
        endDate: this.endDate
      })
    },
    
    resetFilters() {
      this.startDate = ''
      this.endDate = ''
      this.fetchOrders()
    },
    
    async viewOrderDetails(order) {
      this.selectedOrder = order
      
      // Fetch full order details if needed
      if (!order.items || order.items.length === 0) {
        const fullOrder = await this.fetchOrder(order.id)
        this.selectedOrder = fullOrder
      }
      
      // Show modal
      this.orderDetailsModal.show()
    },
    
    formatDate(dateString, includeTime = false) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      
      if (includeTime) {
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date)
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date)
    },
    
    formatAddress(address) {
      if (!address) return ''
      
      return address.replace(/\n/g, '<br>')
    },
    
    getStatusBadge(status) {
      const statusMap = {
        'pending': 'badge bg-warning text-dark',
        'processing': 'badge bg-info',
        'shipped': 'badge bg-primary',
        'delivered': 'badge bg-success',
        'cancelled': 'badge bg-danger'
      }
      
      return statusMap[status] || 'badge bg-secondary'
    }
  },
  mounted() {
    // Initialize Bootstrap modal
    this.orderDetailsModal = new bootstrap.Modal(this.$refs.orderDetailsModal)
  },
  created() {
    this.fetchOrders()
  }
}
</script>
