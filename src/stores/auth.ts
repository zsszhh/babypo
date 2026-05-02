import { defineStore } from 'pinia'
import { ref } from 'vue'
import { request } from '@/utils/request'
import { STORAGE_KEYS } from '@/constants'
import type { AuthData } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const serverUrl = ref('')
  const operatorName = ref('')

  /**
   * 使用密码登录服务器
   */
  async function login(password: string) {
    const res = await request<AuthData>({
      url: '/api/v1/auth/login',
      method: 'POST',
      data: { password }
    })

    token.value = res.data.token
  }

  /**
   * 验证当前 token 是否有效
   */
  async function verifyToken(): Promise<boolean> {
    try {
      const res = await request<{ valid: boolean }>({
        url: '/api/v1/auth/verify',
        method: 'POST'
      })
      return res.data.valid
    } catch {
      return false
    }
  }

  /**
   * 判断当前是否已登录（Pinia persist 自动恢复，无需手动读 Storage）
   */
  function isLoggedIn(): boolean {
    return !!(token.value && serverUrl.value && operatorName.value)
  }

  /**
   * 退出登录，清除所有认证信息（包括旧版 Storage key 兼容清理）
   */
  function logout() {
    token.value = ''
    serverUrl.value = ''
    operatorName.value = ''

    uni.removeStorageSync(STORAGE_KEYS.TOKEN)
    uni.removeStorageSync(STORAGE_KEYS.SERVER_URL)
    uni.removeStorageSync(STORAGE_KEYS.OPERATOR_NAME)
    uni.removeStorageSync(STORAGE_KEYS.LAST_SYNC)
    uni.removeStorageSync('babypoop-auth')
  }

  return { token, serverUrl, operatorName, login, verifyToken, isLoggedIn, logout }
}, {
  persist: {
    key: 'babypoop-auth',
    paths: ['token', 'serverUrl', 'operatorName'],
    // 使用 uni-app 的 storage API，兼容 App 端
    storage: {
      getItem: (key: string) => {
        const value = uni.getStorageSync(key)
        return value || null
      },
      setItem: (key: string, value: string) => {
        uni.setStorageSync(key, value)
      },
      removeItem: (key: string) => {
        uni.removeStorageSync(key)
      }
    }
  }
})
