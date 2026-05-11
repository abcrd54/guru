export default defineEventHandler(async (event) => {
  const licenseKey = getRouterParam(event, 'licenseKey')
  
  if (!licenseKey) {
    throw createError({
      statusCode: 400,
      message: 'License key is required'
    })
  }

  try {
    const teacher = await getTeacherByLicenseKey(licenseKey)
    
    if (!teacher) {
      return {
        success: false,
        message: 'Data tidak ditemukan. Pastikan lisensi Anda sudah diaktifkan.'
      }
    }

    return {
      success: true,
      teacher
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Gagal memuat data'
    })
  }
})
