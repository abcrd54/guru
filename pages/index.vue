<template>
  <div>
    <div class="hero">
      <div class="brand-kicker">🎯 Dashboard</div>
      <h1 class="hero-title">
        Selamat Datang di SiapGuru Owner Console
      </h1>
      <p class="hero-copy">
        Kelola lisensi guru, monitor aktivasi, dan tracking provisioning spreadsheet dalam satu dashboard terpusat.
        Semua data real-time dari Firebase Firestore.
      </p>
      <div class="hero-actions">
        <NuxtLink to="/licenses" class="button primary">➕ Buat Lisensi Baru</NuxtLink>
        <button @click="refreshData" class="button" :disabled="refreshing">
          {{ refreshing ? '🔄 Memuat...' : '🔄 Refresh Data' }}
        </button>
      </div>
    </div>

    <ConfigAlert v-if="data && !data.configured" />

    <div class="grid-3">
      <article class="card">
        <div class="brand-kicker">✅ Lisensi Aktif</div>
        <div style="font-size: 48px; font-weight: 800; color: #10b981">{{ activeLicenses.length }}</div>
        <p class="card-copy">Lisensi yang belum digunakan dan siap diaktivasi</p>
        <div class="stats-row">
          <span class="pill success">Ready</span>
        </div>
      </article>
      <article class="card">
        <div class="brand-kicker">📊 Lisensi Terpakai</div>
        <div style="font-size: 48px; font-weight: 800; color: #3b82f6">{{ usedLicenses.length }}</div>
        <p class="card-copy">Lisensi yang sudah diaktivasi oleh guru</p>
        <div class="stats-row">
          <span class="pill">Used</span>
        </div>
      </article>
      <article class="card">
        <div class="brand-kicker">📝 Log Provisioning</div>
        <div style="font-size: 48px; font-weight: 800; color: #8b5cf6">{{ data?.provisioningLogs?.length || 0 }}</div>
        <p class="card-copy">Total log aktivasi dan provisioning</p>
        <div class="stats-row">
          <span class="pill warning">Logs</span>
        </div>
      </article>
    </div>

    <div class="grid-2">
      <div class="card">
        <h2 class="card-title">🔄 Alur Sistem</h2>
        <div style="display: grid; gap: 12px">
          <div style="display: flex; gap: 12px; align-items: start">
            <span style="background: #dbeafe; color: #1d4ed8; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0">1</span>
            <div>
              <strong>Buat Lisensi</strong>
              <p class="card-copy" style="margin: 4px 0 0 0">Admin input data guru dan sistem generate license key otomatis</p>
            </div>
          </div>
          <div style="display: flex; gap: 12px; align-items: start">
            <span style="background: #dbeafe; color: #1d4ed8; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0">2</span>
            <div>
              <strong>Kirim WhatsApp</strong>
              <p class="card-copy" style="margin: 4px 0 0 0">Sistem otomatis kirim link aktivasi via WhatsApp (Fonnte)</p>
            </div>
          </div>
          <div style="display: flex; gap: 12px; align-items: start">
            <span style="background: #dbeafe; color: #1d4ed8; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0">3</span>
            <div>
              <strong>Guru Aktivasi</strong>
              <p class="card-copy" style="margin: 4px 0 0 0">Guru klik link, spreadsheet dibuat dari template Google Sheets</p>
            </div>
          </div>
          <div style="display: flex; gap: 12px; align-items: start">
            <span style="background: #dbeafe; color: #1d4ed8; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0">4</span>
            <div>
              <strong>Share & Log</strong>
              <p class="card-copy" style="margin: 4px 0 0 0">Spreadsheet di-share ke email guru, status tercatat di log</p>
            </div>
          </div>
        </div>
      </div>
      <div class="card">
        <h2 class="card-title">📊 Statistik Real-time</h2>
        <div style="display: grid; gap: 16px">
          <div>
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 4px">Total Lisensi</div>
            <div style="font-size: 32px; font-weight: 800">{{ (data?.licenses?.length || 0) }}</div>
          </div>
          <div>
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 4px">Total Guru Terdaftar</div>
            <div style="font-size: 32px; font-weight: 800">{{ (data?.teachers?.length || 0) }}</div>
          </div>
          <div>
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 4px">Tingkat Aktivasi</div>
            <div style="font-size: 32px; font-weight: 800">{{ activationRate }}%</div>
          </div>
          <div>
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 4px">Status Koneksi</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px">
              <span :class="data?.configured ? 'pill success' : 'pill warning'">
                {{ data?.configured ? '✅ Connected' : '⚠️ Not Configured' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-head">
        <h2 class="table-title">📋 Lisensi Terbaru</h2>
        <NuxtLink to="/licenses" class="button">
          Lihat Semua →
        </NuxtLink>
      </div>
      <table class="table" v-if="data?.licenses?.length">
        <thead>
          <tr>
            <th>License Key</th>
            <th>Guru</th>
            <th>Sekolah</th>
            <th>Email</th>
            <th>Status</th>
            <th>Tanggal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in (data?.licenses || []).slice(0, 8)" :key="item.id">
            <td><code style="background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-size: 13px">{{ item.id }}</code></td>
            <td>{{ item.teacherName || '-' }}</td>
            <td>{{ item.schoolName || '-' }}</td>
            <td style="color: var(--muted); font-size: 13px">{{ item.userEmail || '-' }}</td>
            <td>
              <span :class="item.isActive ? 'pill success' : 'pill'">
                {{ item.isActive ? '✅ Aktif' : '📊 Terpakai' }}
              </span>
            </td>
            <td style="color: var(--muted); font-size: 13px">
              {{ item.createdAt ? formatDate(item.createdAt) : '-' }}
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else style="padding: 40px; text-align: center; color: var(--muted)">
        <div style="font-size: 48px; margin-bottom: 12px">📭</div>
        <div style="font-weight: 700; margin-bottom: 6px">Belum Ada Data</div>
        <div style="font-size: 14px">Belum ada lisensi yang terbaca dari Firestore.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Dashboard - SiapGuru Owner'
})

const { data, refresh } = await useFetch('/api/dashboard')
const refreshing = ref(false)

const activeLicenses = computed(() => 
  data.value?.licenses?.filter((item: any) => item.isActive === true) || []
)

const usedLicenses = computed(() => 
  data.value?.licenses?.filter((item: any) => item.isActive !== true) || []
)

const activationRate = computed(() => {
  const total = data.value?.licenses?.length || 0
  if (total === 0) return 0
  const used = usedLicenses.value.length
  return Math.round((used / total) * 100)
})

async function refreshData() {
  refreshing.value = true
  await refresh()
  setTimeout(() => {
    refreshing.value = false
  }, 500)
}

function formatDate(timestamp: any) {
  if (!timestamp) return '-'
  
  try {
    let date: Date
    
    // Handle Firestore Timestamp
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate()
    }
    // Handle Firestore Timestamp serialized (with _seconds)
    else if (timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000)
    }
    // Handle ISO string or number
    else {
      date = new Date(timestamp)
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '-'
    }
    
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error, timestamp)
    return '-'
  }
}
</script>
