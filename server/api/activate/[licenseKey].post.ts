export default defineEventHandler(async (event) => {
  const licenseKey = getRouterParam(event, 'licenseKey')
  const body = await readBody(event)
  
  if (!licenseKey) {
    throw createError({
      statusCode: 400,
      message: 'License key is required'
    })
  }

  const { teacherName, schoolName, email, phone } = body

  if (!teacherName || !schoolName || !email) {
    throw createError({
      statusCode: 400,
      message: 'Nama guru, nama sekolah, dan email wajib diisi'
    })
  }

  try {
    // Activate license and create spreadsheet
    const result = await activateLicense({
      licenseKey,
      teacherName: String(teacherName).trim(),
      schoolName: String(schoolName).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : ''
    })

    return {
      success: true,
      message: 'Lisensi berhasil diaktifkan',
      spreadsheetUrl: result.spreadsheetUrl || ''
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Gagal mengaktifkan lisensi'
    })
  }
})
