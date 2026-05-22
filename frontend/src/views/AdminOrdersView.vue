<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const orders = ref([])
const loading = ref(true)
const error = ref('')

async function loadAdminOrders() {
  try {
    const response = await api.get('/admin/orders', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    orders.value = response.data
  } catch (requestError) {
    error.value =
      requestError.response?.data?.message ||
      'Unable to load customer orders.'
  } finally {
    loading.value = false
  }
}

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleString('en-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
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

async function updateStatus(order) {
  error.value = ''

  try {
    const response = await api.patch(
      `/admin/orders/${order.id}/status`,
      {
        status: order.status
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    order.status = response.data.order.status
  } catch (requestError) {
    error.value =
      requestError.response?.data?.message ||
      'Unable to update order status.'
  }
}

onMounted(loadAdminOrders)
</script>

<template>
  <section class="bg-dark text-white py-5">
    <div class="container">
      <span class="badge bg-danger mb-3">
        Administrator Access
      </span>

      <h1 class="display-5 fw-bold">
        Customer Orders
      </h1>

      <p class="lead text-white-50 mb-0">
        View customer purchases, payment methods and delivery information.
      </p>
    </div>
  </section>

  <section class="py-5 bg-light min-vh-100">
    <div class="container">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <RouterLink to="/admin" class="btn btn-outline-primary">
          ← Back to Admin Dashboard
        </RouterLink>

        <span class="badge bg-primary fs-6">
          {{ orders.length }} Total Order(s)
        </span>
      </div>

      <div
        v-if="loading"
        class="text-center py-5"
      >
        <div class="spinner-border text-primary" role="status"></div>

        <p class="mt-3 text-muted">
          Loading customer orders...
        </p>
      </div>

      <div
        v-else-if="error"
        class="alert alert-danger"
        role="alert"
      >
        {{ error }}
      </div>

      <div
        v-else-if="orders.length === 0"
        class="card border-0 shadow-sm text-center"
      >
        <div class="card-body py-5">
          <div class="display-3 mb-3">
            📦
          </div>

          <h2 class="h3 fw-bold">
            No customer orders yet
          </h2>

          <p class="text-muted mb-0">
            Completed customer purchases will appear here.
          </p>
        </div>
      </div>

      <div v-else class="row g-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="col-12"
        >
          <article class="card border-0 shadow-sm overflow-hidden">
            <div class="card-header bg-white p-4">
              <div class="row align-items-center g-3">
                <div class="col-12 col-md-2">
                  <p class="small text-muted mb-1">
                    Order Reference
                  </p>

                  <h2 class="h5 fw-bold mb-0">
                    #{{ order.id }}
                  </h2>
                </div>

                <div class="col-12 col-md-3">
                  <p class="small text-muted mb-1">
                    Customer
                  </p>

                  <p class="fw-semibold mb-0">
                    {{ order.customer_name }}
                  </p>

                  <p class="small text-muted mb-0">
                    {{ order.customer_email }}
                  </p>
                </div>

                <div class="col-6 col-md-3">
                  <p class="small text-muted mb-1">
                    Date
                  </p>

                  <p class="fw-semibold mb-0">
                    {{ formatDate(order.created_at) }}
                  </p>
                </div>

                <div class="col-6 col-md-2">
                  <p class="small text-muted mb-1">
                    Status
                  </p>

                 <div class="d-flex flex-column gap-2">
                    <span
                        class="badge align-self-start"
                        :class="statusBadgeClass(order.status)"
                    >
                        {{ order.status }}
                    </span>

                    <label
                        class="visually-hidden"
                        :for="`order-status-${order.id}`"
                    >
                        Update status for order {{ order.id }}
                    </label>

                    <select
                        :id="`order-status-${order.id}`"
                        v-model="order.status"
                        class="form-select form-select-sm"
                        @change="updateStatus(order)"
                    >
                        <option value="Paid">Paid</option>
                        <option value="Packing">Packing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    </div>
                </div>

                <div class="col-12 col-md-2 text-md-end">
                  <p class="small text-muted mb-1">
                    Total
                  </p>

                  <p class="fw-bold text-primary fs-5 mb-0">
                    RM {{ Number(order.total).toFixed(2) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="card-body p-4">
              <h3 class="h6 fw-bold mb-3">
                Items Purchased
              </h3>

              <div class="table-responsive mb-4">
                <table class="table align-middle mb-0">
                  <caption class="visually-hidden">
                    Items purchased in order {{ order.id }}
                  </caption>

                  <thead>
                    <tr>
                      <th scope="col">Game</th>
                      <th scope="col">Platform</th>
                      <th scope="col">Price</th>
                      <th scope="col">Quantity</th>
                      <th scope="col" class="text-end">Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="item in order.items"
                      :key="item.id"
                    >
                      <td class="fw-semibold">
                        {{ item.title }}
                      </td>

                      <td>
                        <span
                          class="badge"
                          :class="{
                            'bg-primary': item.platform === 'PS5',
                            'bg-dark': item.platform === 'PS4',
                            'bg-danger': item.platform === 'Switch'
                          }"
                        >
                          {{ item.platform }}
                        </span>
                      </td>

                      <td>
                        RM {{ Number(item.price).toFixed(2) }}
                      </td>

                      <td>
                        {{ item.quantity }}
                      </td>

                      <td class="text-end fw-semibold">
                        RM {{ (Number(item.price) * item.quantity).toFixed(2) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="row g-4">
                <div class="col-12 col-lg-8">
                  <p class="small text-muted mb-1">
                    Delivery Address
                  </p>

                  <p class="mb-0">
                    {{ order.address }}
                  </p>
                </div>

                <div class="col-12 col-lg-4">
                  <p class="small text-muted mb-1">
                    Payment Method
                  </p>

                  <p class="fw-semibold mb-0">
                    {{ order.payment_method }}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>