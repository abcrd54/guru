type SendActivationMessageInput = {
  licenseKey: string
  teacherName: string
  schoolName: string
  phone: string
}

type SendWhatsappPayload = {
  phone: string
  message: string
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, '')
}

function resolveFonnteTarget(phone: string) {
  const normalized = normalizePhone(phone)

  if (!normalized) {
    return { target: '', countryCode: '62' }
  }

  if (normalized.startsWith('62')) {
    return {
      target: normalized,
      countryCode: '0'
    }
  }

  if (normalized.startsWith('0')) {
    return {
      target: normalized,
      countryCode: '62'
    }
  }

  return {
    target: normalized,
    countryCode: '0'
  }
}

function extractProviderReason(parsed: unknown) {
  if (!parsed || typeof parsed !== 'object') {
    return ''
  }

  const record = parsed as Record<string, unknown>
  return String(record.reason || record.message || record.detail || record.msg || '')
}

function applyTemplate(template: string, variables: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] || '')
}

async function sendWhatsappPayload(input: SendWhatsappPayload) {
  const appSettings = await getAppSettings()
  const settings = appSettings.settings
  const { target, countryCode } = resolveFonnteTarget(input.phone)

  if (!settings.whatsappProviderUrl || !settings.whatsappProviderToken) {
    return {
      sent: false,
      reason: 'Konfigurasi Fonnte belum lengkap.',
      response: null
    }
  }

  if (!target) {
    return {
      sent: false,
      reason: 'Nomor WhatsApp kosong atau tidak valid.',
      response: null
    }
  }

  const payload = new URLSearchParams()
  payload.set('target', target)
  payload.set('message', input.message)
  payload.set('countryCode', countryCode)

  const response = await fetch(settings.whatsappProviderUrl, {
    method: 'POST',
    headers: {
      Authorization: settings.whatsappProviderToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: payload.toString()
  })

  const raw = await response.text()
  let parsed: unknown = raw

  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = raw
  }

  if (!response.ok) {
    return {
      sent: false,
      reason: `HTTP ${response.status}${extractProviderReason(parsed) ? ` - ${extractProviderReason(parsed)}` : ''}`,
      response: parsed
    }
  }

  const success =
    typeof parsed === 'object' &&
    parsed !== null &&
    ('status' in parsed ? Boolean((parsed as { status?: boolean }).status) : 'Status' in parsed ? Boolean((parsed as { Status?: boolean }).Status) : true)

  return {
    sent: success,
    reason: success ? '' : extractProviderReason(parsed),
    response: parsed
  }
}

export async function sendActivationWhatsapp(input: SendActivationMessageInput) {
  const appSettings = await getAppSettings()
  const settings = appSettings.settings

  if (!settings.whatsappProviderUrl || !settings.whatsappProviderToken) {
    return {
      sent: false,
      reason: 'Konfigurasi Fonnte belum lengkap.',
      response: null
    }
  }

  if (!settings.activationBaseUrl) {
    return {
      sent: false,
      reason: 'Activation base URL belum diatur.',
      response: null
    }
  }

  const activationUrl = `${settings.activationBaseUrl}/activate/${input.licenseKey}`
  const template =
    settings.whatsappTemplateActivation ||
    'Halo {{teacherName}}, license Anda untuk {{schoolName}} sudah dibuat.\n\nLicense: {{licenseKey}}\nAktivasi di: {{activationUrl}}'

  const message = applyTemplate(template, {
    teacherName: input.teacherName,
    schoolName: input.schoolName,
    licenseKey: input.licenseKey,
    activationUrl
  })
  
  const result = await sendWhatsappPayload({
    phone: input.phone,
    message
  })
  
  return {
    ...result,
    activationUrl
  }
}

export async function sendTestWhatsapp(input: { phone: string; message: string }) {
  return sendWhatsappPayload(input)
}
