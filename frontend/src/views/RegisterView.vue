<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const localError = ref('')

async function submitRegistration() {
  localError.value = ''
  authStore.clearError()

  if (form.password !== form.confirmPassword) {
    localError.value = 'Passwords do not match.'
    return
  }

  const success = await authStore.register({
    name: form.name,
    email: form.email,
    password: form.password
  })

  if (success) {
    router.push('/account')
  }
}
</script>

<template>
  <section class="bg-light py-5 min-vh-100">
    <div class="container">
      <div class="row justify-content-center align-items-center g-5">
        <div class="col-12 col-lg-5">
          <span class="badge bg-primary mb-3">
            New Customer
          </span>

          <h1 class="display-6 fw-bold">
            Create your GameVault account
          </h1>

          <p class="text-muted lead">
            Register to checkout faster, manage orders and save your shopping details.
          </p>

          <ul class="list-unstyled mt-4">
            <li class="mb-3">✓ Secure password-protected account</li>
            <li class="mb-3">✓ Access your purchase history</li>
            <li class="mb-3">✓ Faster checkout experience</li>
          </ul>
        </div>

        <div class="col-12 col-lg-5">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <h2 class="h3 fw-bold mb-4">
                Register
              </h2>

              <div
                v-if="localError || authStore.error"
                class="alert alert-danger"
                role="alert"
              >
                {{ localError || authStore.error }}
              </div>

              <form @submit.prevent="submitRegistration">
                <div class="mb-3">
                  <label for="register-name" class="form-label fw-semibold">
                    Full Name
                  </label>

                  <input
                    id="register-name"
                    v-model.trim="form.name"
                    type="text"
                    class="form-control form-control-lg"
                    autocomplete="name"
                    required
                    minlength="2"
                  />
                </div>

                <div class="mb-3">
                  <label for="register-email" class="form-label fw-semibold">
                    Email Address
                  </label>

                  <input
                    id="register-email"
                    v-model.trim="form.email"
                    type="email"
                    class="form-control form-control-lg"
                    autocomplete="email"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label for="register-password" class="form-label fw-semibold">
                    Password
                  </label>

                  <input
                    id="register-password"
                    v-model="form.password"
                    type="password"
                    class="form-control form-control-lg"
                    autocomplete="new-password"
                    minlength="6"
                    required
                  />

                  <p class="form-text">
                    Minimum 6 characters.
                  </p>
                </div>

                <div class="mb-4">
                  <label for="confirm-password" class="form-label fw-semibold">
                    Confirm Password
                  </label>

                  <input
                    id="confirm-password"
                    v-model="form.confirmPassword"
                    type="password"
                    class="form-control form-control-lg"
                    autocomplete="new-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100"
                  :disabled="authStore.loading"
                >
                  {{
                    authStore.loading
                      ? 'Creating Account...'
                      : 'Create Account'
                  }}
                </button>
              </form>

              <p class="text-center text-muted mt-4 mb-0">
                Already have an account?
                <RouterLink to="/login" class="fw-semibold">
                  Log in
                </RouterLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>