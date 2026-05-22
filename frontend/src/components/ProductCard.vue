<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const platformClass = computed(() => {
  return {
    PS5: 'platform-ps5',
    PS4: 'platform-ps4',
    Switch: 'platform-switch'
  }[props.product.platform]
})
</script>

<template>
  <article class="game-card h-100">
    <div class="game-image position-relative">
      <span :class="['platform-badge', platformClass]">
        {{ product.platform }}
      </span>

      <span class="game-emoji" aria-hidden="true">
        {{ product.image_emoji }}
      </span>
    </div>

    <div class="game-card-body">
      <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
        <span class="genre-text">{{ product.genre }}</span>
        <span class="rating-text" :aria-label="`${product.rating} out of 5 stars`">
          <i class="bi bi-star-fill"></i>
          {{ product.rating }}
        </span>
      </div>

      <h3 class="game-title">{{ product.title }}</h3>

      <p class="stock-text" :class="{ 'low-stock': product.stock < 10 }">
        {{ product.stock > 0 ? `${product.stock} in stock` : 'Out of stock' }}
      </p>

      <div class="d-flex align-items-center justify-content-between mt-auto pt-3">
        <p class="game-price mb-0">RM {{ product.price.toFixed(2) }}</p>

        <button
          class="btn-add-cart"
          type="button"
          :disabled="product.stock === 0"
          :aria-label="`Add ${product.title} to cart`"
        >
          <i class="bi bi-bag-plus"></i>
          <span class="d-none d-sm-inline">Add</span>
        </button>
      </div>
    </div>
  </article>
</template>