export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const teacherName = String(body.teacherName || '').trim()
  const schoolName = String(body.schoolName || '').trim()
  const userEmail = String(body.userEmail || '').trim()
  const phone = String(body.phone || '').trim()

  if (!teacherName || !schoolName || !userEmail) {
    throw createError({
      statusCode: 400,
      message: 'Nama guru, sekolah, dan email wajib diisi.'
    })
  }

  const { licenseKey } = await createLicense({
    teacherName,
    schoolName,
    userEmail,
    phone
  })

  if (phone) {
    const whatsappResult = await sendActivationWhatsapp({
      licenseKey,
      teacherName,
      schoolName,
      phone
    })

    await addProvisioningLog({
      licenseKey,
      teacherName,
      status: whatsappResult.sent ? 'whatsapp_sent' : 'whatsapp_skipped',
      message: whatsappResult.sent
        ? `Pesan aktivasi dikirim ke ${phone}.`
        : `Pesan aktivasi tidak terkirim: ${whatsappResult.reason || 'cek konfigurasi Fonnte'}.${whatsappResult.response ? ` Response: ${JSON.stringify(whatsappResult.response)}` : ''}`
    })
  }

  return {
    success: true,
    licenseKey
  }
})
