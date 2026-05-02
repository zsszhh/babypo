import { defineStore } from 'pinia'
import { ref } from 'vue'

export type FontSizeLevel = 'small' | 'medium' | 'large'

export const FONT_SCALES: Record<FontSizeLevel, number> = {
  small: 0.875,
  medium: 1,
  large: 1.125
}

// uni-app storage 适配器，兼容 App 端
const uniStorage = {
  getItem: (key: string) => uni.getStorageSync(key) || null,
  setItem: (key: string, value: string) => uni.setStorageSync(key, value),
  removeItem: (key: string) => uni.removeStorageSync(key)
}

export const useSettingsStore = defineStore('settings', () => {
  const fontScale = ref(1)
  const fontLevel = ref<FontSizeLevel>('medium')
  const darkMode = ref(false)

  function setFontSize(level: FontSizeLevel) {
    fontLevel.value = level
    fontScale.value = FONT_SCALES[level]
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
  }

  return { fontScale, fontLevel, darkMode, setFontSize, toggleDarkMode }
}, {
  persist: {
    key: 'babypoop-settings',
    paths: ['fontScale', 'fontLevel', 'darkMode'],
    storage: uniStorage
  }
})
