<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../services/api'
import ProductCard from '../components/ProductCard.vue'

const products = ref([])
const loading = ref(true)
const error = ref('')
const searchText = ref('')
const selectedPlatform = ref('All')
const sortBy = ref('featured')

const platforms = ['All', 'PS5', 'PS4', 'Switch']

async function loadProducts() {
  try {
    const response = await api.get('/products')
    products.value = response.data
  } catch (err) {
    error.value = 'Unable to load products. Please make sure the backend is running.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const filteredProducts = computed(() => {
  let result = [...products.value]

  if (selectedPlatform.value !== 'All') {
    result = result.filter((product) => product.platform === selectedPlatform.value)
  }

  const query = searchText.value.toLowerCase().trim()

  if (query) {
    result = result.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.genre.toLowerCase().includes(query)
    )
  }

  if (sortBy.value === 'price-low') {
    result.sort((a, b) => Number(a.price) - Number(b.price))
  } else if (sortBy.value === 'price-high') {
    result.sort((a, b) => Number(b.price) - Number(a.price))
  } else if (sortBy.value === 'rating') {
    result.sort((a, b) => Number(b.rating) - Number(a.rating))
  } else {
    result.sort((a, b) => Number(b.featured) - Number(a.featured))
  }

  return result
})

onMounted(loadProducts)
</script>

<template>
  <section class="bg-dark text-white py-5">
    <div class="container">
      <span class="badge bg-primary mb-3">Game Catalogue</span>
      <h1 class="display-5 fw-bold">Shop Games</h1>
      <p class="lead text-white-50 mb-0">
        Browse physical games for PS4, PS5 and Nintendo Switch.
      </p>
    </div>
  </section>

  <section class="py-5 bg-light min-vh-100">
    <div class="container">
      <div class="card border-0 shadow-sm mb-5">
        <div class="card-body p-4">
          <div class="row g-3 align-items-end">
            <div class="col-12 col-lg-5">
              <label for="search-game" class="form-label fw-semibold">
                Search Games
              </label>

              <input
                id="search-game"
                v-model="searchText"
                type="search"
                class="form-control"
                placeholder="Search title or genre"
              />
            </div>

            <div class="col-12 col-lg-4">
              <label class="form-label fw-semibold">Platform</label>

              <div class="d-flex gap-2 flex-wrap">
                <button
                  v-for="platform in platforms"
                  :key="platform"
                  type="button"
                  class="btn"
                  :class="selectedPlatform === platform ? 'btn-primary' : 'btn-outline-secondary'"
                  @click="selectedPlatform = platform"
                >
                  {{ platform }}
                </button>
              </div>
            </div>

            <div class="col-12 col-lg-3">
              <label for="sort-games" class="form-label fw-semibold">
                Sort By
              </label>

              <select id="sort-games" v-model="sortBy" class="form-select">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3 fw-bold mb-0">Available Games</h2>
        <span class="text-muted">{{ filteredProducts.length }} result(s)</span>
      </div>

      <div v-if="loading" class="text-center py-5" aria-live="polite">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 text-muted">Loading products...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <div v-else-if="filteredProducts.length === 0" class="text-center py-5">
        <div class="display-4 mb-3">🎮</div>
        <h2 class="h4 fw-bold">No games found</h2>
        <p class="text-muted">Try another search or platform.</p>
      </div>

      <div v-else class="row g-4">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="col-12 col-sm-6 col-lg-4 col-xl-3"
        >
          <ProductCard :product="product" />
        </div>
      </div>
    </div>
  </section>
</template>