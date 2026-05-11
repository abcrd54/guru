# Alur Lengkap Sistem SiapGuru Owner

## 📋 Overview

Sistem ini mengelola lisensi guru dan otomatis membuat spreadsheet dari template Google Sheets.

---

## 🔄 Alur Aktivasi Lisensi

### 1. Owner Membuat Lisensi Baru

**Halaman:** `/licenses`

**Proses:**
1. Owner mengisi form:
   - Nama Guru
   - Nama Sekolah
   - Email Guru
   - No. WhatsApp (opsional)

2. Klik "Buat Lisensi"

3. Sistem:
   - Generate license key (format: `SG-2026-XXXXXX`)
   - Simpan ke Firestore collection `licenses` dengan status `isActive: true`
   - Jika ada nomor WA → kirim pesan aktivasi (opsional, tergantung konfigurasi)

**Output:**
- License key baru (contoh: `SG-2026-ABC123`)
- Link aktivasi: `https://guru.siapdigital.web.id/activate/SG-2026-ABC123`

---

### 2. Guru Mengaktifkan Lisensi

**Halaman:** `/activate/[licenseKey]`

**Proses:**
1. Guru membuka link aktivasi dari WhatsApp/email
2. Sistem cek status lisensi:
   - ✅ Valid & belum dipakai → tampilkan form
   - ❌ Tidak valid → tampilkan error
   - ⚠️ Sudah dipakai → tampilkan info sudah digunakan

3. Guru mengisi/konfirmasi data:
   - Nama Lengkap
   - Nama Sekolah
   - Email (untuk akses spreadsheet)
   - No. WhatsApp (opsional)

4. Klik "Aktifkan Lisensi"

5. **Sistem melakukan:**

   a. **Update License:**
   ```javascript
   licenses/[licenseKey] {
     teacherName: "...",
     schoolName: "...",
     userEmail: "...",
     phone: "...",
     isActive: false,  // Tandai sudah dipakai
     usedAt: timestamp
   }
   ```

   b. **Create Teacher Record:**
   ```javascript
   teachers/[autoId] {
     licenseKey: "SG-2026-ABC123",
     teacherName: "...",
     schoolName: "...",
     email: "...",
     phone: "...",
     spreadsheetId: "",  // Akan diisi setelah spreadsheet dibuat
     spreadsheetUrl: "",
     createdAt: timestamp
   }
   ```

   c. **Log Provisioning:**
   ```javascript
   provisioning_logs/[autoId] {
     licenseKey: "SG-2026-ABC123",
     teacherName: "...",
     status: "activated",
     message: "Lisensi berhasil diaktifkan",
     createdAt: timestamp
   }
   ```

   d. **Create Spreadsheet (OTOMATIS):**
   - Menggunakan Google Drive API
   - Copy dari template: `GOOGLE_TEMPLATE_SPREADSHEET_ID`
   - Rename: `[Nama Sekolah] - [Nama Guru]`
   - Share ke email guru dengan role `writer`
   - Google otomatis kirim email notifikasi

   e. **Update dengan Spreadsheet URL:**
   ```javascript
   // Update teacher record
   teachers/[teacherId] {
     spreadsheetId: "1abc...",
     spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1abc...",
     updatedAt: timestamp
   }
   
   // Update license record
   licenses/[licenseKey] {
     spreadsheetUrl: "https://docs.google.com/spreadsheets/d/1abc...",
     updatedAt: timestamp
   }
   ```

   f. **Log Spreadsheet Creation:**
   ```javascript
   provisioning_logs/[autoId] {
     licenseKey: "SG-2026-ABC123",
     teacherName: "...",
     status: "spreadsheet_created",
     message: "Spreadsheet berhasil dibuat dan di-share",
     createdAt: timestamp
   }
   ```

   g. **Kirim WhatsApp (jika ada nomor):**
   - Menggunakan Fonnte API
   - Template: `whatsappTemplateReady` dari `app_settings`
   - Isi pesan:
     ```
     Halo [Nama Guru]! ✅
     
     Spreadsheet Anda sudah siap digunakan!
     
     Sekolah: [Nama Sekolah]
     License: SG-2026-ABC123
     
     Klik link di bawah untuk membuka:
     https://docs.google.com/spreadsheets/d/1abc...
     
     Spreadsheet sudah di-share ke email Anda.
     
     Salam,
     Tim SiapGuru
     ```

   h. **Log WhatsApp:**
   ```javascript
   provisioning_logs/[autoId] {
     licenseKey: "SG-2026-ABC123",
     teacherName: "...",
     status: "whatsapp_sent",
     message: "Notifikasi WhatsApp berhasil dikirim",
     createdAt: timestamp
   }
   ```

**Output:**
- Halaman success dengan link spreadsheet
- Email dari Google (otomatis)
- WhatsApp dengan link spreadsheet (jika ada nomor)

---

### 3. Guru Mengakses Spreadsheet

**Halaman:** `/sheet/[licenseKey]`

**Proses:**
1. Guru membuka link dari WhatsApp: `https://guru.siapdigital.web.id/sheet/SG-2026-ABC123`
2. Sistem cek data teacher berdasarkan license key
3. Jika spreadsheet sudah ada:
   - Tampilkan info guru
   - **Auto-redirect ke Google Sheets setelah 2 detik**
   - Tombol manual "Buka Spreadsheet"
4. Jika spreadsheet belum ada:
   - Tampilkan "Spreadsheet sedang diproses"
   - Tombol "Periksa Lagi"

---

## 🔧 Konfigurasi yang Diperlukan

### Environment Variables (.env.local)

```bash
# Firebase Admin
FIREBASE_PROJECT_ID=siapguru-ringkas
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@siapguru-ringkas.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Spreadsheet Provisioning
GOOGLE_TEMPLATE_SPREADSHEET_ID=1bwPZ5FehXd80l9uzd6iEXUKJtSUb07DnD7eZiO8XwbE
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=firebase-adminsdk-xxx@siapguru-ringkas.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# WhatsApp Provider (Fonnte)
WHATSAPP_PROVIDER_URL=https://api.fonnte.com/send
WHATSAPP_PROVIDER_TOKEN=your-fonnte-token
```

### Firestore Settings (app_settings/owner)

```javascript
{
  templateSpreadsheetId: "1bwPZ5FehXd80l9uzd6iEXUKJtSUb07DnD7eZiO8XwbE",
  activationBaseUrl: "https://guru.siapdigital.web.id",
  whatsappProviderUrl: "https://api.fonnte.com/send",
  whatsappProviderToken: "your-fonnte-token",
  whatsappTemplateActivation: "Halo {{teacherName}}...",
  whatsappTemplateReady: "Halo {{teacherName}}! ✅..."
}
```

---

## 📊 Firestore Collections

### licenses/[licenseKey]
```javascript
{
  teacherName: string,
  schoolName: string,
  userEmail: string,
  phone: string,
  isActive: boolean,  // true = belum dipakai, false = sudah dipakai
  spreadsheetUrl: string,
  createdAt: timestamp,
  usedAt: timestamp,
  updatedAt: timestamp
}
```

### teachers/[autoId]
```javascript
{
  licenseKey: string,
  teacherName: string,
  name: string,  // alias untuk teacherName
  schoolName: string,
  email: string,
  phone: string,
  spreadsheetId: string,
  spreadsheetUrl: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### provisioning_logs/[autoId]
```javascript
{
  licenseKey: string,
  teacherName: string,
  status: string,  // activated, spreadsheet_created, whatsapp_sent, etc.
  message: string,
  createdAt: timestamp
}
```

### app_settings/owner
```javascript
{
  templateSpreadsheetId: string,
  activationBaseUrl: string,
  whatsappProviderUrl: string,
  whatsappProviderToken: string,
  whatsappTemplateActivation: string,
  whatsappTemplateReady: string,
  updatedAt: timestamp
}
```

---

## 🎯 Template Variables

### WhatsApp Template Activation
```
{{teacherName}}    - Nama guru
{{schoolName}}     - Nama sekolah
{{licenseKey}}     - Kode lisensi
{{activationUrl}}  - Link aktivasi lengkap
```

### WhatsApp Template Ready
```
{{teacherName}}    - Nama guru
{{schoolName}}     - Nama sekolah
{{licenseKey}}     - Kode lisensi
{{spreadsheetUrl}} - Link spreadsheet Google Sheets
```

---

## ✅ Checklist Implementasi

- [x] Create license API
- [x] Activation page dengan form
- [x] Auto-create spreadsheet dari template
- [x] Auto-share spreadsheet ke email guru
- [x] Update Firestore dengan spreadsheet URL
- [x] Send WhatsApp notification dengan link spreadsheet
- [x] Sheet access page dengan auto-redirect
- [x] Provisioning logs untuk tracking
- [x] Error handling untuk setiap step
- [x] Layout tanpa sidebar untuk halaman public

---

## 🚀 Testing Checklist

1. **Create License:**
   - [ ] Buat lisensi baru di `/licenses`
   - [ ] Cek license key ter-generate
   - [ ] Cek data tersimpan di Firestore

2. **Activate License:**
   - [ ] Buka link `/activate/[licenseKey]`
   - [ ] Isi form aktivasi
   - [ ] Cek spreadsheet otomatis dibuat
   - [ ] Cek email notifikasi dari Google
   - [ ] Cek WhatsApp terkirim (jika ada nomor)
   - [ ] Cek data di Firestore ter-update

3. **Access Spreadsheet:**
   - [ ] Buka link `/sheet/[licenseKey]`
   - [ ] Cek auto-redirect ke Google Sheets
   - [ ] Cek akses spreadsheet dengan email guru

4. **Error Handling:**
   - [ ] Test dengan license key tidak valid
   - [ ] Test dengan license yang sudah dipakai
   - [ ] Test tanpa nomor WhatsApp
   - [ ] Test dengan Google credentials tidak lengkap

---

## 📝 Notes

- Spreadsheet dibuat **otomatis** saat aktivasi, tidak ada delay
- Email notifikasi dari Google dikirim **otomatis** oleh Google Drive API
- WhatsApp hanya dikirim jika nomor tersedia dan Fonnte dikonfigurasi
- Jika Google credentials tidak lengkap, aktivasi tetap berhasil tapi spreadsheet tidak dibuat
- Semua error di-log ke `provisioning_logs` untuk debugging
