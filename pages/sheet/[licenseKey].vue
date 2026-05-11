<template>
  <div class="sheet-page">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo">
          <span class="logo-icon">📊</span>
          <h1>SiapGuru</h1>
        </div>
        <p class="tagline">Akses Spreadsheet Anda</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="card">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Memuat data spreadsheet...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card error-card">
        <div class="error-state">
          <span class="error-icon">❌</span>
          <h2>Tidak Dapat Mengakses Spreadsheet</h2>
          <p>{{ error }}</p>
          <div class="error-details">
            <p><strong>Kode Lisensi:</strong> {{ licenseKey }}</p>
          </div>
          <div class="help-section">
            <h3>Bantuan:</h3>
            <ul>
              <li>Pastikan lisensi Anda sudah diaktifkan</li>
              <li>Hubungi admin jika masalah berlanjut</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Not Activated Yet -->
      <div v-else-if="teacher && !teacher.spreadsheetUrl" class="card warning-card">
        <div class="warning-state">
          <span class="warning-icon">⏳</span>
          <h2>Spreadsheet Sedang Diproses</h2>
          <p>Spreadsheet Anda sedang dalam proses pembuatan.</p>
          
          <div class="teacher-info">
            <div class="info-row">
              <span class="label">Nama Guru:</span>
              <span class="value">{{ teacher.teacherName }}</span>
            </div>
            <div class="info-row">
              <span class="label">Sekolah:</span>
              <span class="value">{{ teacher.schoolName }}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">{{ teacher.email }}</span>
            </div>
            <div class="info-row">
              <span class="label">Kode Lisensi:</span>
              <span class="value">{{ licenseKey }}</span>
            </div>
          </div>

          <div class="info-box">
            <p><strong>📧 Notifikasi Email</strong></p>
            <p>Anda akan menerima email di <strong>{{ teacher.email }}</strong> ketika spreadsheet sudah siap.</p>
          </div>

          <button @click="checkAgain" class="refresh-btn" :disabled="checking">
            <span v-if="checking">🔄 Memeriksa...</span>
            <span v-else>🔄 Periksa Lagi</span>
          </button>
        </div>
      </div>

      <!-- Success - Redirect to Spreadsheet -->
      <div v-else-if="teacher && teacher.spreadsheetUrl" class="card success-card">
        <div class="success-state">
          <span class="success-icon">✅</span>
          <h2>Spreadsheet Siap!</h2>
          <p>Spreadsheet Anda sudah siap digunakan.</p>
          
          <div class="teacher-info">
            <div class="info-row">
              <span class="label">Nama Guru:</span>
              <span class="value">{{ teacher.teacherName }}</span>
            </div>
            <div class="info-row">
              <span class="label">Sekolah:</span>
              <span class="value">{{ teacher.schoolName }}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">{{ teacher.email }}</span>
            </div>
          </div>

          <div class="redirect-info">
            <p v-if="redirecting">
              <strong>🔄 Mengalihkan ke Google Sheets...</strong>
            </p>
            <p v-else>
              <strong>Klik tombol di bawah untuk membuka spreadsheet:</strong>
            </p>
          </div>

          <a 
            :href="teacher.spreadsheetUrl" 
            target="_blank" 
            class="open-btn"
            @click="trackOpen"
          >
            📊 Buka Spreadsheet
          </a>

          <div class="info-box">
            <p><strong>💡 Tips:</strong></p>
            <ul>
              <li>Bookmark halaman ini untuk akses cepat</li>
              <li>Spreadsheet sudah di-share ke email Anda</li>
              <li>Anda bisa mengakses dari Google Drive</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>© 2026 SiapGuru. Sistem Manajemen Nilai Digital.</p>
        <p class="support">Butuh bantuan? Hubungi admin Anda.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const licenseKey = route.params.licenseKey as string

const loading = ref(true)
const error = ref('')
const teacher = ref<any>(null)
const checking = ref(false)
const redirecting = ref(false)

// Load teacher data
async function loadData() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch(`/api/sheet/${licenseKey}`)
    
    if (response.success && response.teacher) {
      teacher.value = response.teacher
      
      // Auto redirect if spreadsheet is ready
      if (response.teacher.spreadsheetUrl && !redirecting.value) {
        redirecting.value = true
        setTimeout(() => {
          window.location.href = response.teacher.spreadsheetUrl
        }, 2000)
      }
    } else {
      error.value = response.message || 'Data tidak ditemukan'
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Gagal memuat data'
  } finally {
    loading.value = false
  }
}

// Check again button
async function checkAgain() {
  checking.value = true
  await loadData()
  checking.value = false
}

// Track spreadsheet open
function trackOpen() {
  // Optional: track analytics
  console.log('Spreadsheet opened:', licenseKey)
}

onMounted(() => {
  loadData()
})

useHead({
  title: `Spreadsheet ${licenseKey} - SiapGuru`,
  meta: [
    { name: 'description', content: 'Akses spreadsheet manajemen nilai SiapGuru' }
  ]
})
</script>

<style scoped>
.sheet-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state,
.warning-state,
.success-state {
  text-align: center;
}

.error-icon,
.warning-icon,
.success-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
}

.error-state h2,
.warning-state h2,
.success-state h2 {
  font-size: 24px;
  margin: 0 0 12px;
  color: #1f2937;
}

.error-state > p,
.warning-state > p,
.success-state > p {
  color: #6b7280;
  margin: 0 0 20px;
}

.error-details {
  background: #fef2f2;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
}

.error-details p {
  margin: 0;
  color: #991b1b;
}

.help-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  text-align: left;
}

.help-section h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #1f2937;
}

.help-section ul {
  margin: 0;
  padding-left: 20px;
  color: #6b7280;
}

.help-section li {
  margin-bottom: 8px;
}

/* Teacher Info */
.teacher-info {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  text-align: left;
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
  text-align: right;
}

.info-box {
  background: #eff6ff;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  text-align: left;
}

.info-box p {
  margin: 0 0 8px;
  color: #1f2937;
}

.info-box p:last-child {
  margin: 0;
}

.info-box ul {
  margin: 8px 0 0;
  padding-left: 20px;
  color: #6b7280;
}

.info-box li {
  margin-bottom: 6px;
}

/* Buttons */
.refresh-btn,
.open-btn {
  display: inline-block;
  padding: 16px 32px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 20px;
}

.refresh-btn:hover:not(:disabled),
.open-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.redirect-info {
  margin: 20px 0;
}

.redirect-info p {
  color: #1f2937;
  font-size: 16px;
}

/* Footer */
.footer {
  text-align: center;
  color: white;
  opacity: 0.9;
  margin-top: 40px;
}

.footer p {
  margin: 8px 0;
  font-size: 14px;
}

.support {
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 640px) {
  .sheet-page {
    padding: 20px 16px;
  }
  
  .card {
    padding: 24px;
  }
  
  .logo h1 {
    font-size: 28px;
  }
  
  .error-state h2,
  .warning-state h2,
  .success-state h2 {
    font-size: 20px;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .value {
    text-align: left;
  }
}
</style>
