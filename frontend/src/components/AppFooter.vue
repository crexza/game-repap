<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="gameripap-footer">
    <div class="container">
      <div class="row g-4 py-5">
        <div class="col-12 col-lg-4">
          <div class="d-flex align-items-center gap-2 mb-3">
            <img
              src="/images/branding/gameripap-logo.png"
              alt="Gameripap logo"
              width="48"
              height="48"
              class="footer-logo"
            />

            <h2 class="footer-brand mb-0">
              Gameripap
            </h2>
          </div>

          <p class="footer-description">
           Gaming craving? Gameripap delivers. Original PS4, PS5 and Nintendo Switch games for Malaysian gamers.
          </p>
        </div>

        <div class="col-6 col-md-4 col-lg-2">
          <h3 class="footer-heading">
            Shop
          </h3>

          <ul class="footer-links">
            <li>
              <RouterLink to="/shop">
                All Games
              </RouterLink>
            </li>

            <li>
              <RouterLink to="/shop">
                PS5 Games
              </RouterLink>
            </li>

            <li>
              <RouterLink to="/shop">
                PS4 Games
              </RouterLink>
            </li>

            <li>
              <RouterLink to="/shop">
                Switch Games
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="col-6 col-md-4 col-lg-2">
          <h3 class="footer-heading">
            Account
          </h3>

          <ul class="footer-links">
            <li>
              <RouterLink to="/login">
                Login
              </RouterLink>
            </li>

            <li>
              <RouterLink to="/register">
                Register
              </RouterLink>
            </li>

            <li>
              <RouterLink to="/cart">
                Cart
              </RouterLink>
            </li>

            <li>
              <RouterLink to="/orders">
                My Orders
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="col-12 col-md-4 col-lg-4">
          <h3 class="footer-heading">
            Secure Shopping
          </h3>

          <div class="footer-feature">
            <span aria-hidden="true">✓</span>
            Original physical game products
          </div>

          <div class="footer-feature">
            <span aria-hidden="true">✓</span>
            Secure account and checkout flow
          </div>

          <div class="footer-feature">
            <span aria-hidden="true">✓</span>
            Trackable order status updates
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="mb-0">
          © 2026 Gameripap. Student Web Application Project.
        </p>

        <p class="mb-0">
          Built with Vue.js, Express and Supabase.
        </p>
      </div>
    </div>
  </footer>
</template>