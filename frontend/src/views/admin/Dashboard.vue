<template>
  <div class="container py-4">
    <h1 class="mb-4">Admin Dashboard</h1>
    
    <div class="row mb-4">
      <div class="col-md-4 mb-3">
        <div class="card bg-primary text-white h-100">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title">Products</h5>
                <h2 class="mb-0">{{ products.length }}</h2>
              </div>
              <i class="bi bi-box-seam fs-1"></i>
            </div>
            <router-link to="/admin/products" class="mt-auto btn btn-outline-light">
              Manage Products
            </router-link>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-3">
        <div class="card bg-success text-white h-100">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title">Orders</h5>
                <h2 class="mb-0">{{ orders.length }}</h2>
              </div>
              <i class="bi bi-cart-check fs-1"></i>
            </div>
            <router-link to="/admin/checkouts" class="mt-auto btn btn-outline-light">
              View Orders
            </router-link>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-3">
        <div class="card bg-info text-white h-100">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title">Low Stock</h5>
                <h2 class="mb-0">{{ lowStockProducts.length }}</h2>
              </div>
              <i class="bi bi-exclamation-triangle fs-1"></i>
            </div>
            <router-link to="/admin/products" class="mt-auto btn btn-outline-light">
              Check Inventory
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row">
      <div class="col-md-6">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Recent Orders</h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table mb-0">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in recentOrders" :key="order.id">
                    <td>#{{ order.id }}</td>
                    <td>{{ order.username }}</td>
                    <td>{{ formatDate(order.created_at) }}</td>
                    <td>${{ order.total_amount }}</td>
                    <td>
                      <span :class="getStatusBadge(order.status)">
                        {{ order.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="text-center p-3" v-if="!recentOrders.length">
              No recent orders.
            </div>
          </div>
          <div class="card-footer">
            <router-link to="/admin/checkouts" class="btn btn-sm btn-primary">
              View All Orders
            </router-link>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Low Stock Products</h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Current Stock</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in lowStockProducts.slice(0, 5)" :key="product.id">
                    <td>{{ product.name }}</td>
                    <td>${{ product.price }}</td>
                    <td>
                      <span class="badge bg-danger">{{ product.stock }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="text-center p-3" v-if="!lowStockProducts.length">
              No low stock products.
            </div>
          </div>
          <div class="card-footer">
            <router-link to="/admin/products" class="btn btn-sm btn-primary">
              Manage Inventory
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters({
      products: 'products/getAllProducts',
      orders: 'orders/getAllOrders',
      isLoading: 'products/isLoading'
    }),
    
    lowStockProducts() {
      return this.products.filter(product => product.stock < 10)
        .sort((a, b) => a.stock - b.stock)
    },
    
    recentOrders() {
      return [...this.orders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
    }
  },
  methods: {
    ...mapActions({
      fetchProducts: 'products/fetchProducts',
      fetchOrders: 'orders/fetchOrders'
    }),
    
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date)
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
  created() {
    this.fetchProducts()
    this.fetchOrders()
  }
}
</script>
