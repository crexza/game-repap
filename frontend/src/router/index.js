import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ShopView from '../views/ShopView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CartView from '../views/CartView.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: HomeView
    },
    {
      path: '/shop',
      component: ShopView
    },
    {
      path: '/games/:id',
      component: ProductDetailView
    },
    {
      path: '/cart',
      component: CartView
    }
  ]
})

export default router