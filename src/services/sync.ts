import { api } from './api'
import { useSyncStore } from '@/stores/sync'
import { useRecordStore } from '@/stores/record'
import { useAuthStore } from '@/stores/auth'

let timer: ReturnType<typeof setInterval> | null = null

export const syncService = {
  startAutoSync() {
    if (timer) return
    timer = setInterval(() => { syncService.sync() }, 30000)
  },

  stopAutoSync() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  },

  async sync() {
    const syncStore = useSyncStore()
    const recordStore = useRecordStore()
    const authStore = useAuthStore()

    if (!authStore.token) {
      syncStore.setStatus('offline')
      return
    }

    syncStore.setStatus('syncing')

    try {
      await pushLocalChanges()
      await pullServerChanges()

      syncStore.setStatus('synced')
      syncStore.setLastSyncTime(Date.now())
    } catch (error: any) {
      syncStore.setStatus('error')
      syncStore.setError(error.message || '同步失败')
    }
  }
}

async function pushLocalChanges() {
  const recordStore = useRecordStore()
  const unsynced = recordStore.localRecords.filter(r => !r.id)

  if (unsynced.length === 0) return

  const res = await api.syncPush(unsynced.map(r => ({
    localId: r.localId,
    babyId: r.babyId,
    timestamp: r.timestamp,
    type: r.type,
    color: r.color,
    amount: r.amount,
    note: r.note,
    operatorName: r.operatorName,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  })))

  for (const m of res.data.mapping) {
    recordStore.markLocalSynced(m.localId, m.serverId)
  }
}

async function pullServerChanges() {
  const syncStore = useSyncStore()
  const recordStore = useRecordStore()

  const res = await api.syncPull(syncStore.lastSyncTime || 0)
  recordStore.mergeServerRecords(res.data.records, res.data.deletedIds)
}

export function generateLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
