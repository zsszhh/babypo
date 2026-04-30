import { request, cachedServerUrl, cachedToken } from '@/utils/request'
import type {
  AuthData, RecordsData, StatisticsData,
  SyncPullData, SyncPushData, PoopRecord, Baby
} from '@/types'

export const api = {
  login(password: string) {
    return request<AuthData>({ url: '/api/v1/auth/login', method: 'POST', data: { password } })
  },
  verify() {
    return request<{ valid: boolean }>({ url: '/api/v1/auth/verify', method: 'POST' })
  },

  getRecords(params: { baby_id?: number; limit?: number; offset?: number; start_date?: number; end_date?: number }) {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    return request<RecordsData>({ url: `/api/v1/records?${query}` })
  },
  createRecord(data: any) {
    return request<PoopRecord>({ url: '/api/v1/records', method: 'POST', data })
  },
  updateRecord(id: number, data: any) {
    return request({ url: `/api/v1/records/${id}`, method: 'PUT', data })
  },
  deleteRecord(id: number) {
    return request({ url: `/api/v1/records/${id}`, method: 'DELETE' })
  },

  getBabies() {
    return request<Baby[]>({ url: '/api/v1/babies' })
  },
  createBaby(data: { name: string; birthdate: number; gender?: string }) {
    return request<Baby>({ url: '/api/v1/babies', method: 'POST', data })
  },
  updateBaby(id: number, data: any) {
    return request<Baby>({ url: `/api/v1/babies/${id}`, method: 'PUT', data })
  },

  syncPull(lastSyncTime: number) {
    return request<SyncPullData>({ url: '/api/v1/sync/pull', method: 'POST', data: { lastSyncTime } })
  },
  syncPush(records: any[]) {
    return request<SyncPushData>({ url: '/api/v1/sync/push', method: 'POST', data: { records } })
  },

  getStatistics(babyId: number, days: number) {
    return request<StatisticsData>({ url: `/api/v1/statistics/summary?baby_id=${babyId}&days=${days}` })
  },

  /**
   * 生成导出文件下载 URL（App 端通过 uni.downloadFile 下载，需 token 参数）
   */
  getExportUrl(format: 'json' | 'csv', babyId?: number) {
    const token = cachedToken || uni.getStorageSync('babypoop-token')
    const serverUrl = cachedServerUrl || uni.getStorageSync('babypoop-server-url')
    let url = `${serverUrl}/api/v1/export/${format}?token=${token}`
    if (babyId) url += `&baby_id=${babyId}`
    return url
  }
}
