<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../services/api'

const products = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response = await api.get('/products')
    products.value = response.data
  } catch (err) {
    error.value = 'Unable to connect to backend API.'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="bg-dark text-white py-5">
    <div class="container">
      <div class="row align-items-center g-5">
        <div class="col-12 col-lg-6">
          <span class="badge bg-primary mb-3">
            Malaysia Gaming Store
          </span>

          <h1 class="display-4 fw-bold">
            GameVault Malaysia
          </h1>
          
          <p class="lead text-white-50 mt-3">            Buy original PS4, PS5 and Nintendo Switch games with fast delivery
            across Malaysia.
          </p>

          <div class="d-flex gap-3 mt-4 flex-wrap">
            <RouterLink to="/shop" class="btn btn-primary btn-lg">
              Shop Games
            </RouterLink>

            <button class="btn btn-outline-light btn-lg">
              View Platforms
            </button>
          </div>
        </div>

        <div class="col-12 col-lg-6 text-center">
          <div
            class="rounded-4 p-5 bg-primary-subtle text-dark shadow-lg"
          >
            <div style="font-size: 5rem">
              🎮
            </div>

            <h2 class="fw-bold mt-3">
              Physical Console Games
            </h2>

            <p class="mb-0">
              PS4 • PS5 • Nintendo Switch
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">
          Featured Games
        </h2>

        <p class="text-muted mb-0">
          Trending games from our catalogue.
        </p>
      </div>

      <RouterLink to="/shop" class="btn btn-outline-primary">
        View All
      </RouterLink>
    </div>

    <div
      v-if="loading"
      class="text-center py-5"
    >
      <div class="spinner-border text-primary"></div>

      <p class="mt-3">
        Loading games...
      </p>
    </div>

    <div
      v-else-if="error"
      class="alert alert-danger"
    >
      {{ error }}
    </div>

    <div v-else class="row g-4">
      <div
        v-for="product in products"
        :key="product.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <div class="card h-100 shadow-sm border-0">
          <div
            class="bg-light text-center py-5"
            style="font-size: 4rem"
          >
            {{ product.image_emoji }}
          </div>

          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between mb-2">
              <span class="badge bg-dark">
                {{ product.platform }}
              </span>

              <span class="text-warning fw-bold">
                ★ {{ product.rating }}
              </span>
            </div>

            <h3 class="h5 fw-bold">
              {{ product.title }}
            </h3>

            <p class="text-muted">
              {{ product.genre }}
            </p>

            <p class="small text-secondary flex-grow-1">
              {{ product.description }}
            </p>

            <div class="d-flex justify-content-between align-items-center mt-3">
              <span class="fw-bold text-primary fs-5">
                RM {{ product.price }}
              </span>

              <button class="btn btn-primary">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>