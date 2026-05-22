<script setup>
import { reactive } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

async function submitLogin() {
  authStore.clearError()

  const success = await authStore.login(form)

  if (success) {
    const redirectPath = String(route.query.redirect || '/account')
    router.push(redirectPath)
  }
}
</script>

<template>
  <section class="bg-light py-5 min-vh-100">
    <div class="container">
      <div class="row justify-content-center align-items-center g-5">
        <div class="col-12 col-lg-5">
          <span class="badge bg-primary mb-3">
            Welcome Back
          </span>

          <h1 class="display-6 fw-bold">
            Log in to Gameripap
          </h1>

          <p class="text-muted lead">
            Access your cart, account details and order history securely.
          </p>

          <div class="card border-primary bg-primary-subtle mt-4">
            <div class="card-body">
              <h2 class="h6 fw-bold">
                Admin Demo Login
              </h2>

              <p class="small mb-1">
                Email: <strong>admin@gamevault.my</strong>
              </p>

              <p class="small mb-0">
                Password: <strong>admin123</strong>
              </p>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <h2 class="h3 fw-bold mb-4">
                Login
              </h2>

              <div
                v-if="authStore.error"
                class="alert alert-danger"
                role="alert"
              >
                {{ authStore.error }}
              </div>

              <form @submit.prevent="submitLogin">
                <div class="mb-3">
                  <label for="login-email" class="form-label fw-semibold">
                    Email Address
                  </label>

                  <input
                    id="login-email"
                    v-model.trim="form.email"
                    type="email"
                    class="form-control form-control-lg"
                    autocomplete="email"
                    required
                  />
                </div>

                <div class="mb-4">
                  <label for="login-password" class="form-label fw-semibold">
                    Password
                  </label>

                  <input
                    id="login-password"
                    v-model="form.password"
                    type="password"
                    class="form-control form-control-lg"
                    autocomplete="current-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100"
                  :disabled="authStore.loading"
                >
                  {{ authStore.loading ? 'Logging In...' : 'Login' }}
                </button>
              </form>

              <p class="text-center text-muted mt-4 mb-0">
                New to Gameripap?
                <RouterLink to="/register" class="fw-semibold">
                  Create an account
                </RouterLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>