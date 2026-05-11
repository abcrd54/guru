import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local manually
config({ path: resolve(process.cwd(), '.env.local') })

let dbInstance: ReturnType<typeof getFirestore> | null = null

export function getAdminDb() {
  if (dbInstance) return dbInstance

  // Gunakan process.env langsung karena useRuntimeConfig() tidak bekerja dengan baik
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  
  console.log('[DEBUG] Firebase env check:', {
    hasProjectId: !!projectId,
    hasClientEmail: !!clientEmail,
    hasPrivateKey: !!privateKey,
    projectId: projectId?.substring(0, 10) + '...',
  })
  
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
