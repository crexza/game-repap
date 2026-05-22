<script setup>
import { RouterLink } from 'vue-router'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()
</script>

<template>
  <section class="bg-dark text-white py-5">
    <div class="container">
      <span class="badge bg-primary mb-3">Shopping Cart</span>
      <h1 class="display-5 fw-bold">Your Cart</h1>
      <p class="lead text-white-50 mb-0">
        Review your games before checkout.
      </p>
    </div>
  </section>

  <section class="py-5 bg-light min-vh-100">
    <div class="container">
      <div v-if="cartStore.items.length === 0" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5">
          <div class="display-3 mb-3">🛒</div>
          <h2 class="fw-bold">Your cart is empty</h2>
          <p class="text-muted">
            Start adding PS4, PS5 or Switch games to your cart.
          </p>
          <RouterLink to="/shop" class="btn btn-primary mt-3">
            Browse Games
          </RouterLink>
        </div>
      </div>

      <div v-else class="row g-4">
        <div class="col-12 col-lg-8">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="card border-0 shadow-sm mb-3"
          >
            <div class="card-body">
              <div class="row align-items-center g-3">
                <div class="col-auto">
                  <div
                    class="rounded bg-light d-flex align-items-center justify-content-center"
                    style="width: 88px; height: 88px; font-size: 2.6rem"
                  >
                    {{ item.image_emoji }}
                  </div>
                </div>

                <div class="col">
                  <span class="badge bg-dark mb-2">
                    {{ item.platform }}
                  </span>

                  <h2 class="h5 fw-bold mb-1">
                    {{ item.title }}
                  </h2>

                  <p class="text-primary fw-bold mb-0">
                    RM {{ Number(item.price).toFixed(2) }}
                  </p>
                </div>

                <div class="col-12 col-sm-auto">
                  <div class="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      :aria-label="`Decrease quantity of ${item.title}`"
                      @click="cartStore.decreaseQuantity(item.id)"
                    >
                      −
                    </button>

                    <span class="fw-bold px-2">
                      {{ item.quantity }}
                    </span>

                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      :disabled="item.quantity >= item.stock"
                      :aria-label="`Increase quantity of ${item.title}`"
                      @click="cartStore.increaseQuantity(item.id)"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div class="col-12 col-sm-auto">
                  <button
                    type="button"
                    class="btn btn-outline-danger"
                    @click="cartStore.removeFromCart(item.id)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="col-12 col-lg-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h2 class="h4 fw-bold mb-4">
                Order Summary
              </h2>

              <div class="d-flex justify-content-between mb-3">
                <span class="text-muted">Subtotal</span>
                <span>RM {{ cartStore.subtotal.toFixed(2) }}</span>
              </div>

              <div class="d-flex justify-content-between mb-3">
                <span class="text-muted">Delivery</span>
                <span>
                  {{ cartStore.deliveryFee === 0 ? 'Free' : `RM ${cartStore.deliveryFee.toFixed(2)}` }}
                </span>
              </div>

              <hr />

              <div class="d-flex justify-content-between fw-bold fs-5 mb-4">
                <span>Total</span>
                <span class="text-primary">
                  RM {{ cartStore.total.toFixed(2) }}
                </span>
              </div>

             <RouterLink
             to="/checkout"
             class="btn btn-primary w-100 btn-lg"
             >
             Proceed to Checkout
            </RouterLink>

              <RouterLink
                to="/shop"
                class="btn btn-outline-secondary w-100 mt-3"
              >
                Continue Shopping
              </RouterLink>

              <button
                type="button"
                class="btn btn-link text-danger w-100 mt-2"
                @click="cartStore.clearCart"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>