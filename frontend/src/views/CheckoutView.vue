<script setup>
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const submitting = ref(false)
const error = ref('')

const form = reactive({
  fullName: authStore.user?.name || '',
  address: '',
  city: '',
  postcode: '',
  state: '',
  paymentMethod: 'Online Banking'
})

const fullAddress = computed(() => {
  return `${form.address}, ${form.postcode} ${form.city}, ${form.state}, Malaysia`
})

async function submitOrder() {
  error.value = ''

  if (cartStore.items.length === 0) {
    error.value = 'Your cart is empty.'
    return
  }

  if (
    !form.fullName.trim() ||
    !form.address.trim() ||
    !form.city.trim() ||
    !form.postcode.trim() ||
    !form.state.trim()
  ) {
    error.value = 'Please complete all delivery information.'
    return
  }

  submitting.value = true

  try {
    const response = await api.post(
      '/orders',
      {
        items: cartStore.items.map((item) => ({
          productId: item.id,
          quantity: item.quantity
        })),
        address: fullAddress.value,
        paymentMethod: form.paymentMethod
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    const orderId = response.data.order.id

    cartStore.clearCart()

    router.push({
      path: '/orders',
      query: {
        placed: orderId
      }
    })
  } catch (requestError) {
    error.value =
      requestError.response?.data?.message ||
      'Unable to place order. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="bg-dark text-white py-5">
    <div class="container">
      <span class="badge bg-primary mb-3">Secure Checkout</span>
      <h1 class="display-5 fw-bold">Checkout</h1>
      <p class="lead text-white-50 mb-0">
        Complete your delivery details and payment selection.
      </p>
    </div>
  </section>

  <section class="py-5 bg-light min-vh-100">
    <div class="container">
      <div
        v-if="cartStore.items.length === 0"
        class="card border-0 shadow-sm text-center"
      >
        <div class="card-body py-5">
          <div class="display-3 mb-3">🛒</div>
          <h2 class="h3 fw-bold">Your cart is empty</h2>
          <p class="text-muted">
            Add a game before proceeding to checkout.
          </p>

          <RouterLink to="/shop" class="btn btn-primary mt-3">
            Shop Games
          </RouterLink>
        </div>
      </div>

      <form v-else @submit.prevent="submitOrder">
        <div class="row g-4">
          <div class="col-12 col-lg-7">
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body p-4">
                <h2 class="h4 fw-bold mb-4">
                  Delivery Information
                </h2>

                <div
                  v-if="error"
                  class="alert alert-danger"
                  role="alert"
                >
                  {{ error }}
                </div>

                <div class="mb-3">
                  <label for="checkout-name" class="form-label fw-semibold">
                    Full Name
                  </label>

                  <input
                    id="checkout-name"
                    v-model.trim="form.fullName"
                    type="text"
                    class="form-control form-control-lg"
                    autocomplete="name"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label for="checkout-address" class="form-label fw-semibold">
                    Address
                  </label>

                  <textarea
                    id="checkout-address"
                    v-model.trim="form.address"
                    class="form-control"
                    rows="3"
                    placeholder="House number, street and residential area"
                    required
                  ></textarea>
                </div>

                <div class="row g-3">
                  <div class="col-12 col-md-5">
                    <label for="checkout-city" class="form-label fw-semibold">
                      City
                    </label>

                    <input
                      id="checkout-city"
                      v-model.trim="form.city"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>

                  <div class="col-12 col-md-3">
                    <label for="checkout-postcode" class="form-label fw-semibold">
                      Postcode
                    </label>

                    <input
                      id="checkout-postcode"
                      v-model.trim="form.postcode"
                      type="text"
                      class="form-control"
                      inputmode="numeric"
                      maxlength="5"
                      required
                    />
                  </div>

                  <div class="col-12 col-md-4">
                    <label for="checkout-state" class="form-label fw-semibold">
                      State
                    </label>

                    <select
                      id="checkout-state"
                      v-model="form.state"
                      class="form-select"
                      required
                    >
                      <option value="" disabled>Select state</option>
                      <option>Johor</option>
                      <option>Kedah</option>
                      <option>Kelantan</option>
                      <option>Melaka</option>
                      <option>Negeri Sembilan</option>
                      <option>Pahang</option>
                      <option>Perak</option>
                      <option>Perlis</option>
                      <option>Pulau Pinang</option>
                      <option>Sabah</option>
                      <option>Sarawak</option>
                      <option>Selangor</option>
                      <option>Terengganu</option>
                      <option>Kuala Lumpur</option>
                      <option>Putrajaya</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <h2 class="h4 fw-bold mb-4">
                  Payment Method
                </h2>

                <div class="form-check border rounded p-3 ps-5 mb-3">
                  <input
                    id="payment-online"
                    v-model="form.paymentMethod"
                    class="form-check-input"
                    type="radio"
                    value="Online Banking"
                  />
                  <label class="form-check-label fw-semibold" for="payment-online">
                    Online Banking
                  </label>
                  <p class="small text-muted mb-0">
                    FPX payment simulation for this project.
                  </p>
                </div>

                <div class="form-check border rounded p-3 ps-5 mb-3">
                  <input
                    id="payment-card"
                    v-model="form.paymentMethod"
                    class="form-check-input"
                    type="radio"
                    value="Credit / Debit Card"
                  />
                  <label class="form-check-label fw-semibold" for="payment-card">
                    Credit / Debit Card
                  </label>
                  <p class="small text-muted mb-0">
                    Secure card payment simulation.
                  </p>
                </div>

                <div class="form-check border rounded p-3 ps-5">
                  <input
                    id="payment-cod"
                    v-model="form.paymentMethod"
                    class="form-check-input"
                    type="radio"
                    value="Cash on Delivery"
                  />
                  <label class="form-check-label fw-semibold" for="payment-cod">
                    Cash on Delivery
                  </label>
                  <p class="small text-muted mb-0">
                    Pay when your games arrive.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside class="col-12 col-lg-5">
            <div class="card border-0 shadow-sm sticky-lg-top" style="top: 90px">
              <div class="card-body p-4">
                <h2 class="h4 fw-bold mb-4">
                  Order Summary
                </h2>

                <div
                  v-for="item in cartStore.items"
                  :key="item.id"
                  class="d-flex gap-3 align-items-center mb-3"
                >
                  <div
                    class="rounded bg-light d-flex align-items-center justify-content-center"
                    style="width: 58px; height: 58px; font-size: 1.8rem"
                  >
                    {{ item.image_emoji }}
                  </div>

                  <div class="flex-grow-1">
                    <p class="fw-semibold mb-0">
                      {{ item.title }}
                    </p>
                    <p class="small text-muted mb-0">
                      Qty: {{ item.quantity }}
                    </p>
                  </div>

                  <p class="mb-0 fw-semibold">
                    RM {{ (item.price * item.quantity).toFixed(2) }}
                  </p>
                </div>

                <hr />

                <div class="d-flex justify-content-between mb-3">
                  <span class="text-muted">Subtotal</span>
                  <span>RM {{ cartStore.subtotal.toFixed(2) }}</span>
                </div>

                <div class="d-flex justify-content-between mb-3">
                  <span class="text-muted">Delivery</span>
                  <span>
                    {{
                      cartStore.deliveryFee === 0
                        ? 'Free'
                        : `RM ${cartStore.deliveryFee.toFixed(2)}`
                    }}
                  </span>
                </div>

                <hr />

                <div class="d-flex justify-content-between fw-bold fs-5 mb-4">
                  <span>Total</span>
                  <span class="text-primary">
                    RM {{ cartStore.total.toFixed(2) }}
                  </span>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100"
                  :disabled="submitting"
                >
                  {{ submitting ? 'Placing Order...' : 'Place Order' }}
                </button>

                <RouterLink
                  to="/cart"
                  class="btn btn-outline-secondary w-100 mt-3"
                >
                  Return to Cart
                </RouterLink>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  </section>
</template>