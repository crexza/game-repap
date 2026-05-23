<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toast'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()
const toastStore = useToastStore()

const platformColour = computed(() => {
  if (props.product.platform === 'PS5') return 'bg-primary'
  if (props.product.platform === 'PS4') return 'bg-dark'
  return 'bg-danger'
})

function addProduct() {
  const added = cartStore.addToCart(props.product)

  if (added) {
    toastStore.show(`${props.product.title} added to cart.`)
  }
}
</script>

<template>
  <article class="card product-card h-100 border-0 shadow-sm">
    <RouterLink
      :to="`/games/${product.id}`"
      class="text-decoration-none text-dark"
      :aria-label="`View details for ${product.title}`"
    >
      <div class="product-cover-frame">
        <img
          v-if="product.image_url"
          :src="product.image_url"
          :alt="`${product.title} game cover`"
          class="product-cover-image"
        />

        <div
          v-else
          class="product-cover-placeholder"
        >
          <span>No cover uploaded</span>
        </div>
      </div>
    </RouterLink>

    <div class="card-body d-flex flex-column p-3">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="badge" :class="platformColour">
          {{ product.platform }}
        </span>

        <span class="text-warning fw-semibold" :aria-label="`${product.rating} out of 5 stars`">
          ★ {{ product.rating }}
        </span>
      </div>

      <RouterLink
        :to="`/games/${product.id}`"
        class="text-decoration-none text-dark"
      >
        <h3 class="h6 fw-bold product-title">
          {{ product.title }}
        </h3>
      </RouterLink>

      <p class="text-muted small mb-2">
        {{ product.genre }}
      </p>

      <p
        class="small mb-3"
        :class="product.stock < 10 ? 'text-warning' : 'text-success'"
      >
        {{ product.stock }} item(s) in stock
      </p>

      <div class="d-flex justify-content-between align-items-center mt-auto">
        <span class="fw-bold text-primary fs-5">
          RM {{ Number(product.price).toFixed(2) }}
        </span>

        <button
          type="button"
          class="btn btn-primary btn-sm"
          :disabled="product.stock === 0"
          :aria-label="`Add ${product.title} to cart`"
          @click="addProduct"
        >
          Add
        </button>
      </div>
    </div>
  </article>
</template>