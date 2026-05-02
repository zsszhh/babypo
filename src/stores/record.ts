import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { request } from '@/utils/request'
import { formatDate, getMonthStart, getMonthEnd, getStartOfDay, getEndOfDay } from '@/utils/date'
import type { PoopRecord, LocalRecord, RecordsData } from '@/types'

export const useRecordStore = defineStore('record', () => {
  const records = ref<PoopRecord[]>([])
  const localRecords = ref<LocalRecord[]>([])
  const loading = ref(false)
  const hasMore = ref(true)
  const totalCount = ref(0)
  const loadedMonths = ref<Set<string>>(new Set())

  const sortedRecords = computed(() => {
    const all = [
      ...records.value.map(r => ({ ...r, _isLocal: false })),
      ...localRecords.value.filter(r => !r.isDeleted).map(r => ({ ...r, _isLocal: true as const }))
    ]
    all.sort((a, b) => b.timestamp - a.timestamp)
    return all
  })

  const groupedByDate = computed(() => {
    const groups: Record<string, any[]> = {}
    for (const record of sortedRecords.value) {
      const key = formatDate(record.timestamp, 'YYYY-MM-DD')
      if (!groups[key]) groups[key] = []
      groups[key].push(record)
    }
    return groups
  })

  async function fetchRecords(babyId: number, opts?: { offset?: number; limit?: number; append?: boolean }) {
    loading.value = true
    const limit = opts?.limit ?? 200
    const offset = opts?.offset ?? 0
    const append = opts?.append ?? false
    try {
      const res = await request<RecordsData>({
        url: `/api/v1/records?baby_id=${babyId}&limit=${limit}&offset=${offset}`
      })
      if (append) {
        const existingIds = new Set(records.value.map(r => r.id))
        for (const sr of res.data.records) {
          if (!existingIds.has(sr.id)) {
            records.value.push(sr)
          }
        }
      } else {
        records.value = res.data.records
      }
      totalCount.value = res.data.total ?? res.data.records.length
      hasMore.value = records.value.length < totalCount.value
    } finally {
      loading.value = false
    }
  }

  async function addRecord(data: {
    babyId: number
    timestamp: number
    type: string
    color?: string | null
    amount?: string | null
    note?: string | null
    operatorName: string
  }) {
    const res = await request<PoopRecord>({
      url: '/api/v1/records',
      method: 'POST',
      data
    })
    records.value.unshift(res.data)
    return res.data
  }

  async function updateRecord(id: number, data: Partial<PoopRecord>) {
    await request({
      url: `/api/v1/records/${id}`,
      method: 'PUT',
      data
    })
    const idx = records.value.findIndex(r => r.id === id)
    if (idx >= 0) {
      Object.assign(records.value[idx], data, { updatedAt: Date.now() })
    }
  }

  async function deleteRecord(id: number) {
    await request({
      url: `/api/v1/records/${id}`,
      method: 'DELETE'
    })
    records.value = records.value.filter(r => r.id !== id)
  }

  function addLocalRecord(record: LocalRecord) {
    localRecords.value.push(record)
  }

  function removeLocalRecord(localId: string) {
    localRecords.value = localRecords.value.filter(r => r.localId !== localId)
  }

  function markLocalSynced(localId: string, serverId: number) {
    const idx = localRecords.value.findIndex(r => r.localId === localId)
    if (idx >= 0) {
      const synced = { ...localRecords.value[idx], id: serverId }
      localRecords.value.splice(idx, 1)
      records.value.unshift(synced as any)
    }
  }

  function mergeServerRecords(serverRecords: PoopRecord[], deletedIds: number[]) {
    for (const sr of serverRecords) {
      const idx = records.value.findIndex(r => r.id === sr.id)
      if (idx >= 0) {
        if (sr.updatedAt > records.value[idx].updatedAt) {
          records.value[idx] = sr
        }
      } else {
        records.value.unshift(sr)
      }
    }

    if (deletedIds.length > 0) {
      records.value = records.value.filter(r => !deletedIds.includes(r.id))
    }
  }

  /**
   * 按时间范围加载记录
   */
  async function fetchRecordsByRange(babyId: number, startDate: number, endDate: number) {
    loading.value = true
    try {
      const res = await request<RecordsData>({
        url: `/api/v1/records?baby_id=${babyId}&start_date=${startDate}&end_date=${endDate}&limit=1000`
      })
      // 合并记录，去重
      const existingIds = new Set(records.value.map(r => r.id))
      for (const sr of res.data.records) {
        if (!existingIds.has(sr.id)) {
          records.value.push(sr)
        }
      }
      return res.data.records
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载指定月份的记录（带缓存）
   */
  async function fetchMonthRecords(babyId: number, year: number, month: number) {
    const cacheKey = `${year}-${month}`
    if (loadedMonths.value.has(cacheKey)) {
      return records.value.filter(r => {
        const d = new Date(r.timestamp)
        return d.getFullYear() === year && d.getMonth() === month - 1
      })
    }

    const startDate = getMonthStart(year, month)
    const endDate = getMonthEnd(year, month)
    await fetchRecordsByRange(babyId, startDate, endDate)
    loadedMonths.value.add(cacheKey)
  }

  /**
   * 获取指定日期的记录
   */
  function getRecordsByDate(date: Date): PoopRecord[] {
    const start = getStartOfDay(date)
    const end = getEndOfDay(date)
    return records.value.filter(r => r.timestamp >= start && r.timestamp <= end)
  }

  /**
   * 获取指定月份的记录统计（用于年历视图）
   */
  function getMonthStats(year: number, month: number): { count: number; dates: number[] } {
    const startDate = getMonthStart(year, month)
    const endDate = getMonthEnd(year, month)
    const monthRecords = records.value.filter(r => r.timestamp >= startDate && r.timestamp <= endDate)

    const datesSet = new Set<number>()
    monthRecords.forEach(r => {
      const d = new Date(r.timestamp)
      datesSet.add(d.getDate())
    })

    return {
      count: monthRecords.length,
      dates: Array.from(datesSet)
    }
  }

  /**
   * 清除月份缓存（用于刷新数据）
   */
  function clearMonthCache(year?: number, month?: number) {
    if (year && month) {
      loadedMonths.value.delete(`${year}-${month}`)
    } else {
      loadedMonths.value.clear()
    }
  }

  return {
    records, localRecords, loading, hasMore, totalCount, loadedMonths,
    sortedRecords, groupedByDate,
    fetchRecords, fetchRecordsByRange, fetchMonthRecords, getRecordsByDate, getMonthStats,
    addRecord, updateRecord, deleteRecord,
    addLocalRecord, removeLocalRecord, markLocalSynced, mergeServerRecords,
    clearMonthCache
  }
}, {
  persist: {
    key: 'babypoop-records',
    paths: ['records', 'localRecords'],
    // 使用 uni-app 的 storage API，兼容 App 端
    storage: {
      getItem: (key: string) => uni.getStorageSync(key) || null,
      setItem: (key: string, value: string) => uni.setStorageSync(key, value),
      removeItem: (key: string) => uni.removeStorageSync(key)
    }
  }
})
