export function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export function buildActivationUrl(baseUrl: string, licenseKey: string) {
  const normalized = normalizeBaseUrl(baseUrl);
  if (!normalized) {
    return "";
  }

  if (normalized.endsWith("/activate")) {
    return `${normalized}/${encodeURIComponent(licenseKey)}`;
  }

  return `${normalized}/activate/${encodeURIComponent(licenseKey)}`;
}
