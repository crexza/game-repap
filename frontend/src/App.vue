<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useCartStore } from './stores/cart'
import { useAuthStore } from './stores/auth'
import AppToast from './components/AppToast.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const showBrandBanner = computed(() => {
  return ['home', 'shop', 'product-detail'].includes(route.name)
})

function logout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <a
    href="#main-content"
    class="visually-hidden-focusable btn btn-primary position-absolute m-2 skip-z-index"
  >
    Skip to main content
  </a>

  <nav class="navbar navbar-expand-lg navbar-dark gameripap-navbar sticky-top">
    <div class="container">
      <RouterLink
        class="navbar-brand d-flex align-items-center gap-2 fw-bold"
        to="/"
      >
        <img
          src="/images/branding/gameripap-logo.png"
          alt="Gameripap logo"
          width="46"
          height="46"
          class="navbar-logo"
        />

        <span>Gameripap</span>
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

          <RouterLink
            class="btn btn-outline-light ms-lg-3 mt-2 mt-lg-0"
            to="/cart"
          >
            🛒 Cart
            <span class="badge rounded-pill bg-warning text-dark ms-1">
              {{ cartStore.itemCount }}
            </span>
          </RouterLink>

          <template v-if="authStore.isLoggedIn">
            <div class="dropdown ms-lg-2 mt-2 mt-lg-0">
              <button
                class="btn btn-light dropdown-toggle account-menu-button"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                👤 {{ authStore.user?.name }}
              </button>

              <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                <li>
                  <RouterLink class="dropdown-item" to="/account">
                    My Account
                  </RouterLink>
                </li>

                <li>
                  <RouterLink class="dropdown-item" to="/orders">
                    My Orders
                  </RouterLink>
                </li>

                <template v-if="authStore.isAdmin">
                  <li><hr class="dropdown-divider" /></li>

                  <li>
                    <RouterLink class="dropdown-item admin-menu-item" to="/admin">
                      ⚙️ Admin Dashboard
                    </RouterLink>
                  </li>

                  <li>
                    <RouterLink class="dropdown-item admin-menu-item" to="/admin/orders">
                      📦 Customer Orders
                    </RouterLink>
                  </li>
                </template>

                <li><hr class="dropdown-divider" /></li>

                <li>
                  <button
                    type="button"
                    class="dropdown-item text-danger"
                    @click="logout"
                  >
                    Log Out
                  </button>
                </li>
              </ul>
            </div>
          </template>

          <template v-else>
            <RouterLink
              class="btn btn-outline-light ms-lg-2 mt-2 mt-lg-0"
              to="/login"
            >
              Login
            </RouterLink>

            <RouterLink
              class="btn btn-warning ms-lg-2 mt-2 mt-lg-0 fw-semibold"
              to="/register"
            >
              Register
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </nav>

  <section
    v-if="showBrandBanner"
    class="page-brand-banner"
    aria-label="Gameripap promotional banner"
  >
    <img
      src="/images/branding/gameripap-page-banner.png"
      alt=""
    />
  </section>

  <main id="main-content">
    <RouterView />
  </main>

  <AppToast />
</template>