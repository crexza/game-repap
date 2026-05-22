import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ShopView from '../views/ShopView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CartView from '../views/CartView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AccountView from '../views/AccountView.vue'
import OrderHistoryView from '../views/OrderHistoryView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import AdminOrdersView from '../views/AdminOrdersView.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/shop',
      name: 'shop',
      component: ShopView
    },
    {
      path: '/games/:id',
      name: 'product-detail',
      component: ProductDetailView
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartView
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/account',
      name: 'account',
      component: AccountView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/orders',
      name: 'orders',
      component: OrderHistoryView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboardView,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/admin/orders',
      name: 'admin-orders',
      component: AdminOrdersView,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    }
  ]
})

router.beforeEach((to) => {
  let session = null

  try {
    const storedAuth = localStorage.getItem('gamevault_auth')
    session = storedAuth ? JSON.parse(storedAuth) : null
  } catch {
    localStorage.removeItem('gamevault_auth')
  }

  const isLoggedIn = Boolean(session?.token)
  const isAdmin = session?.user?.role === 'admin'

  if (to.meta.requiresAuth && !isLoggedIn) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return '/account'
  }

  if ((to.path === '/login' || to.path === '/register') && isLoggedIn) {
    return '/account'
  }

  return true
})

export default router