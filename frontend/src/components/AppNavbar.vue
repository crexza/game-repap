<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="site-header sticky-top">
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <RouterLink class="navbar-brand d-flex align-items-center gap-2" to="/">
          <span class="brand-controller" aria-hidden="true">🎮</span>
          <span>
            <strong>GameVault</strong>
            <small class="d-block">Malaysia</small>
          </span>
        </RouterLink>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#gameVaultNavigation"
          aria-controls="gameVaultNavigation"
          aria-expanded="false"
          aria-label="Open navigation menu"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="gameVaultNavigation" class="collapse navbar-collapse">
          <ul class="navbar-nav mx-auto mb-3 mb-lg-0 gap-lg-2">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/">Home</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/shop">Shop Games</RouterLink>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#platforms">Platforms</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#support">Support</a>
            </li>
          </ul>

          <div class="d-flex gap-2">
            <button class="header-icon-btn" type="button" aria-label="Search games">
              <i class="bi bi-search"></i>
            </button>

            <button class="header-icon-btn position-relative" type="button" aria-label="Shopping cart">
              <i class="bi bi-bag"></i>
              <span class="cart-count">0</span>
            </button>

            <button class="btn btn-outline-light rounded-pill px-3" type="button">
              <i class="bi bi-person me-1"></i>
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>