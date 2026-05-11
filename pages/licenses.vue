<template>
  <div>
    <div class="hero">
      <div class="brand-kicker">🎫 Lisensi Management</div>
      <h1 class="hero-title">
        Kelola Lisensi Guru
      </h1>
      <p class="hero-copy">
        Buat lisensi baru untuk guru, kirim link aktivasi via WhatsApp, dan monitor status aktivasi secara real-time.
      </p>
    </div>

    <ConfigAlert v-if="dashboardData && !dashboardData.configured" />

    <div class="grid-2">
      <div class="card">
        <h2 class="card-title">➕ Buat Lisensi Baru</h2>
        <form @submit.prevent="handleSubmit" style="display: grid; gap: 16px">
          <div class="field">
            <span>👤 Nama Guru *</span>
            <input 
              v-model="form.teacherName" 
              type="text" 
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>
          <div class="field">
            <span>🏫 Nama Sekolah *</span>
            <input 
              v-model="form.schoolName" 
              type="text" 
              placeholder="Contoh: SMA Negeri 1 Jakarta"
              required
            />
          </div>
          <div class="field">
            <span>📧 Email Guru *</span>
            <input 
              v-model="form.userEmail" 
              type="email" 
              placeholder="Contoh: budi@gmail.com"
              required
            />
          </div>
          <div class="field">
            <span>📱 No. WhatsApp (Opsional)</span>
            <input 
              v-model="form.phone" 
              type="tel" 
              placeholder="Contoh: 08123456789 atau +628123456789"
            />
            <div style="font-size: 12px; color: var(--muted); margin-top: 4px">
              Jika diisi, sistem akan otomatis kirim link aktivasi via WhatsApp
            </div>
          </div>
          
          <div v-if="submitStatus" :class="submitStatus.type === 'success' ? 'pill success' : 'pill warning'" style="padding: 12px">
            {{ submitStatus.message }}
          </div>

          <div style="display: flex; gap: 12px">
            <button type="submit" class="button primary" :disabled="submitting" style="flex: 1">
              {{ submitting ? '⏳ Membuat...' : '✅ Buat Lisensi' }}
            </button>
            <button type="button" @click="resetForm" class="button" :disabled="submitting">
              🔄 Reset
            </button>
          </div>
        </form>
      </div>

      <div class="card">
        <h2 class="card-title">📊 Statistik Lisensi</h2>
        <div style="display: grid; gap: 16px">
          <div>
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 4px">Total Lisensi</div>
            <div style="font-size: 42px; font-weight: 800">{{ dashboardData?.licenses?.length || 0 }}</div>
          </div>
          <div>
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 4px">Lisensi Aktif</div>
            <div style="font-size: 42px; font-weight: 800; color: #10b981">{{ activeLicensesCount }}</div>
          </div>
          <div>
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 4px">Lisensi Terpakai</div>
            <div style="font-size: 42px; font-weight: 800; color: #3b82f6">{{ usedLicensesCount }}</div>
          </div>
          <div style="padding-top: 12px; border-top: 1px solid var(--line)">
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 8px">Base URL Aktivasi</div>
            <code style="background: #f1f5f9; padding: 8px; border-radius: 6px; font-size: 12px; display: block; word-break: break-all">
              {{ settingsData?.settings?.activationBaseUrl || 'Belum diatur' }}
            </code>
          </div>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-head">
        <h2 class="table-title">📋 Daftar Semua Lisensi</h2>
        <button @click="refreshData" class="button" :disabled="refreshing">
          {{ refreshing ? '🔄 Memuat...' : '🔄 Refresh' }}
        </button>
      </div>
      <table class="table" v-if="dashboardData?.licenses?.length">
        <thead>
          <tr>
            <th>License Key</th>
            <th>Guru</th>
            <th>Sekolah</th>
            <th>Email</th>
            <th>WhatsApp</th>
            <th>Status</th>
            <th>Link Aktivasi</th>
            <th>Tanggal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dashboardData.licenses" :key="item.id">
            <td>
              <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-weight: 700">
                {{ item.id }}
              </code>
            </td>
            <td>{{ item.teacherName || '-' }}</td>
            <td>{{ item.schoolName || '-' }}</td>
            <td style="color: var(--muted); font-size: 13px">{{ item.userEmail || '-' }}</td>
            <td style="font-size: 13px">
              {{ item.phone ? formatPhone(item.phone) : '-' }}
            </td>
            <td>
              <span :class="item.isActive ? 'pill success' : 'pill'">
                {{ item.isActive ? '✅ Aktif' : '📊 Terpakai' }}
              </span>
            </td>
            <td>
              <a 
                v-if="settingsData?.settings?.activationBaseUrl" 
                :href="buildActivationUrl(settingsData.settings.activationBaseUrl, item.id)"
                target="_blank"
                class="button"
                style="font-size: 12px; padding: 6px 12px; min-height: auto"
              >
                🔗 Buka Link
              </a>
              <span v-else style="color: var(--muted); font-size: 12px">-</span>
            </td>
            <td style="color: var(--muted); font-size: 13px">
              {{ item.createdAt ? formatDate(item.createdAt) : '-' }}
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else style="padding: 40px; text-align: center; color: var(--muted)">
        <div style="font-size: 48px; margin-bottom: 12px">📭</div>
        <div style="font-weight: 700; margin-bottom: 6px">Belum Ada Lisensi</div>
        <div style="font-size: 14px">Buat lisensi pertama menggunakan form di atas.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Lisensi - SiapGuru Owner'
})

const { data: dashboardData, refresh: refreshDashboard } = await useFetch('/api/dashboard')
const { data: settingsData, refresh: refreshSettings } = await useFetch('/api/settings')

const form = reactive({
  teacherName: '',
  schoolName: '',
  userEmail: '',
  phone: ''
})

const submitting = ref(false)
const refreshing = ref(false)
const submitStatus = ref<{ type: 'success' | 'error', message: string } | null>(null)

const activeLicensesCount = computed(() => 
  dashboardData.value?.licenses?.filter((item: any) => item.isActive === true).length || 0
)

const usedLicensesCount = computed(() => 
  dashboardData.value?.licenses?.filter((item: any) => item.isActive !== true).length || 0
)

async function handleSubmit() {
  submitting.value = true
  submitStatus.value = null

  try {
    const response = await $fetch('/api/licenses/create', {
      method: 'POST',
      body: {
        teacherName: form.teacherName,
        schoolName: form.schoolName,
        userEmail: form.userEmail,
        phone: form.phone || undefined
      }
    })

    submitStatus.value = {
      type: 'success',
      message: `✅ Lisensi berhasil dibuat! License Key: ${response.licenseKey}`
    }

    resetForm()
    await refreshDashboard()
  } catch (error: any) {
    submitStatus.value = {
      type: 'error',
      message: `❌ Error: ${error.data?.message || error.message || 'Gagal membuat lisensi'}`
    }
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  form.teacherName = ''
  form.schoolName = ''
  form.userEmail = ''
  form.phone = ''
}

async function refreshData() {
  refreshing.value = true
  await Promise.all([refreshDashboard(), refreshSettings()])
  setTimeout(() => {
    refreshing.value = false
  }, 500)
}

function buildActivationUrl(baseUrl: string, licenseKey: string): string {
  const cleanBase = baseUrl.replace(/\/$/, '')
  return `${cleanBase}/${licenseKey}`
}

function formatPhone(phone: string): string {
  if (!phone) return '-'
  if (phone.startsWith('+62')) return phone
  if (phone.startsWith('62')) return `+${phone}`
  if (phone.startsWith('0')) return `+62${phone.substring(1)}`
  return phone
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error, timestamp)
    return '-'
  }
}
</script>
