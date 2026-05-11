<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-kicker">Owner Console</div>
        <div class="brand-title">SiapGuru Admin</div>
        <div class="brand-copy">
          Panel utama untuk lisensi, aktivasi guru, provisioning spreadsheet, dan otomasi operasional.
        </div>
      </div>

      <nav class="nav">
        <div class="nav-section">Utama</div>
        <NavLink
          v-for="item in navigation.utama"
          :key="item.href"
          :href="item.href"
          :label="item.label"
          :badge="item.badge"
        />

        <div class="nav-section">Operasional</div>
        <NavLink
          v-for="item in navigation.operasional"
          :key="item.href"
          :href="item.href"
          :label="item.label"
          :badge="item.badge"
        />
      </nav>
    </aside>

    <main class="main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
type NavItem = {
  href: string
  label: string
  badge?: string
}

const navigation: {
  utama: NavItem[]
  operasional: NavItem[]
} = {
  utama: [
    { href: '/', label: 'Dashboard' },
    { href: '/licenses', label: 'Lisensi', badge: 'Core' }
  ],
  operasional: [
    { href: '/whatsapp', label: 'WhatsApp' },
    { href: '/settings', label: 'Pengaturan' }
  ]
}
</script>
