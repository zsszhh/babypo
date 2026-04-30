import { defineStore } from 'pinia'
import { ref } from 'vue'

export type FontSizeLevel = 'small' | 'medium' | 'large'

export const FONT_SCALES: Record<FontSizeLevel, number> = {
  small: 0.875,
  medium: 1,
  large: 1.125
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
    paths: ['fontScale', 'fontLevel', 'darkMode']
  }
})
