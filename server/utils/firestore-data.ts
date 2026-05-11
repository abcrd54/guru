import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getAdminDb, hasFirebaseAdminEnv } from './firebase-admin'

export type LicenseRecord = {
  id: string
  teacherName: string
  schoolName: string
  userEmail: string
  phone: string
  status: string
  spreadsheetUrl: string
  createdAt: string
  isActive: boolean
}

export type TeacherRecord = {
  id: string
  name: string
  email: string
  school: string
  phone: string
  licenseKey: string
  spreadsheetId: string
  spreadsheetUrl: string
}

export type ProvisioningRecord = {
  id: string
  licenseKey: string
  teacherName: string
  status: string
  message: string
  createdAt: string
}

export type AppSettingsRecord = {
  templateSpreadsheetId: string
  activationBaseUrl: string
  whatsappProviderUrl: string
  whatsappProviderToken: string
  whatsappTemplateActivation: string
  whatsappTemplateReady: string
}

function toIso(value: unknown) {
  if (!value) return '-'
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return '-'
}

export function createLicenseKey() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `SG-${new Date().getFullYear()}-${suffix}`
}

export async function getDashboardData() {
  if (!hasFirebaseAdminEnv()) {
    return {
      configured: false,
      licenses: [] as LicenseRecord[],
      teachers: [] as TeacherRecord[],
      provisioningLogs: [] as ProvisioningRecord[]
    }
  }

  const db = getAdminDb()
  const [licensesSnap, teachersSnap, provisioningSnap] = await Promise.all([
    db.collection('licenses').limit(50).get(),
    db.collection('teachers').limit(50).get(),
    db.collection('provisioning_logs').orderBy('createdAt', 'desc').limit(20).get().catch(() => null)
  ])

  const licenses = licensesSnap.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      teacherName: String(data.teacherName || ''),
      schoolName: String(data.schoolName || ''),
      userEmail: String(data.userEmail || ''),
      phone: String(data.phone || ''),
      status: data.isActive === false ? 'Sudah Dipakai' : 'Aktif',
      spreadsheetUrl: String(data.spreadsheetUrl || ''),
      createdAt: toIso(data.usedAt || data.createdAt),
      isActive: Boolean(data.isActive !== false)
    }
  })

  const teachers = teachersSnap.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      name: String(data.teacherName || data.name || ''),
      email: String(data.email || ''),
      school: String(data.schoolName || ''),
      phone: String(data.phone || ''),
      licenseKey: String(data.licenseKey || ''),
      spreadsheetId: String(data.spreadsheetId || ''),
      spreadsheetUrl: String(data.spreadsheetUrl || '')
    }
  })

  const provisioningLogs = provisioningSnap
    ? provisioningSnap.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          licenseKey: String(data.licenseKey || ''),
          teacherName: String(data.teacherName || ''),
          status: String(data.status || ''),
          message: String(data.message || ''),
          createdAt: toIso(data.createdAt)
        }
      })
    : []

  return {
    configured: true,
    licenses,
    teachers,
    provisioningLogs
  }
}

export async function getAppSettings() {
  if (!hasFirebaseAdminEnv()) {
    return {
      configured: false,
      settings: {
        templateSpreadsheetId: '',
        activationBaseUrl: '',
        whatsappProviderUrl: '',
        whatsappProviderToken: '',
        whatsappTemplateActivation: '',
        whatsappTemplateReady: ''
      } as AppSettingsRecord
    }
  }

  const db = getAdminDb()
  const snapshot = await db.collection('app_settings').doc('owner').get()
  const data = snapshot.data() || {}

  return {
    configured: true,
    settings: {
      templateSpreadsheetId: String(data.templateSpreadsheetId || ''),
      activationBaseUrl: String(data.activationBaseUrl || ''),
      whatsappProviderUrl: String(data.whatsappProviderUrl || ''),
      whatsappProviderToken: String(data.whatsappProviderToken || ''),
      whatsappTemplateActivation: String(data.whatsappTemplateActivation || ''),
      whatsappTemplateReady: String(data.whatsappTemplateReady || '')
    } as AppSettingsRecord
  }
}

export async function saveAppSettings(input: Partial<AppSettingsRecord>) {
  if (!hasFirebaseAdminEnv()) {
    throw new Error('Firebase Admin environment variables belum lengkap.')
  }

  const db = getAdminDb()
  await db.collection('app_settings').doc('owner').set(
    {
      ...input,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  )
}

export async function createLicense(params: {
  teacherName: string
  schoolName: string
  userEmail: string
  phone: string
}) {
  const db = getAdminDb()
  const licenseKey = createLicenseKey()

  await db.collection('licenses').doc(licenseKey).set({
    teacherName: params.teacherName,
    schoolName: params.schoolName,
    userEmail: params.userEmail,
    phone: params.phone,
    isActive: true,
    createdAt: FieldValue.serverTimestamp()
  })

  return { licenseKey }
}

export async function addProvisioningLog(params: {
  licenseKey: string
  teacherName: string
  status: string
  message: string
}) {
  const db = getAdminDb()
  
  await db.collection('provisioning_logs').add({
    licenseKey: params.licenseKey,
    teacherName: params.teacherName,
    status: params.status,
    message: params.message,
    createdAt: FieldValue.serverTimestamp()
  })
}

export async function getLicenseByKey(licenseKey: string) {
  if (!hasFirebaseAdminEnv()) {
    throw new Error('Firebase Admin environment variables belum lengkap.')
  }

  const db = getAdminDb()
  const doc = await db.collection('licenses').doc(licenseKey).get()
  
  if (!doc.exists) {
    return null
  }

  const data = doc.data()!
  return {
    id: doc.id,
    teacherName: String(data.teacherName || ''),
    schoolName: String(data.schoolName || ''),
    userEmail: String(data.userEmail || ''),
    phone: String(data.phone || ''),
    isActive: Boolean(data.isActive !== false),
    spreadsheetUrl: String(data.spreadsheetUrl || ''),
    createdAt: toIso(data.createdAt),
    usedAt: data.usedAt ? toIso(data.usedAt) : null
  }
}

export async function activateLicense(params: {
  licenseKey: string
  teacherName: string
  schoolName: string
  email: string
  phone: string
}) {
  if (!hasFirebaseAdminEnv()) {
    throw new Error('Firebase Admin environment variables belum lengkap.')
  }

  const db = getAdminDb()
  const licenseRef = db.collection('licenses').doc(params.licenseKey)
  const licenseDoc = await licenseRef.get()

  if (!licenseDoc.exists) {
    throw new Error('Lisensi tidak ditemukan')
  }

  const licenseData = licenseDoc.data()!
  
  if (licenseData.isActive === false) {
    throw new Error('Lisensi sudah digunakan sebelumnya')
  }

  // Update license with teacher data
  await licenseRef.update({
    teacherName: params.teacherName,
    schoolName: params.schoolName,
    userEmail: params.email,
    phone: params.phone,
    isActive: false,
    usedAt: FieldValue.serverTimestamp()
  })

  // Create teacher record
  const teacherRef = await db.collection('teachers').add({
    licenseKey: params.licenseKey,
    teacherName: params.teacherName,
    name: params.teacherName,
    schoolName: params.schoolName,
    email: params.email,
    phone: params.phone,
    spreadsheetId: '',
    spreadsheetUrl: '',
    createdAt: FieldValue.serverTimestamp()
  })

  // Log provisioning
  await addProvisioningLog({
    licenseKey: params.licenseKey,
    teacherName: params.teacherName,
    status: 'activated',
    message: 'Lisensi berhasil diaktifkan'
  })

  // TODO: Create spreadsheet using Google Apps Script or Google Sheets API
  // For now, return empty spreadsheet URL
  // You can implement spreadsheet creation here or via webhook

  return {
    teacherId: teacherRef.id,
    spreadsheetUrl: '' // Will be updated after spreadsheet creation
  }
}

