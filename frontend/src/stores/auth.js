import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../services/api'

const STORAGE_KEY = 'gamevault_auth'

function loadStoredSession() {
  try {
    const session = localStorage.getItem(STORAGE_KEY)

    return session
      ? JSON.parse(session)
      : {
          token: '',
          user: null
        }
  } catch {
    return {
      token: '',
      user: null
    }
  }
}

export const useAuthStore = defineStore('auth', () => {
  const storedSession = loadStoredSession()

  const token = ref(storedSession.token)
  const user = ref(storedSession.user)
  const loading = ref(false)
  const error = ref('')

  const isLoggedIn = computed(() => Boolean(token.value && user.value))
  const isAdmin = computed(() => user.value?.role === 'admin')

  function saveSession() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: token.value,
        user: user.value
      })
    )
  }

  function clearError() {
    error.value = ''
  }

  async function register(formData) {
    loading.value = true
    error.value = ''

    try {
      const response = await api.post('/auth/register', formData)

      token.value = response.data.token
      user.value = response.data.user

      saveSession()

      return true
    } catch (requestError) {
      error.value =
        requestError.response?.data?.message ||
        'Unable to create your account.'

      return false
    } finally {
      loading.value = false
    }
  }

  async function login(formData) {
    loading.value = true
    error.value = ''

    try {
      const response = await api.post('/auth/login', formData)

      token.value = response.data.token
      user.value = response.data.user

      saveSession()

      return true
    } catch (requestError) {
      error.value =
        requestError.response?.data?.message ||
        'Unable to log in.'

      return false
    } finally {
      loading.value = false
    }
  }

  async function loadProfile() {
    if (!token.value) {
      return false
    }

    try {
      const response = await api.get('/users/profile', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      user.value = response.data
      saveSession()

      return true
    } catch {
      logout()
      return false
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    error.value = ''

    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    token,
    user,
    loading,
    error,
    isLoggedIn,
    isAdmin,
    clearError,
    register,
    login,
    loadProfile,
    logout
  }
})