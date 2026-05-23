<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import api from '../services/api'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toast'

const route = useRoute()
const cartStore = useCartStore()
const toastStore = useToastStore()

const product = ref(null)
const quantity = ref(1)
const loading = ref(true)
const error = ref('')

const platformClass = computed(() => {
  if (product.value?.platform === 'PS5') return 'bg-primary'
  if (product.value?.platform === 'PS4') return 'bg-dark'
  return 'bg-danger'
})

async function loadProduct() {
  try {
    const response = await api.get(`/products/${route.params.id}`)
    product.value = response.data
  } catch (requestError) {
    error.value = 'Game not found or backend is unavailable.'
    console.error(requestError)
  } finally {
    loading.value = false
  }
}

function increaseQuantity() {
  if (quantity.value < product.value.stock) {
    quantity.value += 1
  }
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value -= 1
  }
}

function addProduct() {
  cartStore.addToCart(product.value, quantity.value)
  toastStore.show(`${quantity.value} × ${product.value.title} added to cart.`)
}

onMounted(loadProduct)
</script>

<template>
  <section class="py-5 bg-light min-vh-100">
    <div class="container">
      <RouterLink to="/shop" class="btn btn-link text-decoration-none px-0 mb-4">
        ← Back to Shop
      </RouterLink>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3">Loading game details...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <div v-else class="card product-detail-card border-0 shadow-sm overflow-hidden">
        <div class="row g-0">
          <div class="col-12 col-lg-5 bg-white p-4 p-lg-5 d-flex justify-content-center align-items-center">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="`${product.title} game cover`"
              class="product-detail-cover"
            />

            <div v-else class="cover-not-available">
              No cover uploaded
            </div>
          </div>

          <div class="col-12 col-lg-7">
            <div class="card-body p-4 p-lg-5">
              <span class="badge mb-3" :class="platformClass">
                {{ product.platform }}
              </span>

              <h1 class="display-6 fw-bold">
                {{ product.title }}
              </h1>

              <p class="text-warning fw-semibold fs-5">
                ★ {{ product.rating }} / 5
              </p>

              <p class="text-muted">
                Genre: {{ product.genre }}
              </p>

              <p class="lead product-description">
                {{ product.description }}
              </p>

              <p
                class="fw-semibold"
                :class="product.stock < 10 ? 'text-warning' : 'text-success'"
              >
                {{ product.stock }} item(s) available
              </p>

              <p class="display-6 fw-bold text-primary mt-4">
                RM {{ Number(product.price).toFixed(2) }}
              </p>

              <div class="mt-4">
                <label class="form-label fw-semibold">
                  Quantity
                </label>

                <div class="d-flex align-items-center gap-3">
                  <button
                    type="button"
                    class="btn btn-outline-secondary quantity-button"
                    aria-label="Decrease quantity"
                    :disabled="quantity <= 1"
                    @click="decreaseQuantity"
                  >
                    −
                  </button>

                  <span class="fs-5 fw-bold quantity-number">
                    {{ quantity }}
                  </span>

                  <button
                    type="button"
                    class="btn btn-outline-secondary quantity-button"
                    aria-label="Increase quantity"
                    :disabled="quantity >= product.stock"
                    @click="increaseQuantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div class="d-flex flex-column flex-sm-row gap-3 mt-4">
                <button
                  type="button"
                  class="btn btn-primary btn-lg"
                  :disabled="product.stock === 0"
                  @click="addProduct"
                >
                  Add to Cart
                </button>

                <RouterLink to="/cart" class="btn btn-outline-dark btn-lg">
                  Go to Cart
                </RouterLink>
              </div>

              <div class="row g-3 mt-4">
                <div class="col-12 col-sm-4">
                  <div class="trust-card">
                    <span aria-hidden="true">✓</span>
                    Original Game
                  </div>
                </div>

                <div class="col-12 col-sm-4">
                  <div class="trust-card">
                    <span aria-hidden="true">🚚</span>
                    Malaysia Delivery
                  </div>
                </div>

                <div class="col-12 col-sm-4">
                  <div class="trust-card">
                    <span aria-hidden="true">🔒</span>
                    Secure Checkout
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