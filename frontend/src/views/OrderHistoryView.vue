<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const orders = ref([])
const loading = ref(true)
const error = ref('')

async function loadOrders() {
  try {
    const response = await api.get('/orders', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    orders.value = response.data
  } catch (requestError) {
    error.value =
      requestError.response?.data?.message ||
      'Unable to load your order history.'
  } finally {
    loading.value = false
  }
}

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
function statusBadgeClass(status) {
  return {
    Paid: 'bg-primary',
    Packing: 'bg-warning text-dark',
    Shipped: 'bg-info text-dark',
    Delivered: 'bg-success',
    Cancelled: 'bg-danger'
  }[status] || 'bg-secondary'
}

function statusMessage(status) {
  return {
    Paid: 'Payment confirmed. Your order is awaiting processing.',
    Packing: 'Your games are being packed for delivery.',
    Shipped: 'Your order has been shipped and is on the way.',
    Delivered: 'Your order has been delivered successfully.',
    Cancelled: 'This order has been cancelled.'
  }[status] || ''
}

onMounted(loadOrders)
</script>

<template>
  <section class="bg-dark text-white py-5">
    <div class="container">
      <span class="badge bg-primary mb-3">My Purchases</span>
      <h1 class="display-5 fw-bold">Order History</h1>
      <p class="lead text-white-50 mb-0">
        Review your completed GameVault transactions.
      </p>
    </div>
  </section>

  <section class="py-5 bg-light min-vh-100">
    <div class="container">
      <div
        v-if="route.query.placed"
        class="alert alert-success mb-4"
        role="alert"
      >
        <strong>Order placed successfully!</strong>
        Your order reference is #{{ route.query.placed }}.
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 text-muted">Loading order history...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <div
        v-else-if="orders.length === 0"
        class="card border-0 shadow-sm text-center"
      >
        <div class="card-body py-5">
          <div class="display-3 mb-3">📦</div>
          <h2 class="h3 fw-bold">No orders yet</h2>
          <p class="text-muted">
            Your completed purchases will appear here.
          </p>
          <RouterLink to="/shop" class="btn btn-primary mt-3">
            Browse Games
          </RouterLink>
        </div>
      </div>

      <div v-else class="row g-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="col-12"
        >
          <article class="card border-0 shadow-sm">
            <div class="card-header bg-white p-4">
              <div class="row align-items-center g-3">
                <div class="col-12 col-md">
                  <p class="small text-muted mb-1">Order Reference</p>
                  <h2 class="h5 fw-bold mb-0">
                    #{{ order.id }}
                  </h2>
                </div>

                <div class="col-6 col-md">
                  <p class="small text-muted mb-1">Order Date</p>
                  <p class="fw-semibold mb-0">
                    {{ formatDate(order.created_at) }}
                  </p>
                </div>

                <div class="col-6 col-md">
                  <p class="small text-muted mb-1">Status</p>
                  <div>
                    <span
                        class="badge mb-2"
                        :class="statusBadgeClass(order.status)"
                    >
                        {{ order.status }}
                    </span>

                    <p class="small text-muted mb-0">
                        {{ statusMessage(order.status) }}
                    </p>
                    </div>
                </div>

                <div class="col-12 col-md text-md-end">
                  <p class="small text-muted mb-1">Total</p>
                  <p class="fw-bold text-primary fs-5 mb-0">
                    RM {{ Number(order.total).toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="card-body p-4">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="d-flex justify-content-between align-items-center border-bottom py-3"
              >
                <div class="d-flex align-items-center gap-3">
                    <div class="order-cover-frame rounded bg-light">
                        <img
                        v-if="item.image_url"
                        :src="item.image_url"
                        :alt="`${item.title} game cover`"
                        class="order-cover-image"
                        />

                        <span v-else aria-hidden="true">
                        🎮
                        </span>
                    </div>

                    <div>
                        <p class="fw-semibold mb-1">
                        {{ item.title }}
                        </p>
                  <p class="small text-muted mb-0">
                    {{ item.platform }} · Quantity: {{ item.quantity }}
                  </p>
                    </div>
                    </div>
                

                <p class="fw-semibold mb-0">
                  RM {{ (Number(item.price) * item.quantity).toFixed(2) }}
                </p>
              </div>

              <div class="mt-4">
                <p class="small text-muted mb-1">
                  Delivery Address
                </p>
                <p class="mb-3">
                  {{ order.address }}
                </p>

                <p class="small text-muted mb-1">
                  Payment Method
                </p>
                <p class="mb-0">
                  {{ order.payment_method }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>