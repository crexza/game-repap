<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import api from '../services/api'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const cartStore = useCartStore()

const product = ref(null)
const loading = ref(true)
const error = ref('')
const addedMessage = ref(false)

async function loadProduct() {
  try {
    const response = await api.get(`/products/${route.params.id}`)
    product.value = response.data
  } catch (err) {
    error.value = 'Game not found or backend is unavailable.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function addProduct() {
  cartStore.addToCart(product.value)
  addedMessage.value = true

  window.setTimeout(() => {
    addedMessage.value = false
  }, 1500)
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

      <div v-else class="card border-0 shadow-sm overflow-hidden">
        <div class="row g-0">
          <div class="col-12 col-lg-5 bg-white p-4 d-flex justify-content-center align-items-center">
            <img
                v-if="product.image_url"
                :src="product.image_url"
                :alt="`${product.title} game cover`"
                class="product-detail-cover"
            />

            <div
                v-else
                style="font-size: 9rem"
                aria-hidden="true"
            >
                {{ product.image_emoji }}
            </div>
            </div>

          <div class="col-12 col-lg-7">
            <div class="card-body p-4 p-lg-5">
              <span
                class="badge mb-3"
                :class="{
                  'bg-primary': product.platform === 'PS5',
                  'bg-dark': product.platform === 'PS4',
                  'bg-danger': product.platform === 'Switch'
                }"
              >
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

              <p class="lead">
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

              <div class="d-flex flex-column flex-sm-row gap-3 mt-4">
                <button
                  type="button"
                  class="btn btn-primary btn-lg"
                  :disabled="product.stock === 0"
                  @click="addProduct"
                >
                  {{ addedMessage ? 'Added to Cart ✓' : 'Add to Cart' }}
                </button>

                <RouterLink to="/cart" class="btn btn-outline-dark btn-lg">
                  Go to Cart
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>