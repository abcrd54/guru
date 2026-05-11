# Firebase Admin Environment Variables Fix

## Masalah
Nuxt 3 tidak membaca environment variables dari `.env.local` dengan benar saat menggunakan `useRuntimeConfig()` di server utils. Ini menyebabkan Firebase Admin SDK gagal initialize dengan error:
```
Firebase Admin environment variables belum lengkap.
```

## Root Cause
- `useRuntimeConfig()` di Nuxt 3 tidak selalu membaca `process.env` dengan benar di server-side
- File `.env.local` tidak ter-load otomatis oleh Nuxt runtime config system
- Runtime config mapping di `nuxt.config.ts` tidak bekerja untuk server utils

## Solusi
Gunakan package `dotenv` untuk load `.env.local` secara manual di server utils:

### 1. Install dotenv (sudah terinstall)
```bash
npm install dotenv
```

### 2. Modifikasi `server/utils/firebase-admin.ts`
```typescript
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local manually
config({ path: resolve(process.cwd(), '.env.local') })

let dbInstance: ReturnType<typeof getFirestore> | null = null

export function getAdminDb() {
  if (dbInstance) return dbInstance

  // Gunakan process.env langsung
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin environment variables belum lengkap.')
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n')
      })
    })
  }

  dbInstance = getFirestore()
  return dbInstance
}

export function hasFirebaseAdminEnv() {
  try {
    return Boolean(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    )
  } catch {
    return false
  }
}
```

### 3. Fix formatDate Function
Firestore Timestamp serialization menyebabkan error "Invalid time value". Perbaiki dengan handle berbagai format:

```typescript
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
```

## Testing
Setelah fix, test dengan:

```bash
# Test API endpoint
Invoke-WebRequest -Uri "http://localhost:3000/api/licenses/create" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"teacherName":"Test Guru","schoolName":"SMA Test","userEmail":"test@gmail.com"}'

# Expected response:
# {
#   "success": true,
#   "licenseKey": "SG-2026-XXXXXX"
# }
```

## Hasil
✅ Firebase Admin SDK berhasil initialize  
✅ License creation API berfungsi dengan baik  
✅ Data tersimpan ke Firestore  
✅ Dashboard dan Licenses page menampilkan data real-time  
✅ Statistik lisensi update otomatis  
✅ Format tanggal tampil dengan benar  

## Environment Variables Required
Pastikan `.env.local` berisi:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Notes
- Solusi ini bypass Nuxt runtime config system
- `dotenv` load dilakukan sekali saat server start
- Cached `dbInstance` mencegah multiple initialization
- Console.log debug bisa dihapus setelah testing selesai
