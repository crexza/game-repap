<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useCartStore } from '../stores/cart'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()
const addedMessage = ref(false)

const platformColour = computed(() => {
  if (props.product.platform === 'PS5') return 'bg-primary'
  if (props.product.platform === 'PS4') return 'bg-dark'
  return 'bg-danger'
})

function addProduct() {
  cartStore.addToCart(props.product)
  addedMessage.value = true

  window.setTimeout(() => {
    addedMessage.value = false
  }, 1200)
}
</script>

<template>
  <article class="card h-100 border-0 shadow-sm">
    <RouterLink
      :to="`/games/${product.id}`"
      class="text-decoration-none text-dark"
      :aria-label="`View details for ${product.title}`"
    >
      <div
        class="bg-white text-center py-5 rounded-top"
        style="font-size: 4rem"
      >
        {{ product.image_emoji }}
      </div>
    </RouterLink>

    <div class="card-body d-flex flex-column">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="badge" :class="platformColour">
          {{ product.platform }}
        </span>

        <span class="text-warning fw-semibold">
          ★ {{ product.rating }}
        </span>
      </div>

      <RouterLink
        :to="`/games/${product.id}`"
        class="text-decoration-none text-dark"
      >
        <h3 class="h6 fw-bold">
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
          @click="addProduct"
        >
          {{ addedMessage ? 'Added ✓' : 'Add' }}
        </button>
      </div>
    </div>
  </article>
</template>