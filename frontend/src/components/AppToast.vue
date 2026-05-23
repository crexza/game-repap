<script setup>
import { useToastStore } from '../stores/toast'

const toastStore = useToastStore()
</script>

<template>
  <Transition name="toast-slide">
    <div
      v-if="toastStore.visible"
      class="gameripap-toast"
      :class="`toast-${toastStore.type}`"
      role="status"
      aria-live="polite"
    >
      <span class="toast-icon" aria-hidden="true">
        {{ toastStore.type === 'success' ? '✓' : '!' }}
      </span>

      <span class="flex-grow-1">
        {{ toastStore.message }}
      </span>

      <button
        type="button"
        class="toast-close"
        aria-label="Close notification"
        @click="toastStore.hide"
      >
        ×
      </button>
    </div>
  </Transition>
</template>