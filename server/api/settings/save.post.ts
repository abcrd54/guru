export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  await saveAppSettings({
    templateSpreadsheetId: String(body.templateSpreadsheetId || '').trim(),
    activationBaseUrl: String(body.activationBaseUrl || '').trim()
  })

  return {
    success: true
  }
})
