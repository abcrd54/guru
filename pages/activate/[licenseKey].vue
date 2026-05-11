<template>
  <div class="activate-page">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo">
          <span class="logo-icon">📚</span>
          <h1>SiapGuru</h1>
        </div>
        <p class="tagline">Aktivasi Lisensi Guru</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Memuat data lisensi...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card error-card">
        <div class="error-state">
          <span class="error-icon">❌</span>
          <h2>Lisensi Tidak Valid</h2>
          <p>{{ error }}</p>
          <div class="error-details">
            <p><strong>Kode Lisensi:</strong> {{ licenseKey }}</p>
          </div>
        </div>
      </div>

      <!-- Already Used State -->
      <div v-else-if="license && !license.isActive" class="card warning-card">
        <div class="warning-state">
          <span class="warning-icon">⚠️</span>
          <h2>Lisensi Sudah Digunakan</h2>
          <p>Lisensi ini sudah diaktifkan sebelumnya.</p>
          <div class="license-info">
            <div class="info-row">
              <span class="label">Nama Guru:</span>
              <span class="value">{{ license.teacherName }}</span>
            </div>
            <div class="info-row">
              <span class="label">Sekolah:</span>
              <span class="value">{{ license.schoolName }}</span>
            </div>
            <div class="info-row" v-if="license.spreadsheetUrl">
              <span class="label">Spreadsheet:</span>
              <a :href="license.spreadsheetUrl" target="_blank" class="link-btn">
                🔗 Buka Spreadsheet
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Activation Form -->
      <div v-else-if="license && license.isActive" class="card">
        <div class="form-container">
          <div class="form-header">
            <span class="success-icon">✅</span>
            <h2>Aktivasi Lisensi</h2>
            <p>Lengkapi data di bawah untuk mengaktifkan lisensi Anda</p>
          </div>

          <div class="license-badge">
            <span class="badge-label">Kode Lisensi</span>
            <span class="badge-value">{{ licenseKey }}</span>
          </div>

          <form @submit.prevent="handleActivate" class="activation-form">
            <div class="form-group">
              <label for="teacherName">
                <span class="icon">👤</span>
                Nama Lengkap Guru
              </label>
              <input
                id="teacherName"
                v-model="form.teacherName"
                type="text"
                placeholder="Contoh: Budi Santoso, S.Pd"
                required
                :disabled="activating"
              />
            </div>

            <div class="form-group">
              <label for="schoolName">
                <span class="icon">🏫</span>
                Nama Sekolah
              </label>
              <input
                id="schoolName"
                v-model="form.schoolName"
                type="text"
                placeholder="Contoh: SMA Negeri 1 Jakarta"
                required
                :disabled="activating"
              />
            </div>

            <div class="form-group">
              <label for="email">
                <span class="icon">📧</span>
                Email
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="Contoh: budi@gmail.com"
                required
                :disabled="activating"
              />
              <small>Email untuk akses spreadsheet</small>
            </div>

            <div class="form-group">
              <label for="phone">
                <span class="icon">📱</span>
                No. WhatsApp (Opsional)
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                placeholder="Contoh: 08123456789"
                :disabled="activating"
              />
            </div>

            <button type="submit" class="submit-btn" :disabled="activating">
              <span v-if="activating">⏳ Mengaktifkan...</span>
              <span v-else>🚀 Aktifkan Lisensi</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Success State -->
      <div v-if="success" class="card success-card">
        <div class="success-state">
          <span class="success-icon-large">🎉</span>
          <h2>Aktivasi Berhasil!</h2>
          <p>Lisensi Anda telah berhasil diaktifkan.</p>
          
          <div class="success-info">
            <div class="info-row">
              <span class="label">Nama Guru:</span>
              <span class="value">{{ form.teacherName }}</span>
            </div>
            <div class="info-row">
              <span class="label">Sekolah:</span>
              <span class="value">{{ form.schoolName }}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">{{ form.email }}</span>
            </div>
          </div>

          <div v-if="spreadsheetUrl" class="spreadsheet-link">
            <p><strong>Spreadsheet Anda sudah siap!</strong></p>
            <a :href="spreadsheetUrl" target="_blank" class="primary-btn">
              📊 Buka Spreadsheet
            </a>
            <p class="note">Spreadsheet telah di-share ke email: {{ form.email }}</p>
          </div>

          <div v-else class="processing-info">
            <p>⏳ Spreadsheet sedang diproses...</p>
            <p class="note">Anda akan menerima email notifikasi setelah spreadsheet siap.</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>© 2026 SiapGuru. Sistem Manajemen Nilai Digital.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const licenseKey = route.params.licenseKey as string

const loading = ref(true)
const error = ref('')
const license = ref<any>(null)
const activating = ref(false)
const success = ref(false)
const spreadsheetUrl = ref('')

const form = ref({
  teacherName: '',
  schoolName: '',
  email: '',
  phone: ''
})

// Load license data
onMounted(async () => {
  try {
    const response = await $fetch(`/api/activate/${licenseKey}`)
    
    if (response.success && response.license) {
      license.value = response.license
      
      // Pre-fill form if data exists
      if (response.license.teacherName) {
        form.value.teacherName = response.license.teacherName
      }
      if (response.license.schoolName) {
        form.value.schoolName = response.license.schoolName
      }
      if (response.license.userEmail) {
        form.value.email = response.license.userEmail
      }
      if (response.license.phone) {
        form.value.phone = response.license.phone
      }
    } else {
      error.value = response.message || 'Lisensi tidak ditemukan'
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Gagal memuat data lisensi'
  } finally {
    loading.value = false
  }
})

// Handle activation
async function handleActivate() {
  if (activating.value) return
  
  activating.value = true
  error.value = ''
  
  try {
    const response = await $fetch(`/api/activate/${licenseKey}`, {
      method: 'POST',
      body: {
        teacherName: form.value.teacherName,
        schoolName: form.value.schoolName,
        email: form.value.email,
        phone: form.value.phone
      }
    })
    
    if (response.success) {
      success.value = true
      spreadsheetUrl.value = response.spreadsheetUrl || ''
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      error.value = response.message || 'Gagal mengaktifkan lisensi'
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Terjadi kesalahan saat aktivasi'
  } finally {
    activating.value = false
  }
}

useHead({
  title: `Aktivasi Lisensi ${licenseKey} - SiapGuru`,
  meta: [
    { name: 'description', content: 'Aktivasi lisensi SiapGuru untuk akses spreadsheet manajemen nilai' }
  ]
})
</script>

<style scoped>
.activate-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 48px;
}

.logo h1 {
  font-size: 36px;
  font-weight: 800;
  margin: 0;
}

.tagline {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin-bottom: 24px;
}

.error-card {
  border: 3px solid #ef4444;
}

.warning-card {
  border: 3px solid #f59e0b;
}

.success-card {
  border: 3px solid #10b981;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state,
.warning-state {
  text-align: center;
}

.error-icon,
.warning-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
}

.error-state h2,
.warning-state h2 {
  font-size: 24px;
  margin: 0 0 12px;
  color: #1f2937;
}

.error-state p,
.warning-state p {
  color: #6b7280;
  margin: 0 0 20px;
}

.error-details,
.license-info {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #6b7280;
}

.value {
  color: #1f2937;
  font-weight: 500;
}

.link-btn {
  display: inline-block;
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}

.link-btn:hover {
  background: #5568d3;
}

/* Form */
.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.success-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.form-header h2 {
  font-size: 28px;
  margin: 0 0 8px;
  color: #1f2937;
}

.form-header p {
  color: #6b7280;
  margin: 0;
}

.license-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 32px;
}

.badge-label {
  display: block;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.9;
  margin-bottom: 4px;
}

.badge-value {
  display: block;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.activation-form {
  display: grid;
  gap: 24px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1f2937;
}

.icon {
  font-size: 18px;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.form-group small {
  color: #6b7280;
  font-size: 14px;
}

.submit-btn {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Success State */
.success-state {
  text-align: center;
}

.success-icon-large {
  font-size: 80px;
  display: block;
  margin-bottom: 20px;
}

.success-state h2 {
  font-size: 28px;
  margin: 0 0 12px;
  color: #1f2937;
}

.success-state > p {
  color: #6b7280;
  margin: 0 0 24px;
}

.success-info {
  background: #f0fdf4;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  text-align: left;
}

.spreadsheet-link,
.processing-info {
  background: #eff6ff;
  border-radius: 8px;
  padding: 24px;
}

.spreadsheet-link p,
.processing-info p {
  margin: 0 0 16px;
  color: #1f2937;
}

.spreadsheet-link p:last-child,
.processing-info p:last-child {
  margin: 16px 0 0;
}

.primary-btn {
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
  font-size: 18px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.note {
  font-size: 14px;
  color: #6b7280;
}

/* Footer */
.footer {
  text-align: center;
  color: white;
  opacity: 0.8;
  margin-top: 40px;
}

.footer p {
  margin: 0;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 640px) {
  .activate-page {
    padding: 20px 16px;
  }
  
  .card {
    padding: 24px;
  }
  
  .logo h1 {
    font-size: 28px;
  }
  
  .form-header h2,
  .success-state h2 {
    font-size: 24px;
  }
}
</style>
