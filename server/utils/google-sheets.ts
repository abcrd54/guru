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
    console.log('🔵 [Google Sheets] Getting Sheets and Drive clients...')
    const sheets = getSheetsClient()
    const drive = getDriveClient()
    console.log('✅ [Google Sheets] Clients initialized')
    
    // Try to copy template first
    console.log('🔵 [Google Sheets] Attempting to copy template spreadsheet...')
    let newSpreadsheetId: string
    
    try {
      const copyResponse = await drive.files.copy({
        fileId: params.templateId,
        requestBody: {
          name: `${params.schoolName} - ${params.teacherName}`
        }
      })
      newSpreadsheetId = copyResponse.data.id!
      console.log('✅ [Google Sheets] Template copied successfully!')
      console.log('🔵 [Google Sheets] New Spreadsheet ID:', newSpreadsheetId)
    } catch (copyError: any) {
      console.warn('⚠️ [Google Sheets] Copy failed, creating new spreadsheet instead')
      console.warn('⚠️ [Google Sheets] Copy error:', copyError.message)
      
      // Fallback: Create new spreadsheet and copy structure
      console.log('🔵 [Google Sheets] Creating new spreadsheet...')
      const createResponse = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `${params.schoolName} - ${params.teacherName}`
          }
        }
      })
      newSpreadsheetId = createResponse.data.spreadsheetId!
      console.log('✅ [Google Sheets] New spreadsheet created!')
      console.log('🔵 [Google Sheets] New Spreadsheet ID:', newSpreadsheetId)
      
      // Copy sheets from template
      console.log('🔵 [Google Sheets] Copying sheets from template...')
      try {
        const templateData = await sheets.spreadsheets.get({
          spreadsheetId: params.templateId
        })
        
        for (const sheet of templateData.data.sheets || []) {
          const sheetId = sheet.properties?.sheetId
          if (sheetId !== undefined) {
            await sheets.spreadsheets.sheets.copyTo({
              spreadsheetId: params.templateId,
              sheetId: sheetId,
              requestBody: {
                destinationSpreadsheetId: newSpreadsheetId
              }
            })
          }
        }
        
        // Delete default Sheet1
        const newSheetData = await sheets.spreadsheets.get({
          spreadsheetId: newSpreadsheetId
        })
        const defaultSheet = newSheetData.data.sheets?.find((s: any) => s.properties?.title === 'Sheet1')
        if (defaultSheet?.properties?.sheetId !== undefined) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: newSpreadsheetId,
            requestBody: {
              requests: [{
                deleteSheet: {
                  sheetId: defaultSheet.properties.sheetId
                }
              }]
            }
          })
        }
        
        console.log('✅ [Google Sheets] Template structure copied!')
      } catch (structureError: any) {
        console.warn('⚠️ [Google Sheets] Could not copy template structure:', structureError.message)
        console.warn('⚠️ [Google Sheets] Spreadsheet created with default structure')
      }
    }
    
    // Share with teacher email as owner (transfer ownership)
    console.log('🔵 [Google Sheets] Transferring ownership to teacher...')
    try {
      // First, add teacher as writer
      await drive.permissions.create({
        fileId: newSpreadsheetId,
        requestBody: {
          type: 'user',
          role: 'writer',
          emailAddress: params.email
        },
        sendNotificationEmail: false
      })
      console.log('✅ [Google Sheets] Teacher added as writer')
      
      // Then transfer ownership
      await drive.permissions.create({
        fileId: newSpreadsheetId,
        requestBody: {
          type: 'user',
          role: 'owner',
          emailAddress: params.email
        },
        transferOwnership: true,
        sendNotificationEmail: true,
        emailMessage: `Spreadsheet SiapGuru Anda sudah siap! Silakan akses untuk mengelola nilai siswa.`
      })
      console.log('✅ [Google Sheets] Ownership transferred to teacher')
    } catch (permError: any) {
      console.warn('⚠️ [Google Sheets] Could not transfer ownership, keeping as shared file')
      console.warn('⚠️ [Google Sheets] Permission error:', permError.message)
      
      // Fallback: just share with write access
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
      console.log('✅ [Google Sheets] Spreadsheet shared with write access')
    }

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
    
    // Check if it's a Drive API not enabled error
    if (error.message && error.message.includes('Drive API has not been used')) {
      throw new Error('Google Drive API belum diaktifkan. Silakan aktifkan di Google Cloud Console terlebih dahulu.')
    }
    
    // Check if it's a file not found error
    if (error.message && error.message.includes('File not found')) {
      throw new Error(`Template spreadsheet tidak ditemukan (ID: ${params.templateId}). Pastikan: 1) Template ID benar, 2) Template di-share dengan Service Account: ${process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL}`)
    }
    
    // Check if it's a storage quota error
    if (error.message && error.message.includes('storage quota')) {
      console.log('⚠️ [Google Sheets] Storage quota error detected, will try alternative method on retry')
      throw new Error('Storage quota Service Account terdeteksi penuh. Sistem akan mencoba metode alternatif. Silakan coba lagi.')
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
