import type { ApiResponse } from '@/types'

interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

const AUTH_STORAGE_KEY = 'babypoop-auth'

let cachedServerUrl = ''
let cachedToken = ''

export { cachedServerUrl, cachedToken }

/**
 * 更新内存缓存（在登录/恢复会话时调用）
 */
export function updateRequestCache(serverUrl: string, token: string) {
  cachedServerUrl = serverUrl
  cachedToken = token
}

/**
 * 仅更新服务器地址缓存（登录前 serverUrl 已知但 token 还没有时使用）
 */
export function updateServerUrlCache(serverUrl: string) {
  cachedServerUrl = serverUrl
}

/**
 * 清除内存缓存（退出登录时调用）
 */
export function clearRequestCache() {
  cachedServerUrl = ''
  cachedToken = ''
}

/**
 * 从 Pinia persist Storage 中读取认证信息作为 fallback
 */
function readAuthFromStorage(): { serverUrl: string; token: string } {
  try {
    const raw = uni.getStorageSync(AUTH_STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return { serverUrl: data.serverUrl || '', token: data.token || '' }
    }
  } catch { /* ignore */ }
  return { serverUrl: '', token: '' }
}

/**
 * 发起 HTTP 请求，自动附加服务器地址和认证 token
 */
export async function request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
  let serverUrl = cachedServerUrl
  let token = cachedToken

  if (!serverUrl) {
    const stored = readAuthFromStorage()
    serverUrl = stored.serverUrl
    token = stored.token
    if (serverUrl) {
      cachedServerUrl = serverUrl
      cachedToken = token
    }
  }

  if (!serverUrl) {
    throw new Error('未配置服务器地址')
  }

  try {
    const res: any = await uni.request({
      url: `${serverUrl}${config.url}`,
      method: config.method || 'GET',
      data: config.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...config.header
      }
    })

    if (res.errMsg && !res.errMsg.includes('ok')) {
      throw new Error('网络连接失败，请检查网络')
    }

    const { statusCode, data } = res

    if (statusCode === 401) {
      clearRequestCache()
      uni.reLaunch({ url: '/pages/config/index' })
      throw new Error('连接已失效，请重新连接服务器')
    }

    if (statusCode >= 400) {
      throw new Error(data.message || '请求失败')
    }

    return data as ApiResponse<T>
  } catch (error: any) {
    throw error
  }
}
