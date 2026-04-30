import { STORAGE_KEYS } from '@/constants'
import type { ApiResponse } from '@/types'

interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

export async function request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
  const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
  const serverUrl = uni.getStorageSync(STORAGE_KEYS.SERVER_URL)

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
      uni.removeStorageSync(STORAGE_KEYS.TOKEN)
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
