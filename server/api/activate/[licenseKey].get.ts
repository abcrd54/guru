export default defineEventHandler(async (event) => {
  const licenseKey = getRouterParam(event, 'licenseKey')
  
  if (!licenseKey) {
    throw createError({
      statusCode: 400,
      message: 'License key is required'
    })
  }

  try {
    const license = await getLicenseByKey(licenseKey)
    
    if (!license) {
      return {
        success: false,
        message: 'Lisensi tidak ditemukan. Pastikan kode lisensi Anda benar.'
      }
    }

    return {
      success: true,
      license
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Gagal memuat data lisensi'
    })
  }
})
