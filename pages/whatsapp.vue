<template>
  <div>
    <div class="hero">
      <div class="brand-kicker">💬 WhatsApp Integration</div>
      <h1 class="hero-title">
        Konfigurasi WhatsApp
      </h1>
      <p class="hero-copy">
        Atur provider WhatsApp (Fonnte) dan template pesan untuk notifikasi aktivasi lisensi guru.
      </p>
    </div>

    <div class="grid-2">
      <div class="card">
        <h2 class="card-title">🔧 Konfigurasi Provider</h2>
        <form @submit.prevent="handleSaveSettings" style="display: grid; gap: 16px">
          <div class="field">
            <span>🌐 Fonnte API URL</span>
            <input 
              v-model="settingsForm.whatsappProviderUrl" 
              type="url" 
              placeholder="https://api.fonnte.com/send"
            />
            <div style="font-size: 12px; color: var(--muted); margin-top: 4px">
              URL endpoint API Fonnte untuk kirim pesan
            </div>
          </div>
          <div class="field">
            <span>🔑 Fonnte API Token</span>
            <input 
              v-model="settingsForm.whatsappProviderToken" 
              type="text" 
              placeholder="Masukkan token dari Fonnte"
            />
            <div style="font-size: 12px; color: var(--muted); margin-top: 4px">
              Token autentikasi dari dashboard Fonnte
            </div>
          </div>
          
          <div v-if="settingsStatus" :class="settingsStatus.type === 'success' ? 'pill success' : 'pill warning'" style="padding: 12px">
            {{ settingsStatus.message }}
          </div>

          <button type="submit" class="button primary" :disabled="savingSettings">
            {{ savingSettings ? '⏳ Menyimpan...' : '💾 Simpan Konfigurasi' }}
          </button>
        </form>
      </div>

      <div class="card">
        <h2 class="card-title">ℹ️ Status Provider</h2>
        <div style="display: grid; gap: 16px">
          <div>
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 8px">Status Konfigurasi</div>
            <span :class="data?.configured ? 'pill success' : 'pill warning'">
              {{ data?.configured ? '✅ Configured' : '⚠️ Not Configured' }}
            </span>
          </div>
          <div>
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 8px">Provider URL</div>
            <code style="background: #f1f5f9; padding: 8px; border-radius: 6px; font-size: 12px; display: block; word-break: break-all">
              {{ data?.settings?.whatsappProviderUrl || 'Belum diatur' }}
            </code>
          </div>
          <div>
            <div style="font-size: 13px; color: var(--muted); margin-bottom: 8px">API Token</div>
            <code style="background: #f1f5f9; padding: 8px; border-radius: 6px; font-size: 12px; display: block; word-break: break-all">
              {{ data?.settings?.whatsappProviderToken ? '••••••••' + data.settings.whatsappProviderToken.slice(-4) : 'Belum diatur' }}
            </code>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h2 class="card-title">📝 Template Aktivasi</h2>
        <form @submit.prevent="handleSaveSettings" style="display: grid; gap: 16px">
          <div class="field">
            <span>💬 Template Pesan Aktivasi</span>
            <textarea 
              v-model="settingsForm.whatsappTemplateActivation" 
              rows="8"
              placeholder="Halo {{teacherName}}, lisensi Anda sudah siap! Klik link berikut untuk aktivasi: {{activationUrl}}"
            ></textarea>
            <div style="font-size: 12px; color: var(--muted); margin-top: 4px" v-pre>
              Variabel: {{teacherName}}, {{schoolName}}, {{licenseKey}}, {{activationUrl}}
            </div>
          </div>
          
          <button type="submit" class="button primary" :disabled="savingSettings">
            {{ savingSettings ? '⏳ Menyimpan...' : '💾 Simpan Template' }}
          </button>
        </form>
      </div>

      <div class="card">
        <h2 class="card-title">📝 Template Ready</h2>
        <form @submit.prevent="handleSaveSettings" style="display: grid; gap: 16px">
          <div class="field">
            <span>✅ Template Pesan Ready</span>
            <textarea 
              v-model="settingsForm.whatsappTemplateReady" 
              rows="8"
              placeholder="Halo {{teacherName}}, spreadsheet Anda sudah siap! Akses di: {{spreadsheetUrl}}"
            ></textarea>
            <div style="font-size: 12px; color: var(--muted); margin-top: 4px" v-pre>
              Variabel: {{teacherName}}, {{schoolName}}, {{spreadsheetUrl}}
            </div>
          </div>
          
          <button type="submit" class="button primary" :disabled="savingSettings">
            {{ savingSettings ? '⏳ Menyimpan...' : '💾 Simpan Template' }}
          </button>
        </form>
      </div>
    </div>

    <div class="card">
      <h2 class="card-title">🧪 Test WhatsApp</h2>
      <form @submit.prevent="handleTestWhatsapp" style="display: grid; gap: 16px">
        <div class="grid-2">
          <div class="field">
            <span>📱 Nomor Test</span>
            <input 
              v-model="testForm.testPhone" 
              type="tel" 
              placeholder="08123456789"
              required
            />
            <div style="font-size: 12px; color: var(--muted); margin-top: 4px">
              Format: 08xxx atau +628xxx
            </div>
          </div>
          <div class="field">
            <span>💬 Pesan Test</span>
            <input 
              v-model="testForm.testMessage" 
              type="text" 
              placeholder="Test pesan dari SiapGuru"
              required
            />
          </div>
        </div>
        
        <div v-if="testStatus" :class="testStatus.type === 'success' ? 'pill success' : 'pill warning'" style="padding: 12px">
          {{ testStatus.message }}
        </div>

        <button type="submit" class="button primary" :disabled="testing">
          {{ testing ? '📤 Mengirim...' : '📤 Kirim Test WhatsApp' }}
        </button>
      </form>
    </div>

    <div class="card">
      <h2 class="card-title">📚 Panduan Fonnte</h2>
      <div style="display: grid; gap: 12px">
        <div style="display: flex; gap: 12px; align-items: start">
          <span style="background: #dbeafe; color: #1d4ed8; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0">1</span>
          <div>
            <strong>Daftar di Fonnte</strong>
            <p class="card-copy" style="margin: 4px 0 0 0">Buat akun di <a href="https://fonnte.com" target="_blank" style="color: var(--primary)">fonnte.com</a> dan hubungkan nomor WhatsApp</p>
          </div>
        </div>
        <div style="display: flex; gap: 12px; align-items: start">
          <span style="background: #dbeafe; color: #1d4ed8; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0">2</span>
          <div>
            <strong>Dapatkan Token</strong>
            <p class="card-copy" style="margin: 4px 0 0 0">Copy API token dari dashboard Fonnte dan paste di form konfigurasi</p>
          </div>
        </div>
        <div style="display: flex; gap: 12px; align-items: start">
          <span style="background: #dbeafe; color: #1d4ed8; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0">3</span>
          <div>
            <strong>Atur Template</strong>
            <p class="card-copy" style="margin: 4px 0 0 0">Sesuaikan template pesan dengan variabel yang tersedia</p>
          </div>
        </div>
        <div style="display: flex; gap: 12px; align-items: start">
          <span style="background: #dbeafe; color: #1d4ed8; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0">4</span>
          <div>
            <strong>Test Pengiriman</strong>
            <p class="card-copy" style="margin: 4px 0 0 0">Gunakan form test untuk memastikan integrasi berjalan dengan baik</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'WhatsApp - SiapGuru Owner'
})

const { data, refresh } = await useFetch('/api/settings')

const settingsForm = reactive({
  whatsappProviderUrl: data.value?.settings?.whatsappProviderUrl || '',
  whatsappProviderToken: data.value?.settings?.whatsappProviderToken || '',
  whatsappTemplateActivation: data.value?.settings?.whatsappTemplateActivation || '',
  whatsappTemplateReady: data.value?.settings?.whatsappTemplateReady || ''
})

const testForm = reactive({
  testPhone: '',
  testMessage: ''
})

const savingSettings = ref(false)
const testing = ref(false)
const settingsStatus = ref<{ type: 'success' | 'error', message: string } | null>(null)
const testStatus = ref<{ type: 'success' | 'error', message: string } | null>(null)

watch(data, (newData) => {
  if (newData?.settings) {
    settingsForm.whatsappProviderUrl = newData.settings.whatsappProviderUrl || ''
    settingsForm.whatsappProviderToken = newData.settings.whatsappProviderToken || ''
    settingsForm.whatsappTemplateActivation = newData.settings.whatsappTemplateActivation || ''
    settingsForm.whatsappTemplateReady = newData.settings.whatsappTemplateReady || ''
  }
})

async function handleSaveSettings() {
  savingSettings.value = true
  settingsStatus.value = null

  try {
    await $fetch('/api/whatsapp/save', {
      method: 'POST',
      body: {
        whatsappProviderUrl: settingsForm.whatsappProviderUrl || undefined,
        whatsappProviderToken: settingsForm.whatsappProviderToken || undefined,
        whatsappTemplateActivation: settingsForm.whatsappTemplateActivation || undefined,
        whatsappTemplateReady: settingsForm.whatsappTemplateReady || undefined
      }
    })

    settingsStatus.value = {
      type: 'success',
      message: '✅ Konfigurasi WhatsApp berhasil disimpan!'
    }

    await refresh()
  } catch (error: any) {
    settingsStatus.value = {
      type: 'error',
      message: `❌ Error: ${error.data?.message || error.message || 'Gagal menyimpan konfigurasi'}`
    }
  } finally {
    savingSettings.value = false
  }
}

async function handleTestWhatsapp() {
  testing.value = true
  testStatus.value = null

  try {
    const response = await $fetch('/api/whatsapp/test', {
      method: 'POST',
      body: {
        testPhone: testForm.testPhone,
        testMessage: testForm.testMessage
      }
    })

    testStatus.value = {
      type: 'success',
      message: `✅ ${response.message || 'Pesan WhatsApp berhasil dikirim!'}`
    }

    testForm.testPhone = ''
    testForm.testMessage = ''
  } catch (error: any) {
    testStatus.value = {
      type: 'error',
      message: `❌ Error: ${error.data?.message || error.message || 'Gagal mengirim WhatsApp'}`
    }
  } finally {
    testing.value = false
  }
}
</script>
