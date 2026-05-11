export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const phone = String(body.testPhone || '').trim()
  const message = String(body.testMessage || '').trim()

  if (!phone || !message) {
    throw createError({
      statusCode: 400,
      message: 'Nomor dan pesan test wajib diisi'
    })
  }

  const result = await sendTestWhatsapp({ phone, message })
  
  return {
    success: result.sent,
    message: result.sent
      ? 'Pesan test berhasil dikirim ke provider'
      : `Pesan test gagal: ${result.reason || 'cek konfigurasi Fonnte'}`
  }
})
