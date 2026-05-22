<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-black shadow-sm">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold" to="/">
        🎮 GameVault
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="mainNavbar" class="collapse navbar-collapse">
        <div class="navbar-nav ms-auto">
          <RouterLink class="nav-link" to="/">
            Home
          </RouterLink>

          <RouterLink class="nav-link" to="/shop">
            Shop
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>

  <RouterView />
</template>