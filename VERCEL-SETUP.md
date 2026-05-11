# Setup Vercel untuk SiapGuru Owner

## 🚀 Deployment Steps

### 1. Push ke GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### 2. Import Project di Vercel
1. Buka [vercel.com](https://vercel.com)
2. Klik "Add New Project"
3. Import repository GitHub Anda
4. Pilih folder `owner` sebagai root directory
5. Framework Preset: **Nuxt.js**

### 3. Configure Environment Variables

Di Vercel Dashboard → Settings → Environment Variables, tambahkan semua variable berikut:

#### Firebase Admin
```
FIREBASE_PROJECT_ID=siapguru-ringkas
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@siapguru-ringkas.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC1cFTLKpoZHkBi
ieRgs5j9GEch0uPkMw05jQOwFPxlB6/xcqygL3k6YOxL9YQtD57hA8jJfs4hI85+
2Q/aIKIcS4FTLEjBDeuJvIHWHPP/aZJQJERTpisQFrxBwTiozKpeY8jE3s0qOIMD
n+mt/JGZfspLpVJ9ytVnaEWA8o86vEF/JvT1eujJ8wEU+/TJWSHNq/WZgCHBZe5m
M+egXwOwiuIqDH29IyUUjGejZuVEglRD38WhvyXYf/b9EAEdy65akmC2WmtbMg4D
L8JW88cuXslYmP8QgNo7zix0K467nq6GAVSEPb6PATN+wj0ENRtSn7hikEmvNE1n
fF26axTjAgMBAAECggEAHLez5BhRHaqpHC+hIyEqFN0z3QmpImRmMna8X7FipYcK
9RdmdVAuSuwuWnN4wT0Ys5rKvAHDFIG7XF504NyLbBkTVhvLRCs03a8licM5Z3LJ
QsAKxIaniDtg/rNbiXQjfx8iFu8A4C7jpb442V4BmZ702/ZF0T06e8yIO7moq+39
tUEobLybmuTJsBgYdScHJgy/CnWby0KZofcNBhLJt6GPltxPYBRqUbvwEY0Prtr8
S9AdskPdZJwYb1jhHzAhm86UOVsEkS88oyrm/SzN/s+AMuZtGpKY96NKD+qH040q
d7Da0T49oaSz6aLe+96fBPDEDLdfQEfcQUadydET+QKBgQDnmBOa0cJuqJUoqzj1
iWCnlUP3NICniOUFNxUV4fkl6HQAlzACb3WSbZq5EZWma8Uk90IZRK/9hh4wnK7b
MAKWAjiVPrdpFbWQz5caH13IgkpAUc0qovDzhg4R2d8apaU+it8/vTJTkyrNRqVJ
Ma47LBfgsFF3vZtuCUcDO/Z6RQKBgQDIjyuxp83j8Ycxm4um8M/GCKEf2tOKr2ZC
fC1uCSHH578KoUB6G/Q+tq7nd+aWYwBiGDYUv4qDjM+SnNxvZd6YjnGJIWzp1XJG
swcYA16JLsuIf5YzhJhtTk/+F8dwAv79ZdbSKk3PCYBtUYnMV3XM1lo14seLirSs
TYc9BBkZBwKBgHF3a9uFe7pVtEappQ1/kjBpDFSYj5QFmRd2BkmjXjs5aWRErovy
6eqk8pJL0EMqN/vFfMf+hC81P6NXkL/pBMtUKT7N7HR642sgmgp9ZahwVUqwCVIj
ZOQbQNd0JD/c+lnrFjgXTQnvZ6ANRbvXsGJjVwuJt1BwQC+oMfeesEL1AoGAV1O/
usNOKwpny3nm/PGuBpSLU8t8gM6OwDRBs7/WLa0CyiYcZQ728reowLC8fo7tA8l3
AuHD9jPBzhzu/rJkkhiz5vne6pI+B/q8BACzkRgHF5A2XohFtpJ60jCYbnVfggZt
22UALD3+5ZqzXX5XlLFg5kWwjVoAAWZglHjMVNECgYEAjGWWKj95VdDaa8UczmDE
j+hZ6/j5uliaqOSWgNqYqgBDMYKJ2smsGb0djGBWyD9EkzPX+aUnss2sS+avDKDs
GfMVzl5URApvtTnq7gtT9s/30MEq2UkFLl3VKzjRkR64YQicqGeyNu8HxEa6EbOD
YoD2JN9hr4iIZhCoxu70cFY=
-----END PRIVATE KEY-----
```

**⚠️ PENTING untuk FIREBASE_PRIVATE_KEY:**
- Paste seluruh private key termasuk `-----BEGIN PRIVATE KEY-----` dan `-----END PRIVATE KEY-----`
- Jangan tambahkan quotes `"` di awal/akhir
- Vercel akan otomatis handle newlines

#### Google Spreadsheet Provisioning
```
GOOGLE_TEMPLATE_SPREADSHEET_ID=1bwPZ5FehXd80l9uzd6iEXUKJtSUb07DnD7eZiO8XwbE
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=firebase-adminsdk-fbsvc@siapguru-ringkas.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=<sama seperti FIREBASE_PRIVATE_KEY>
```

#### WhatsApp Provider (Opsional)
```
WHATSAPP_PROVIDER_URL=https://api.fonnte.com/send
WHATSAPP_PROVIDER_TOKEN=<your-fonnte-token>
```

### 4. Deploy
1. Klik "Deploy"
2. Tunggu build selesai (±2-3 menit)
3. Buka URL production Anda

---

## 🔧 Troubleshooting

### Error: "Firebase Admin environment variables belum lengkap"

**Penyebab:** Environment variables tidak terset dengan benar di Vercel

**Solusi:**
1. Cek di Vercel Dashboard → Settings → Environment Variables
2. Pastikan semua variable ada (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
3. Untuk FIREBASE_PRIVATE_KEY:
   - Paste tanpa quotes
   - Include `-----BEGIN PRIVATE KEY-----` dan `-----END PRIVATE KEY-----`
   - Vercel otomatis handle newlines
4. Redeploy setelah update environment variables

### Error: "Invalid time value" atau Date errors

**Penyebab:** Firestore Timestamp serialization

**Solusi:** Sudah diperbaiki di `firestore-data.ts` dengan fungsi `toIso()` yang handle berbagai format timestamp

### Error saat save settings

**Penyebab:** Missing import di `firestore-data.ts`

**Solusi:** Sudah diperbaiki dengan menambahkan:
```typescript
import { getAdminDb, hasFirebaseAdminEnv } from './firebase-admin'
```

---

## 📝 Checklist Deployment

- [ ] Push semua perubahan ke GitHub
- [ ] Import project di Vercel
- [ ] Set root directory ke `owner`
- [ ] Pilih framework preset: Nuxt.js
- [ ] Tambahkan semua environment variables
- [ ] Deploy
- [ ] Test semua fitur:
  - [ ] Dashboard load
  - [ ] Buat lisensi baru
  - [ ] Simpan settings (template ID & activation URL)
  - [ ] Simpan WhatsApp config
  - [ ] Test WhatsApp notification

---

## 🔐 Security Notes

1. **Jangan commit `.env.local`** ke Git (sudah ada di `.gitignore`)
2. **Private keys** hanya disimpan di:
   - Local: `.env.local`
   - Production: Vercel Environment Variables
3. **Rotate keys** jika tercopy ke tempat yang tidak aman
4. **Firebase Rules** pastikan sudah dikonfigurasi dengan benar

---

## 📚 Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Nuxt.js Deployment](https://nuxt.com/docs/getting-started/deployment#vercel)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
