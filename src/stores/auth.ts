import { defineStore } from 'pinia'
import { ref } from 'vue'
import { request } from '@/utils/request'
import { STORAGE_KEYS } from '@/constants'
import type { AuthData } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const serverUrl = ref('')
  const operatorName = ref('')

  async function login(password: string) {
    const res = await request<AuthData>({
      url: '/api/v1/auth/login',
      method: 'POST',
      data: { password }
    })

    token.value = res.data.token
    serverUrl.value = serverUrl.value // 保持当前值
    // 立即持久化到本地存储
    uni.setStorageSync(STORAGE_KEYS.TOKEN, res.data.token)
    uni.setStorageSync(STORAGE_KEYS.SERVER_URL, serverUrl.value)
    uni.setStorageSync(STORAGE_KEYS.OPERATOR_NAME, operatorName.value)
    console.log('登录成功，已保存 token:', res.data.token?.substring(0, 10) + '...')
  }

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

  function restoreSession(): boolean {
    const savedToken = uni.getStorageSync(STORAGE_KEYS.TOKEN)
    const savedUrl = uni.getStorageSync(STORAGE_KEYS.SERVER_URL)
    const savedName = uni.getStorageSync(STORAGE_KEYS.OPERATOR_NAME)

    console.log('恢复 session - token:', savedToken?.substring(0, 10) + '...', 'url:', savedUrl, 'name:', savedName)

    if (savedToken && savedUrl && savedName) {
      token.value = savedToken
      serverUrl.value = savedUrl
      operatorName.value = savedName
      return true
    }
    return false
  }

  function logout() {
    token.value = ''
    serverUrl.value = ''
    operatorName.value = ''
    uni.removeStorageSync(STORAGE_KEYS.TOKEN)
    uni.removeStorageSync(STORAGE_KEYS.SERVER_URL)
    uni.removeStorageSync(STORAGE_KEYS.OPERATOR_NAME)
  }

  return { token, serverUrl, operatorName, login, verifyToken, restoreSession, logout }
})
