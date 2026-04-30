import { request } from '@/utils/request'
import type {
  AuthData, RecordsData, StatisticsData,
  SyncPullData, SyncPushData, PoopRecord, Baby
} from '@/types'

export const api = {
  // Auth
  login(password: string) {
    return request<AuthData>({ url: '/api/v1/auth/login', method: 'POST', data: { password } })
  },
  verify() {
    return request<{ valid: boolean }>({ url: '/api/v1/auth/verify', method: 'POST' })
  },

  // Records
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

  // Babies
  getBabies() {
    return request<Baby[]>({ url: '/api/v1/babies' })
  },
  createBaby(data: { name: string; birthdate: number; gender?: string }) {
    return request<Baby>({ url: '/api/v1/babies', method: 'POST', data })
  },
  updateBaby(id: number, data: any) {
    return request<Baby>({ url: `/api/v1/babies/${id}`, method: 'PUT', data })
  },

  // Sync
  syncPull(lastSyncTime: number) {
    return request<SyncPullData>({ url: '/api/v1/sync/pull', method: 'POST', data: { lastSyncTime } })
  },
  syncPush(records: any[]) {
    return request<SyncPushData>({ url: '/api/v1/sync/push', method: 'POST', data: { records } })
  },

  // Statistics
  getStatistics(babyId: number, days: number) {
    return request<StatisticsData>({ url: `/api/v1/statistics/summary?baby_id=${babyId}&days=${days}` })
  },

  // Export
  getExportUrl(format: 'json' | 'csv') {
    const token = uni.getStorageSync('babypoop-token')
    const serverUrl = uni.getStorageSync('babypoop-server-url')
    return `${serverUrl}/api/v1/export/${format}?token=${token}`
  }
}
