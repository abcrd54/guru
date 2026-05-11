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
  console.log('🔵 [Google Sheets] Getting Drive client...')
  
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL

  console.log('🔵 [Google Sheets] Client Email:', clientEmail ? '✅ Found' : '❌ Missing')
  console.log('🔵 [Google Sheets] Private Key:', privateKey ? `✅ Found (${privateKey.length} chars)` : '❌ Missing')

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
  console.log('🔵 [Google Sheets] Starting spreadsheet creation...')
  console.log('🔵 [Google Sheets] Template ID:', params.templateId)
  console.log('🔵 [Google Sheets] Teacher:', params.teacherName)
  console.log('🔵 [Google Sheets] School:', params.schoolName)
  console.log('🔵 [Google Sheets] Email:', params.email)
  
  try {
    console.log('🔵 [Google Sheets] Getting Drive client...')
    const drive = getDriveClient()
    console.log('✅ [Google Sheets] Drive client initialized')
    
    // Copy template spreadsheet
    console.log('🔵 [Google Sheets] Copying template spreadsheet...')
    const copyResponse = await drive.files.copy({
      fileId: params.templateId,
      requestBody: {
        name: `${params.schoolName} - ${params.teacherName}`
      }
    })

    const newSpreadsheetId = copyResponse.data.id!
    console.log('✅ [Google Sheets] Spreadsheet copied successfully!')
    console.log('🔵 [Google Sheets] New Spreadsheet ID:', newSpreadsheetId)
    
    // Share with teacher email
    console.log('🔵 [Google Sheets] Sharing with teacher email...')
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
    console.log('✅ [Google Sheets] Spreadsheet shared successfully!')

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}`
    console.log('✅ [Google Sheets] Spreadsheet URL:', spreadsheetUrl)

    return {
      spreadsheetId: newSpreadsheetId,
      spreadsheetUrl
    }
  } catch (error: any) {
    console.error('❌ [Google Sheets] Error creating spreadsheet:', error)
    console.error('❌ [Google Sheets] Error message:', error.message)
    console.error('❌ [Google Sheets] Error stack:', error.stack)
    
    if (error.response) {
      console.error('❌ [Google Sheets] API Response Status:', error.response.status)
      console.error('❌ [Google Sheets] API Response Data:', JSON.stringify(error.response.data, null, 2))
    }
    
    throw new Error(`Gagal membuat spreadsheet: ${error.message}`)
  }
}

export function hasGoogleCredentials() {
  const hasTemplateId = Boolean(process.env.GOOGLE_TEMPLATE_SPREADSHEET_ID)
  const hasClientEmail = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL)
  const hasPrivateKey = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)
  
  console.log('🔵 [Google Sheets] Checking credentials:')
  console.log('  - Template ID:', hasTemplateId ? '✅' : '❌', process.env.GOOGLE_TEMPLATE_SPREADSHEET_ID)
  console.log('  - Client Email:', hasClientEmail ? '✅' : '❌', process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL)
  console.log('  - Private Key:', hasPrivateKey ? '✅' : '❌', hasPrivateKey ? `(${process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.length} chars)` : 'Missing')
  
  return hasTemplateId && hasClientEmail && hasPrivateKey
}
