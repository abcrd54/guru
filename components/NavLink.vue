<template>
  <NuxtLink :to="href" class="nav-link">
    <span>{{ label }}</span>
    <span v-if="badge" class="nav-badge">{{ badge }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  href: string
  label: string
  badge?: string
}>()
</script>
