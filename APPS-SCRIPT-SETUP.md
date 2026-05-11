# Google Apps Script Setup untuk Spreadsheet Provisioning

## Langkah 1: Deploy Apps Script sebagai Web App

1. **Buka Google Apps Script:**
   - Buka: https://script.google.com
   - Buat project baru atau buka project existing

2. **Copy semua file `.gs` dari folder `google-apps-script/`:**
   - main.gs
   - spreadsheet-provisioning.gs (NEW)
   - drive-image-manager.gs
   - exam-management.gs
   - grade-scaling.gs
   - license-generator.gs
   - setup-properties.gs
   - sheet-controls.gs
   - action-sidebar.html

3. **Deploy sebagai Web App:**
   - Klik **Deploy** > **New deployment**
   - Pilih type: **Web app**
   - Description: "Spreadsheet Provisioning API"
   - Execute as: **Me** (penting! agar punya storage quota)
   - Who has access: **Anyone** (atau **Anyone with Google account**)
   - Klik **Deploy**
   - Copy **Web App URL** yang diberikan

4. **Simpan Web App URL:**
   - Tambahkan ke `.env.local`:
     ```
     GOOGLE_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
     ```

## Langkah 2: Test Apps Script

1. **Test di Apps Script Editor:**
   - Jalankan fungsi `testSpreadsheetProvisioning()`
   - Periksa log (View > Logs)
   - Pastikan spreadsheet ter-create dan ter-share

2. **Test Web App URL:**
   - Jalankan fungsi `getWebAppUrl()` untuk mendapatkan URL
   - Test dengan curl atau Postman:
     ```bash
     curl -X POST "YOUR_WEB_APP_URL" \
       -H "Content-Type: application/json" \
       -d '{
         "licenseKey": "TEST-123",
         "teacherName": "Test Teacher",
         "schoolName": "Test School",
         "email": "teacher@example.com",
         "templateId": "1bwPZ5FehXd80l9uzd6iEXUKJtSUb07DnD7eZiO8XwbE"
       }'
     ```

## Langkah 3: Update Nuxt.js Backend

File `server/utils/google-sheets.ts` sudah diupdate untuk memanggil Apps Script Web App.

## Keuntungan Menggunakan Apps Script:

✅ **Storage Quota:** Apps Script berjalan dengan identitas user yang punya quota
✅ **Ownership Transfer:** Bisa langsung transfer ownership ke guru
✅ **File Restrictions:** Bisa set copyRequiresWriterPermission dan writersCanShare
✅ **No Service Account Limits:** Tidak terbatas quota Service Account
✅ **Simpler Auth:** Tidak perlu manage Service Account credentials untuk copy

## Troubleshooting:

### Error: "Authorization required"
- Pastikan "Execute as: Me" saat deploy
- Pastikan "Who has access: Anyone"

### Error: "Script has not been published"
- Deploy ulang sebagai Web App
- Pastikan menggunakan URL deployment yang benar

### Error: "Cannot transfer ownership"
- Pastikan email guru valid dan bisa menerima file
- Jika gagal, Apps Script akan fallback ke share dengan edit access

### Spreadsheet tidak ter-create
- Periksa Apps Script logs (View > Executions)
- Pastikan template ID benar
- Pastikan script owner punya akses ke template
