import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', () => {
  const message = ref('')
  const type = ref('success')
  const visible = ref(false)

  let timer = null

  function show(newMessage, newType = 'success') {
    message.value = newMessage
    type.value = newType
    visible.value = true

    window.clearTimeout(timer)

    timer = window.setTimeout(() => {
      visible.value = false
    }, 2800)
  }

  function hide() {
    visible.value = false
  }

  return {
    message,
    type,
    visible,
    show,
    hide
  }
})