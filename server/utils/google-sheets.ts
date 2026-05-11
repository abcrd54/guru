import { google } from 'googleapis'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local manually
config({ path: resolve(process.cwd(), '.env.local') })

let sheetsClient: any = null

export function getSheetsClient() {
  if (sheetsClient) return sheetsClient

  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL

  if (!privateKey || !clientEmail) {
    throw new Error('Google Service Account credentials not configured')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n')
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ]
  })

  sheetsClient = google.sheets({ version: 'v4', auth })
  return sheetsClient
}

export function getDriveClient() {
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL

  if (!privateKey || !clientEmail) {
    throw new Error('Google Service Account credentials not configured')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n')
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ]
  })

  return google.drive({ version: 'v3', auth })
}

export async function createSpreadsheetFromTemplate(params: {
  templateId: string
  teacherName: string
  schoolName: string
  email: string
}) {
  try {
    const drive = getDriveClient()
    
    // Copy template spreadsheet
    const copyResponse = await drive.files.copy({
      fileId: params.templateId,
      requestBody: {
        name: `${params.schoolName} - ${params.teacherName}`
      }
    })

    const newSpreadsheetId = copyResponse.data.id!
    
    // Share with teacher email
    await drive.permissions.create({
      fileId: newSpreadsheetId,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress: params.email
      },
      sendNotificationEmail: true,
      emailMessage: `Spreadsheet SiapGuru Anda sudah siap! Silakan akses untuk mengelola nilai siswa.`
    })

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}`

    return {
      spreadsheetId: newSpreadsheetId,
      spreadsheetUrl
    }
  } catch (error: any) {
    console.error('Error creating spreadsheet:', error)
    throw new Error(`Gagal membuat spreadsheet: ${error.message}`)
  }
}

export function hasGoogleCredentials() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
    process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL &&
    process.env.GOOGLE_TEMPLATE_SPREADSHEET_ID
  )
}
