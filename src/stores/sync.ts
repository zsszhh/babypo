import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SyncStatus } from '@/types'

export const useSyncStore = defineStore('sync', () => {
  const status = ref<SyncStatus>('offline')
  const lastSyncTime = ref(0)
  const errorMessage = ref('')

  function setStatus(s: SyncStatus) {
    status.value = s
  }

  function setLastSyncTime(t: number) {
    lastSyncTime.value = t
  }

  function setError(msg: string) {
    errorMessage.value = msg
  }

  return { status, lastSyncTime, errorMessage, setStatus, setLastSyncTime, setError }
})
