export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  // 支持局域网 IP 和域名，兼容 uni-app App 端（无 URL API）
  const pattern = /^https?:\/\/[\w.-]+(:\d+)?(\/.*)?$/i
  return pattern.test(url.trim())
}

export function isNotEmpty(val: unknown): boolean {
  return val !== null && val !== undefined && val !== ''
}
