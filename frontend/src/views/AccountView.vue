<script setup>
import { onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  authStore.loadProfile()
})

function logout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <section class="bg-light py-5 min-vh-100">
    <div class="container">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-5">
        <div>
          <span class="badge bg-primary mb-2">
            My Account
          </span>

          <h1 class="display-6 fw-bold mb-0">
            Welcome, {{ authStore.user?.name }}
          </h1>
        </div>

        <button
          type="button"
          class="btn btn-outline-danger"
          @click="logout"
        >
          Log Out
        </button>
      </div>

      <div class="row g-4">
        <div class="col-12 col-lg-5">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <h2 class="h4 fw-bold mb-4">
                Profile Information
              </h2>

              <dl class="row mb-0">
                <dt class="col-sm-4 text-muted mb-3">Name</dt>
                <dd class="col-sm-8 mb-3">
                  {{ authStore.user?.name }}
                </dd>

                <dt class="col-sm-4 text-muted mb-3">Email</dt>
                <dd class="col-sm-8 mb-3">
                  {{ authStore.user?.email }}
                </dd>

                <dt class="col-sm-4 text-muted mb-3">Role</dt>
                <dd class="col-sm-8 mb-3">
                  <span
                    class="badge"
                    :class="authStore.isAdmin ? 'bg-danger' : 'bg-primary'"
                  >
                    {{ authStore.user?.role }}
                  </span>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-7">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <h2 class="h4 fw-bold mb-4">
                Quick Actions
              </h2>

              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <RouterLink
                    to="/cart"
                    class="btn btn-outline-primary w-100 py-3"
                  >
                    🛒 View Shopping Cart
                  </RouterLink>
                </div>

                <div class="col-12 col-sm-6">
                  <RouterLink
                    to="/shop"
                    class="btn btn-outline-primary w-100 py-3"
                  >
                    🎮 Continue Shopping
                  </RouterLink>
                </div>

                <div class="col-12">
                  <div class="alert alert-secondary mb-0">
                    Order history will be connected after the checkout function is completed.
                  </div>
                </div>

                <div v-if="authStore.isAdmin" class="col-12">
                  <div class="alert alert-danger mb-0">
                    Admin account detected. Product management dashboard will be added next.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>