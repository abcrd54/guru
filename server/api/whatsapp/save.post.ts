export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  await saveAppSettings({
    whatsappProviderUrl: String(body.whatsappProviderUrl || '').trim(),
    whatsappProviderToken: String(body.whatsappProviderToken || '').trim(),
    whatsappTemplateActivation: String(body.whatsappTemplateActivation || '').trim(),
    whatsappTemplateReady: String(body.whatsappTemplateReady || '').trim()
  })

  return {
    success: true
  }
})
