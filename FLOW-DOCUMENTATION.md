# Dokumentasi Alur & Fungsi - SiapGuru Owner (Nuxt.js)

## 📋 Ringkasan Sistem

Aplikasi owner/admin untuk mengelola lisensi guru, aktivasi, dan provisioning spreadsheet dengan integrasi Firebase dan WhatsApp.

---

## 🗂️ Struktur Folder

```
owner/
├── app.vue                      # Root component Nuxt
├── nuxt.config.ts               # Konfigurasi Nuxt
├── .env.local                   # Environment variables
│
├── pages/                       # Halaman routing
│   ├── index.vue               # Dashboard utama
│   ├── licenses.vue            # Kelola lisensi
│   ├── settings.vue            # Pengaturan sistem
│   └── whatsapp.vue            # Konfigurasi WhatsApp
│
├── layouts/
│   └── default.vue             # Layout dengan sidebar
│
├── components/
│   ├── ConfigAlert.vue         # Alert konfigurasi
│   └── NavLink.vue             # Link navigasi
│
├── server/
│   ├── api/                    # API endpoints
│   │   ├── dashboard.get.ts
│   │   ├── settings.get.ts
│   │   ├── licenses/
│   │   │   └── create.post.ts
│   │   ├── settings/
│   │   │   └── save.post.ts
│   │   └── whatsapp/
│   │       ├── save.post.ts
│   │       └── test.post.ts
│   └── utils/                  # Server utilities
│       ├── firebase-admin.ts
│       ├── firestore-data.ts
│       └── whatsapp.ts
│
└── assets/css/
    └── globals.css             # Global styles
```

---

## 🔄 Alur Utama Sistem

### 1. **Alur Pembuatan Lisensi**

```
[Owner] → Form Lisensi → API /licenses/create → Firestore
                              ↓
                         WhatsApp API (opsional)
                              ↓
                         Provisioning Log
```

**Detail:**
1. Owner mengisi form di `/licenses`
   - Nama Guru
   - Nama Sekolah
   - Email Guru
   - No. WhatsApp (opsional)

2. Submit form → `POST /api/licenses/create`
   - Generate license key (format: `SG-2026-XXXXXX`)
   - Simpan ke Firestore collection `licenses`
   - Jika ada nomor WA → kirim pesan aktivasi
   - Catat log ke `provisioning_logs`

3. Response → Refresh data → Tampilkan di tabel

### 2. **Alur Aktivasi Guru** (Belum diimplementasi di owner)

```
[Guru] → Link Aktivasi → Aktivasi Page → Spreadsheet Creation
                                              ↓
                                         Share ke Email
                                              ↓
                                         Update Status
```

### 3. **Alur WhatsApp Notification**

```
License Created → Check Phone → Format Message → Fonnte API
                                                      ↓
                                                 Send WhatsApp
                                                      ↓
                                                 Log Result
```

---

## 📄 Halaman & Fungsi

### **1. Dashboard (`/`)**

**Fungsi:**
- Menampilkan statistik lisensi (aktif vs dipakai)
- Menampilkan log provisioning terbaru
- Menampilkan 8 lisensi terbaru
- Quick link ke halaman lisensi

**Data Source:**
- `GET /api/dashboard` → `getDashboardData()`

**Computed:**
- `activeLicenses`: Filter lisensi dengan status "Aktif"
- `usedLicenses`: Filter lisensi dengan status bukan "Aktif"

---

### **2. Licenses (`/licenses`)**

**Fungsi:**
- Form pembuatan lisensi baru
- Tabel daftar semua lisensi
- Link aktivasi untuk setiap lisensi
- Info nomor WhatsApp

**Actions:**
- `handleSubmit()`: Submit form → `POST /api/licenses/create`
  - Validasi input
  - Create license
  - Send WhatsApp (jika ada nomor)
  - Refresh data
  - Reset form

**Data Source:**
- `GET /api/dashboard` → licenses data
- `GET /api/settings` → activation base URL

**Helper:**
- `buildActivationUrl(baseUrl, licenseKey)`: Generate link aktivasi

---

### **3. Settings (`/settings`)**

**Fungsi:**
- Konfigurasi template spreadsheet ID
- Konfigurasi activation base URL

**Actions:**
- `handleSubmit()`: `POST /api/settings/save`
  - Simpan ke Firestore `app_settings/owner`

**Data Source:**
- `GET /api/settings` → current settings

---

### **4. WhatsApp (`/whatsapp`)**

**Fungsi:**
- Konfigurasi provider WhatsApp (Fonnte)
- Konfigurasi template pesan
- Test kirim WhatsApp

**Actions:**
- `handleSaveSettings()`: `POST /api/whatsapp/save`
  - Simpan provider URL, token, templates
  
- `handleTestWhatsapp()`: `POST /api/whatsapp/test`
  - Test kirim pesan ke nomor test

**Data Source:**
- `GET /api/settings` → WhatsApp config

---

## 🔌 API Endpoints

### **GET /api/dashboard**
**Fungsi:** Ambil data dashboard (licenses, teachers, logs)

**Response:**
```typescript
{
  configured: boolean
  licenses: LicenseRecord[]
  teachers: TeacherRecord[]
  provisioningLogs: ProvisioningRecord[]
}
```

**Source:** `getDashboardData()` dari Firestore

---

### **GET /api/settings**
**Fungsi:** Ambil pengaturan aplikasi

**Response:**
```typescript
{
  configured: boolean
  settings: {
    templateSpreadsheetId: string
    activationBaseUrl: string
    whatsappProviderUrl: string
    whatsappProviderToken: string
    whatsappTemplateActivation: string
    whatsappTemplateReady: string
  }
}
```

**Source:** Firestore `app_settings/owner`

---

### **POST /api/licenses/create**
**Fungsi:** Buat lisensi baru

**Body:**
```typescript
{
  teacherName: string
  schoolName: string
  userEmail: string
  phone?: string
}
```

**Flow:**
1. Validasi input
2. Generate license key
3. Simpan ke Firestore `licenses/{licenseKey}`
4. Jika ada phone → kirim WhatsApp
5. Log ke `provisioning_logs`

**Response:**
```typescript
{
  success: true
  licenseKey: string
}
```

---

### **POST /api/settings/save**
**Fungsi:** Simpan pengaturan template & aktivasi

**Body:**
```typescript
{
  templateSpreadsheetId?: string
  activationBaseUrl?: string
}
```

---

### **POST /api/whatsapp/save**
**Fungsi:** Simpan konfigurasi WhatsApp

**Body:**
```typescript
{
  whatsappProviderUrl?: string
  whatsappProviderToken?: string
  whatsappTemplateActivation?: string
  whatsappTemplateReady?: string
}
```

---

### **POST /api/whatsapp/test**
**Fungsi:** Test kirim WhatsApp

**Body:**
```typescript
{
  testPhone: string
  testMessage: string
}
```

**Response:**
```typescript
{
  success: boolean
  message: string
}
```

---

## 🗄️ Firestore Collections

### **1. `licenses`**
```typescript
{
  [licenseKey]: {
    teacherName: string
    schoolName: string
    userEmail: string
    phone: string
    isActive: boolean
    createdAt: Timestamp
    spreadsheetUrl?: string
  }
}
```

### **2. `teachers`**
```typescript
{
  [email]: {
    teacherName: string
    email: string
    schoolName: string
    phone: string
    licenseKey: string
    spreadsheetId: string
    spreadsheetUrl: string
    updatedAt: Timestamp
  }
}
```

### **3. `provisioning_logs`**
```typescript
{
  [autoId]: {
    licenseKey: string
    teacherName: string
    status: string  // 'whatsapp_sent', 'whatsapp_skipped', etc
    message: string
    createdAt: Timestamp
  }
}
```

### **4. `app_settings/owner`**
```typescript
{
  templateSpreadsheetId: string
  activationBaseUrl: string
  whatsappProviderUrl: string
  whatsappProviderToken: string
  whatsappTemplateActivation: string
  whatsappTemplateReady: string
  updatedAt: Timestamp
}
```

---

## 🔧 Server Utils

### **firebase-admin.ts**
- `getAdminDb()`: Initialize Firebase Admin & return Firestore
- `hasFirebaseAdminEnv()`: Check env variables

### **firestore-data.ts**
- `getDashboardData()`: Ambil data licenses, teachers, logs
- `getAppSettings()`: Ambil settings dari Firestore
- `saveAppSettings()`: Simpan settings
- `createLicense()`: Buat lisensi baru
- `addProvisioningLog()`: Tambah log provisioning
- `createLicenseKey()`: Generate license key

### **whatsapp.ts**
- `sendActivationWhatsapp()`: Kirim pesan aktivasi
- `sendTestWhatsapp()`: Kirim pesan test
- `sendWhatsappPayload()`: Core function kirim WA via Fonnte
- `normalizePhone()`: Normalisasi nomor telepon
- `resolveFonnteTarget()`: Format nomor untuk Fonnte
- `applyTemplate()`: Replace template variables

---

## 🔐 Environment Variables

```env
# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Google Spreadsheet
GOOGLE_TEMPLATE_SPREADSHEET_ID=
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=
```

**Note:** WhatsApp config disimpan di Firestore, bukan env

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Browser   │
│  (Vue SFC)  │
└──────┬──────┘
       │ useFetch / $fetch
       ↓
┌─────────────┐
│  API Routes │
│ (server/api)│
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Server Utils│
│(firestore-  │
│ data.ts)    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Firestore  │
│  (Firebase) │
└─────────────┘
```

---

## ✅ Fitur yang Sudah Diimplementasi

1. ✅ Dashboard dengan statistik
2. ✅ Form pembuatan lisensi
3. ✅ Daftar lisensi dengan link aktivasi
4. ✅ Integrasi WhatsApp (Fonnte)
5. ✅ Pengaturan template & activation URL
6. ✅ Konfigurasi WhatsApp
7. ✅ Test WhatsApp
8. ✅ Provisioning logs
9. ✅ Firebase Admin integration
10. ✅ Responsive design

---

## 🚧 Fitur yang Belum Diimplementasi

1. ❌ Halaman aktivasi guru (di app terpisah)
2. ❌ Pembuatan spreadsheet otomatis
3. ❌ Batch import lisensi
4. ❌ Export data lisensi
5. ❌ Filter & search lisensi
6. ❌ Edit/delete lisensi
7. ❌ User authentication
8. ❌ Role management

---

## 🎯 Alur Lengkap End-to-End

```
1. Owner Login (belum ada)
   ↓
2. Owner buat lisensi di /licenses
   - Input data guru
   - Submit form
   ↓
3. System generate license key
   - Format: SG-2026-XXXXXX
   - Simpan ke Firestore
   ↓
4. System kirim WhatsApp (jika ada nomor)
   - Format pesan dari template
   - Kirim via Fonnte API
   - Log hasil pengiriman
   ↓
5. Guru terima WhatsApp
   - Klik link aktivasi
   ↓
6. Guru aktivasi (belum diimplementasi)
   - Verifikasi license key
   - Create spreadsheet dari template
   - Share ke email guru
   - Update status license
   ↓
7. Owner lihat status di dashboard
   - License status berubah
   - Log provisioning tercatat
```

---

## 🔍 Tips Development

1. **Testing tanpa Firebase:**
   - Sistem akan return data kosong jika env tidak lengkap
   - Tidak akan error, hanya tampil "belum ada data"

2. **Testing WhatsApp:**
   - Gunakan fitur test di `/whatsapp`
   - Cek response dari Fonnte API

3. **Debug:**
   - Cek terminal untuk error log
   - Cek browser console untuk client error
   - Cek Firestore untuk data persistence

4. **Hot Reload:**
   - Nuxt auto-reload saat file berubah
   - Jika error, restart `npm run dev`

---

## 📝 Catatan Penting

1. **License Key Format:** `SG-{YEAR}-{6 RANDOM CHARS}`
   - Contoh: `SG-2026-A3B7K9`

2. **WhatsApp Template Variables:**
   - `{{teacherName}}` - Nama guru
   - `{{schoolName}}` - Nama sekolah
   - `{{licenseKey}}` - License key
   - `{{activationUrl}}` - Link aktivasi

3. **Firestore Security:**
   - Pastikan rules sudah diatur
   - Owner app butuh full access

4. **Performance:**
   - Dashboard limit 50 licenses
   - Logs limit 20 terbaru
   - Gunakan pagination untuk data besar

---

Dokumentasi ini mencakup semua alur dan fungsi yang ada di folder `owner`.
