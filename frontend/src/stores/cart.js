import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'gamevault_cart'

function loadSavedCart() {
  try {
    const savedCart = localStorage.getItem(STORAGE_KEY)
    return savedCart ? JSON.parse(savedCart) : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref(loadSavedCart())

  const itemCount = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0)
  )

  const subtotal = computed(() =>
    items.value.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0
    )
  )

  const deliveryFee = computed(() => {
    return subtotal.value >= 200 || subtotal.value === 0 ? 0 : 10
  })

  const total = computed(() => subtotal.value + deliveryFee.value)

  function addToCart(product, selectedQuantity = 1) {
    if (!product || product.stock === 0) {
      return false
    }

    const quantityToAdd = Number(selectedQuantity)
    const safeQuantity =
      Number.isInteger(quantityToAdd) && quantityToAdd > 0
        ? quantityToAdd
        : 1

    const existingItem = items.value.find((item) => item.id === product.id)

    if (existingItem) {
      const newQuantity = existingItem.quantity + safeQuantity
      existingItem.quantity = Math.min(newQuantity, product.stock)
      return true
    }

    items.value.push({
      id: product.id,
      title: product.title,
      platform: product.platform,
      price: Number(product.price),
      stock: product.stock,
      image_emoji: product.image_emoji,
      image_url: product.image_url || '',
      quantity: Math.min(safeQuantity, product.stock)
    })

    return true
  }

  function increaseQuantity(id) {
    const item = items.value.find((cartItem) => cartItem.id === id)

    if (item && item.quantity < item.stock) {
      item.quantity += 1
    }
  }

  function decreaseQuantity(id) {
    const item = items.value.find((cartItem) => cartItem.id === id)

    if (!item) return

    if (item.quantity > 1) {
      item.quantity -= 1
    } else {
      removeFromCart(id)
    }
  }

  function removeFromCart(id) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  function clearCart() {
    items.value = []
  }

  watch(
    items,
    (newItems) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
    },
    { deep: true }
  )

  return {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart
  }
})