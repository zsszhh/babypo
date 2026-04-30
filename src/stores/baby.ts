import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { request } from '@/utils/request'
import type { Baby } from '@/types'

export const useBabyStore = defineStore('baby', () => {
  const babies = ref<Baby[]>([])
  const activeBabyId = ref(1)

  const activeBaby = computed(() => {
    return babies.value.find(b => b.id === activeBabyId.value)
  })

  async function fetchBabies() {
    const res = await request<Baby[]>({ url: '/api/v1/babies' })
    babies.value = res.data
  }

  async function createBaby(name: string, birthdate: number, gender?: string) {
    const res = await request<Baby>({
      url: '/api/v1/babies',
      method: 'POST',
      data: { name, birthdate, gender }
    })
    babies.value.push(res.data)
    return res.data
  }

  async function updateBaby(id: number, data: Partial<Baby>) {
    await request<Baby>({
      url: `/api/v1/babies/${id}`,
      method: 'PUT',
      data
    })
    const idx = babies.value.findIndex(b => b.id === id)
    if (idx >= 0) {
      Object.assign(babies.value[idx], data)
    }
  }

  function setActiveBaby(id: number) {
    activeBabyId.value = id
  }

  return { babies, activeBabyId, activeBaby, fetchBabies, createBaby, updateBaby, setActiveBaby }
})
