<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useCartStore } from './stores/cart'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

function logout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <a
    href="#main-content"
    class="visually-hidden-focusable btn btn-primary position-absolute m-2"
  >
    Skip to main content
  </a>

  <nav class="navbar navbar-expand-lg navbar-dark bg-black shadow-sm sticky-top">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold" to="/">
        🎮 GameVault
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
        aria-controls="mainNavbar"
        aria-expanded="false"
        aria-label="Open navigation menu"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="mainNavbar" class="collapse navbar-collapse">
        <div class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
          <RouterLink class="nav-link" to="/">
            Home
          </RouterLink>

          <RouterLink class="nav-link" to="/shop">
            Shop
          </RouterLink>

          <RouterLink class="btn btn-outline-light ms-lg-3 mt-2 mt-lg-0" to="/cart">
            🛒 Cart
            <span class="badge bg-primary ms-1">
              {{ cartStore.itemCount }}
            </span>
          </RouterLink>

          <template v-if="authStore.isLoggedIn">

            <RouterLink
              class="btn btn-outline-light ms-lg-2 mt-2 mt-lg-0"
              to="/orders"
            >
              📦 Orders
            </RouterLink>
            <RouterLink
              class="btn btn-primary ms-lg-2 mt-2 mt-lg-0"
              to="/account"
            >
              👤 {{ authStore.user.name }}
            </RouterLink>

            <button
              type="button"
              class="btn btn-outline-danger ms-lg-2 mt-2 mt-lg-0"
              @click="logout"
            >
              Logout
            </button>
          </template>

          <template v-else>
            <RouterLink
              class="btn btn-outline-light ms-lg-2 mt-2 mt-lg-0"
              to="/login"
            >
              Login
            </RouterLink>

            <RouterLink
              class="btn btn-primary ms-lg-2 mt-2 mt-lg-0"
              to="/register"
            >
              Register
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </nav>

  <main id="main-content">
    <RouterView />
  </main>
</template>