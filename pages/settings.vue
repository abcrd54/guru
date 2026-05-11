<template>
  <div>
    <div class="hero">
      <div class="brand-kicker">⚙️ Pengaturan Sistem</div>
      <h1 class="hero-title">
        Konfigurasi Aplikasi
      </h1>
      <p class="hero-copy">
        Atur template spreadsheet dan base URL aktivasi untuk sistem provisioning guru.
      </p>
    </div>

    <div class="grid-2">
      <div class="card">
        <h2 class="card-title">📝 Pengaturan Utama</h2>
        <form @submit.prevent="handleSubmit" style="display: grid; gap: 16px">
          <div class="field">
            <span>📊 Template Spreadsheet ID</span>
            <input 
              v-model="form.templateSpreadsheetId" 
              type="text" 
              placeholder="Contoh: 1abc...xyz"
            />
            <div style="font-size: 12px; color: var(--muted); margin-top: 4px">
              ID spreadsheet template yang akan di-copy saat aktivasi guru
            </div>
          </div>
          <div class="field">
            <span>🔗 Activation Base URL</span>
            <input 
              v-model="form.activationBaseUrl" 
              type="url" 
              placeholder="Contoh: https://siapguru.com/activate"
            />
            <div style="font-size: 12px; color: var(--muted); margin-top: 4px">
              URL dasar untuk link aktivasi yang dikirim ke guru
            </div>
          </div>
          
          <div v-if="submitStatus" :class="submitStatus.type === 'success' ? 'pill success' : 'pill warning'" style="padding: 12px">
            {{ submitStatus.message }}
          </div>

          <button type="submit" class="button primary" :disabled="submitting">
            {{ submitting ? '⏳ Menyimpan...' : '💾 Simpan Pengaturan' }}
          </button>
        </form>
      </div>

      <div class="card">
        <h2 class="card-title">ℹ️ Informasi</h2>
        <div style="display: grid; gap: 16px">
          <div>
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 8px">Status Konfigurasi</div>
            <span :class="data?.configured ? 'pill success' : 'pill warning'">
              {{ data?.configured ? '✅ Configured' : '⚠️ Not Configured' }}
            </span>
          </div>
          <div>
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 8px">Template Spreadsheet ID</div>
            <code style="background: #f1f5f9; padding: 8px; border-radius: 6px; font-size: 12px; display: block; word-break: break-all">
              {{ data?.settings?.templateSpreadsheetId || 'Belum diatur' }}
            </code>
          </div>
          <div>
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 8px">Activation Base URL</div>
            <code style="background: #f1f5f9; padding: 8px; border-radius: 6px; font-size: 12px; display: block; word-break: break-all">
              {{ data?.settings?.activationBaseUrl || 'Belum diatur' }}
            </code>
          </div>
          <div style="padding-top: 12px; border-top: 1px solid var(--line)">
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 8px">Contoh Link Aktivasi</div>
            <code style="background: #f1f5f9; padding: 8px; border-radius: 6px; font-size: 12px; display: block; word-break: break-all">
              {{ data?.settings?.activationBaseUrl ? `${data.settings.activationBaseUrl}/SG-2026-ABC123` : 'Belum tersedia' }}
            </code>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="card-title">📚 Panduan</h2>
      <div style="display: grid; gap: 12px">
        <div style="display: flex; gap: 12px; align-items: start">
          <span style="background: #dbeafe; color: #1d4ed8; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0">1</span>
          <div>
            <strong>Buat Template Spreadsheet</strong>
            <p class="card-copy" style="margin: 4px 0 0 0">Buat spreadsheet di Google Sheets dengan struktur yang diinginkan, lalu copy ID-nya dari URL</p>
          </div>
        </div>
        <div style="display: flex; gap: 12px; align-items: start">
          <span style="background: #dbeafe; color: #1d4ed8; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0">2</span>
          <div>
            <strong>Atur Base URL</strong>
            <p class="card-copy" style="margin: 4px 0 0 0">Tentukan URL aplikasi aktivasi guru (misalnya: https://siapguru.com/activate)</p>
          </div>
        </div>
        <div style="display: flex; gap: 12px; align-items: start">
          <span style="background: #dbeafe; color: #1d4ed8; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0">3</span>
          <div>
            <strong>Simpan & Test</strong>
            <p class="card-copy" style="margin: 4px 0 0 0">Simpan pengaturan dan test dengan membuat lisensi baru di halaman Lisensi</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Pengaturan - SiapGuru Owner'
})

const { data, refresh } = await useFetch('/api/settings')

const form = reactive({
  templateSpreadsheetId: data.value?.settings?.templateSpreadsheetId || '',
  activationBaseUrl: data.value?.settings?.activationBaseUrl || ''
})

const submitting = ref(false)
const submitStatus = ref<{ type: 'success' | 'error', message: string } | null>(null)

watch(data, (newData) => {
  if (newData?.settings) {
    form.templateSpreadsheetId = newData.settings.templateSpreadsheetId || ''
    form.activationBaseUrl = newData.settings.activationBaseUrl || ''
  }
})

async function handleSubmit() {
  submitting.value = true
  submitStatus.value = null

  try {
    await $fetch('/api/settings/save', {
      method: 'POST',
      body: {
        templateSpreadsheetId: form.templateSpreadsheetId || undefined,
        activationBaseUrl: form.activationBaseUrl || undefined
      }
    })

    submitStatus.value = {
      type: 'success',
      message: '✅ Pengaturan berhasil disimpan!'
    }

    await refresh()
  } catch (error: any) {
    submitStatus.value = {
      type: 'error',
      message: `❌ Error: ${error.data?.message || error.message || 'Gagal menyimpan pengaturan'}`
    }
  } finally {
    submitting.value = false
  }
}
</script>
