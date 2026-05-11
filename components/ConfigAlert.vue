<template>
  <section class="card" style="background: var(--warning)">
    <h2 class="card-title">⚠️ Konfigurasi Belum Lengkap</h2>
    <p class="card-copy">
      Beberapa environment variable belum diisi. Silakan cek file <code>.env.local</code> dan pastikan
      semua konfigurasi Firebase Admin dan Google Service Account sudah lengkap.
    </p>
    <NuxtLink to="/settings" class="button">
      Buka Pengaturan
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
</script>
