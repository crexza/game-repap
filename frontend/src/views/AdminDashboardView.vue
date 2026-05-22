<script setup>
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'


const authStore = useAuthStore()

const products = ref([])
const summary = ref({
  totalProducts: 0,
  totalOrders: 0,
  totalRevenue: 0,
  totalCustomers: 0
})

const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const successMessage = ref('')
const editingId = ref(null)
const coverFile = ref(null)
const coverPreview = ref('')
const uploadingCover = ref(false)


const emptyForm = () => ({
  title: '',
  platform: 'PS5',
  genre: '',
  price: '',
  stock: '',
  rating: 4.5,
  description: '',
  imageEmoji: '',
  imageUrl: '',
  featured: false
})

const form = reactive(emptyForm())

function authHeaders() {
  return {
    Authorization: `Bearer ${authStore.token}`
  }
}

async function loadDashboard() {
  loading.value = true
  error.value = ''

  try {
    const [productResponse, summaryResponse] = await Promise.all([
      api.get('/products'),
      api.get('/admin/summary', {
        headers: authHeaders()
      })
    ])

    products.value = productResponse.data
    summary.value = summaryResponse.data
  } catch (requestError) {
    error.value =
      requestError.response?.data?.message ||
      'Unable to load admin dashboard.'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, emptyForm())
  editingId.value = null
  coverFile.value = null
  coverPreview.value = ''
  error.value = ''
}

function editProduct(product) {
  editingId.value = product.id

  Object.assign(form, {
    title: product.title,
    platform: product.platform,
    genre: product.genre,
    price: Number(product.price),
    stock: product.stock,
    rating: Number(product.rating),
    description: product.description,
    imageEmoji: product.image_emoji,
    imageUrl: product.image_url || '',
    featured: product.featured
  })

    coverFile.value = null
  coverPreview.value = product.image_url || ''

  successMessage.value = ''

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

function selectCover(event) {
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    error.value = 'Please select a PNG, JPG or WebP image.'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Cover image must be smaller than 5 MB.'
    return
  }

  coverFile.value = file
  coverPreview.value = URL.createObjectURL(file)
  error.value = ''
}

async function uploadCoverIfSelected() {
  if (!coverFile.value) {
    return form.imageUrl
  }

  uploadingCover.value = true

  try {
    const uploadData = new FormData()
    uploadData.append('cover', coverFile.value)

    const response = await api.post(
  '/admin/uploads/game-cover',
  uploadData,
  {
    headers: {
      Authorization: `Bearer ${authStore.token}`
    }
  }
)

    return response.data.imageUrl
  } finally {
    uploadingCover.value = false
  }
}

async function submitProduct() {
  submitting.value = true
  error.value = ''
  successMessage.value = ''

    let uploadedImageUrl = form.imageUrl

  try {
    uploadedImageUrl = await uploadCoverIfSelected()
  } catch (requestError) {
    error.value =
      requestError.response?.data?.message ||
      'Unable to upload cover image.'
    submitting.value = false
    return
  }

  const productData = {
    title: form.title,
    platform: form.platform,
    genre: form.genre,
    price: Number(form.price),
    stock: Number(form.stock),
    rating: Number(form.rating),
    description: form.description,
    imageEmoji: form.imageEmoji,
    imageUrl: uploadedImageUrl,
    featured: form.featured
  }

  try {
    if (editingId.value) {
      await api.put(
        `/admin/products/${editingId.value}`,
        productData,
        {
          headers: authHeaders()
        }
      )

      successMessage.value = 'Game updated successfully.'
    } else {
      await api.post(
        '/admin/products',
        productData,
        {
          headers: authHeaders()
        }
      )

      successMessage.value = 'New game added successfully.'
    }

    resetForm()
    await loadDashboard()
  } catch (requestError) {
    error.value =
      requestError.response?.data?.message ||
      'Unable to save game.'
  } finally {
    submitting.value = false
  }
}

async function deleteProduct(product) {
  const confirmed = window.confirm(
    `Delete "${product.title}" from the catalogue?`
  )

  if (!confirmed) {
    return
  }

  error.value = ''
  successMessage.value = ''

  try {
    await api.delete(
      `/admin/products/${product.id}`,
      {
        headers: authHeaders()
      }
    )

    successMessage.value = `${product.title} deleted successfully.`

    if (editingId.value === product.id) {
      resetForm()
    }

    await loadDashboard()
  } catch (requestError) {
    error.value =
      requestError.response?.data?.message ||
      'Unable to delete game.'
  }
}

onMounted(loadDashboard)
</script>

<template>
  <section class="bg-dark text-white py-5">
    <div class="container">
      <span class="badge bg-danger mb-3">
        Administrator Access
      </span>

      <h1 class="display-5 fw-bold">
        Admin Dashboard
      </h1>

      <p class="lead text-white-50 mb-0">
        Manage products, stock levels and store performance.
      </p>
    </div>
  </section>

  <section class="py-5 bg-light min-vh-100">
    <div class="container">
        <div class="d-flex justify-content-end mb-4">
            <RouterLink
                to="/admin/orders"
                class="btn btn-danger"
            >
                📦 View Customer Orders
            </RouterLink>
            </div>
      <div
        v-if="error"
        class="alert alert-danger"
        role="alert"
      >
        {{ error }}
      </div>

      <div
        v-if="successMessage"
        class="alert alert-success"
        role="status"
      >
        {{ successMessage }}
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 text-muted">
          Loading admin dashboard...
        </p>
      </div>

      <template v-else>
        <div class="row g-4 mb-5">
          <div class="col-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-4">
                <p class="text-muted mb-2">
                  Products
                </p>
                <p class="display-6 fw-bold mb-0 text-primary">
                  {{ summary.totalProducts }}
                </p>
              </div>
            </div>
          </div>

          <div class="col-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-4">
                <p class="text-muted mb-2">
                  Orders
                </p>
                <p class="display-6 fw-bold mb-0 text-primary">
                  {{ summary.totalOrders }}
                </p>
              </div>
            </div>
          </div>

          <div class="col-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-4">
                <p class="text-muted mb-2">
                  Customers
                </p>
                <p class="display-6 fw-bold mb-0 text-primary">
                  {{ summary.totalCustomers }}
                </p>
              </div>
            </div>
          </div>

          <div class="col-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-4">
                <p class="text-muted mb-2">
                  Revenue
                </p>
                <p class="h3 fw-bold mb-0 text-success">
                  RM {{ Number(summary.totalRevenue).toFixed(2) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-12 col-xl-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <h2 class="h4 fw-bold mb-4">
                  {{ editingId ? 'Edit Game' : 'Add New Game' }}
                </h2>

                <form @submit.prevent="submitProduct">
                  <div class="mb-3">
                    <label for="admin-title" class="form-label fw-semibold">
                      Game Title
                    </label>

                    <input
                      id="admin-title"
                      v-model.trim="form.title"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>

                  <div class="row g-3 mb-3">
                    <div class="col-6">
                      <label for="admin-platform" class="form-label fw-semibold">
                        Platform
                      </label>

                      <select
                        id="admin-platform"
                        v-model="form.platform"
                        class="form-select"
                        required
                      >
                        <option value="PS5">PS5</option>
                        <option value="PS4">PS4</option>
                        <option value="Switch">Switch</option>
                      </select>
                    </div>

                    <div class="col-6">
                      <label for="admin-genre" class="form-label fw-semibold">
                        Genre
                      </label>

                      <input
                        id="admin-genre"
                        v-model.trim="form.genre"
                        type="text"
                        class="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div class="row g-3 mb-3">
                    <div class="col-6">
                      <label for="admin-price" class="form-label fw-semibold">
                        Price (RM)
                      </label>

                      <input
                        id="admin-price"
                        v-model="form.price"
                        type="number"
                        class="form-control"
                        min="0.01"
                        step="0.01"
                        required
                      />
                    </div>

                    <div class="col-6">
                      <label for="admin-stock" class="form-label fw-semibold">
                        Stock
                      </label>

                      <input
                        id="admin-stock"
                        v-model="form.stock"
                        type="number"
                        class="form-control"
                        min="0"
                        step="1"
                        required
                      />
                    </div>
                  </div>

                  <div class="row g-3 mb-3">
                    <div class="col-6">
                      <label for="admin-rating" class="form-label fw-semibold">
                        Rating
                      </label>

                      <input
                        id="admin-rating"
                        v-model="form.rating"
                        type="number"
                        class="form-control"
                        min="0"
                        max="5"
                        step="0.1"
                        required
                      />
                    </div>

                   
                  </div>

                  <div class="mb-3">
                    <label for="admin-description" class="form-label fw-semibold">
                      Description
                    </label>

                    <textarea
                      id="admin-description"
                      v-model.trim="form.description"
                      class="form-control"
                      rows="4"
                      minlength="10"
                      required
                    ></textarea>
                  </div>
                  <div class="mb-3">
                    <label for="admin-cover" class="form-label fw-semibold">
                        Game Cover Image
                    </label>

                    <input
                        id="admin-cover"
                        type="file"
                        class="form-control"
                        accept="image/png,image/jpeg,image/webp"
                        @change="selectCover"
                    />

                    <p class="form-text">
                        PNG, JPG or WebP. Maximum size 5 MB.
                    </p>

                    <img
                        v-if="coverPreview"
                        :src="coverPreview"
                        alt="Selected game cover preview"
                        class="admin-cover-preview mt-3"
                    />
                    </div>

                  <div class="form-check mb-4">
                    <input
                      id="admin-featured"
                      v-model="form.featured"
                      type="checkbox"
                      class="form-check-input"
                    />

                    <label for="admin-featured" class="form-check-label">
                      Display as featured game
                    </label>
                  </div>

                  <button
                    type="submit"
                    class="btn btn-primary w-100"
                    :disabled="submitting"
                  >
                    {{
                        uploadingCover
                            ? 'Uploading Cover...'
                            : submitting
                            ? 'Saving...'
                            : editingId
                                ? 'Update Game'
                                : 'Add Game'
                        }}
                  </button>

                  <button
                    v-if="editingId"
                    type="button"
                    class="btn btn-outline-secondary w-100 mt-3"
                    @click="resetForm"
                  >
                    Cancel Editing
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div class="col-12 col-xl-8">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h2 class="h4 fw-bold mb-0">
                    Product Inventory
                  </h2>

                  <span class="badge bg-primary">
                    {{ products.length }} games
                  </span>
                </div>

                <div class="table-responsive">
                  <table class="table align-middle">
                    <caption class="visually-hidden">
                      Game product inventory management table
                    </caption>

                    <thead>
                      <tr>
                        <th scope="col">Game</th>
                        <th scope="col">Platform</th>
                        <th scope="col">Price</th>
                        <th scope="col">Stock</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr
                        v-for="product in products"
                        :key="product.id"
                      >
                        <td>
                          <div class="d-flex align-items-center gap-3">
                           <div class="admin-table-cover rounded bg-light">
                            <img
                                v-if="product.image_url"
                                :src="product.image_url"
                                :alt="`${product.title} game cover`"
                                class="admin-table-cover-image"
                            />

                            <span v-else class="fs-3" aria-hidden="true">
                                {{ product.image_emoji }}
                            </span>
                            </div>

                            <div>
                              <p class="fw-semibold mb-0">
                                {{ product.title }}
                              </p>
                              <p class="small text-muted mb-0">
                                {{ product.genre }}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            class="badge"
                            :class="{
                              'bg-primary': product.platform === 'PS5',
                              'bg-dark': product.platform === 'PS4',
                              'bg-danger': product.platform === 'Switch'
                            }"
                          >
                            {{ product.platform }}
                          </span>
                        </td>

                        <td>
                          RM {{ Number(product.price).toFixed(2) }}
                        </td>

                        <td>
                          <span
                            :class="product.stock < 5 ? 'text-danger fw-bold' : ''"
                          >
                            {{ product.stock }}
                          </span>
                        </td>

                        <td>
                          <div class="d-flex gap-2">
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-primary"
                              :aria-label="`Edit ${product.title}`"
                              @click="editProduct(product)"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              class="btn btn-sm btn-outline-danger"
                              :aria-label="`Delete ${product.title}`"
                              @click="deleteProduct(product)"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="alert alert-light border mt-4 mb-0">
                  Games included in completed orders cannot be deleted because
                  purchase records must be preserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>