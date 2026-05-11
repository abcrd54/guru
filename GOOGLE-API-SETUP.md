# Google API Setup Guide

## Required APIs

Untuk sistem SiapGuru Owner berfungsi dengan baik, Anda perlu mengaktifkan API berikut di Google Cloud Console:

### 1. Google Drive API
**Status:** ❌ Belum Aktif  
**Fungsi:** Untuk meng-copy template spreadsheet dan membagikannya ke guru

**Cara Aktifkan:**
1. Buka: https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=23682087077
2. Klik tombol **"Enable"** atau **"Aktifkan"**
3. Tunggu 2-5 menit agar perubahan terpropagasi

### 2. Google Sheets API
**Status:** ✅ Sudah Aktif (biasanya)  
**Fungsi:** Untuk membaca dan menulis data spreadsheet

**Cara Aktifkan (jika belum):**
1. Buka: https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=23682087077
2. Klik tombol **"Enable"** atau **"Aktifkan"**

## Verifikasi Setup

Setelah mengaktifkan API, verifikasi dengan:

1. **Cek di Google Cloud Console:**
   - Buka: https://console.cloud.google.com/apis/dashboard?project=23682087077
   - Pastikan "Google Drive API" dan "Google Sheets API" muncul di daftar enabled APIs

2. **Test di Aplikasi:**
   - Jalankan `npm run dev`
   - Coba aktivasi lisensi
   - Periksa log untuk memastikan tidak ada error

## Troubleshooting

### Error: "Drive API has not been used"
**Solusi:**
1. Aktifkan Google Drive API (lihat langkah di atas)
2. Tunggu 2-5 menit
3. Restart aplikasi (`npm run dev`)
4. Coba lagi

### Error: "File not found: [Template ID]"
**Penyebab:**
- Template spreadsheet tidak ditemukan
- Service Account tidak memiliki akses ke template

**Solusi:**
1. **Verifikasi Template ID:**
   - Buka template spreadsheet di browser
   - Periksa URL: `https://docs.google.com/spreadsheets/d/[TEMPLATE_ID]/edit`
   - Pastikan ID di `.env.local` sama dengan ID di URL

2. **Share Template dengan Service Account:**
   - Buka template spreadsheet: https://docs.google.com/spreadsheets/d/1bwPZ5FehXd80l9uzd6iEXUKJtSUb07DnD7eZiO8XwbE
   - Klik tombol **"Share"** atau **"Bagikan"**
   - Tambahkan email: `firebase-adminsdk-fbsvc@siapguru-ringkas.iam.gserviceaccount.com`
   - Berikan akses **"Viewer"** (minimal) atau **"Editor"**
   - Klik **"Send"** atau **"Kirim"**
   - **PENTING:** Jangan centang "Notify people" jika tidak perlu

3. **Tunggu 1-2 menit** dan coba lagi

### Error: "Storage quota has been exceeded"
**Penyebab:**
- Google Drive storage Service Account sudah penuh
- Terlalu banyak file di Drive Service Account

**Solusi:**
Sistem sudah dikonfigurasi untuk **transfer ownership** ke guru, sehingga file tersimpan di Drive guru, bukan Service Account.

**Jika masih error:**
1. **Cleanup Drive Service Account:**
   - Login ke Google Drive dengan akun Service Account (tidak bisa via browser)
   - Atau gunakan Google Cloud Console untuk melihat file
   - Hapus file-file lama yang tidak terpakai

2. **Alternatif - Gunakan Service Account baru:**
   - Buat Service Account baru di Google Cloud Console
   - Update credentials di `.env.local`
   - Share template dengan Service Account baru

### Error: "Insufficient Permission"
**Solusi:**
1. Pastikan Service Account memiliki akses ke template spreadsheet
2. Share template spreadsheet dengan email: `firebase-adminsdk-fbsvc@siapguru-ringkas.iam.gserviceaccount.com`
3. Berikan akses "Editor" atau "Viewer" (minimal Viewer untuk copy)

### Error: "Invalid credentials"
**Solusi:**
1. Periksa `.env.local` - pastikan `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` benar
2. Pastikan tidak ada karakter tambahan atau spasi
3. Pastikan format `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

## Service Account Info

**Project ID:** 23682087077  
**Project Name:** siapguru-ringkas  
**Service Account Email:** firebase-adminsdk-fbsvc@siapguru-ringkas.iam.gserviceaccount.com

## Template Spreadsheet

**Template ID:** 1bwPZ5FehXd80l9uzd6iEXUKJtSUb07DnD7eZiO8XwbE  
**Template URL:** https://docs.google.com/spreadsheets/d/1bwPZ5FehXd80l9uzd6iEXUKJtSUb07DnD7eZiO8XwbE

**Pastikan template ini:**
- ✅ Dapat diakses oleh Service Account
- ✅ Memiliki struktur yang benar
- ✅ Tidak terhapus atau dipindahkan

## Next Steps

1. ✅ Aktifkan Google Drive API
2. ✅ Tunggu 2-5 menit
3. ✅ Restart aplikasi
4. ✅ Test aktivasi lisensi
5. ✅ Verifikasi spreadsheet ter-create dan ter-share
