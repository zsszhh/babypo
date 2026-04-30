import { ref, onUnmounted } from 'vue'

// 粒子颜色配置
const PARTICLE_COLORS = [
  '#FF6B6B', // 红
  '#FECA57', // 黄
  '#48DBFB', // 蓝
  '#FF9FF3', // 粉
  '#1DD1A1', // 绿
  '#5F27CD', // 紫
  '#FF9F43', // 橙
]

// 星星表情
const STAR_EMOJIS = ['✨', '⭐', '🌟', '💫', '✅', '🎉']

interface ParticleOptions {
  x: number
  y: number
  count?: number
  type?: 'particle' | 'confetti' | 'stars'
}

/**
 * 保存特效组合式函数
 */
export function useSaveEffect() {
  const particles = ref<Array<{ id: number; style: Record<string, string>; type: string }>>([])
  const isShowingEffect = ref(false)
  let particleId = 0

  /**
   * 创建粒子烟花效果
   */
  function createParticles(x: number, y: number, count = 12) {
    const newParticles: typeof particles.value = []

    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i + Math.random() * 30
      const distance = 60 + Math.random() * 80
      const tx = Math.cos((angle * Math.PI) / 180) * distance
      const ty = Math.sin((angle * Math.PI) / 180) * distance
      const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]

      newParticles.push({
        id: particleId++,
        type: 'particle',
        style: {
          left: `${x}px`,
          top: `${y}px`,
          backgroundColor: color,
          '--tx': `${tx}px`,
          '--ty': `${ty}px`,
        }
      })
    }

    particles.value = [...particles.value, ...newParticles]
    cleanupParticles()
  }

  /**
   * 创建彩带效果
   */
  function createConfetti(x: number, y: number, count = 15) {
    const newParticles: typeof particles.value = []

    for (let i = 0; i < count; i++) {
      const tx = (Math.random() - 0.5) * 200
      const ty = -80 - Math.random() * 120
      const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
      const rot = Math.random() * 720 - 360

      newParticles.push({
        id: particleId++,
        type: 'confetti',
        style: {
          left: `${x + (Math.random() - 0.5) * 60}px`,
          top: `${y}px`,
          backgroundColor: color,
          '--tx': `${tx}px`,
          '--ty': `${ty}px`,
          '--rot': `${rot}deg`,
        }
      })
    }

    particles.value = [...particles.value, ...newParticles]
    cleanupParticles()
  }

  /**
   * 创建星星闪烁效果
   */
  function createStars(x: number, y: number, count = 6) {
    const newParticles: typeof particles.value = []

    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i
      const distance = 40 + Math.random() * 30
      const tx = Math.cos((angle * Math.PI) / 180) * distance
      const ty = Math.sin((angle * Math.PI) / 180) * distance
      const star = STAR_EMOJIS[Math.floor(Math.random() * STAR_EMOJIS.length)]

      newParticles.push({
        id: particleId++,
        type: 'star',
        style: {
          left: `${x + tx}px`,
          top: `${y + ty}px`,
          content: star,
        }
      })
    }

    particles.value = [...particles.value, ...newParticles]
    cleanupParticles()
  }

  /**
   * 清理已完成的粒子
   */
  function cleanupParticles() {
    setTimeout(() => {
      particles.value = particles.value.filter(p => p.id > particleId - 100)
    }, 1000)
  }

  /**
   * 触发完整保存特效
   */
  function triggerSaveEffect(event: MouseEvent | TouchEvent, options?: { type?: 'full' | 'simple' }) {
    const type = options?.type || 'full'
    let x: number, y: number

    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0]
      x = touch.clientX
      y = touch.clientY
    } else {
      x = event.clientX
      y = event.clientY
    }

    isShowingEffect.value = true

    // 创建粒子
    createParticles(x, y, type === 'full' ? 16 : 8)

    // 创建彩带
    if (type === 'full') {
      setTimeout(() => createConfetti(x, y, 12), 50)
      setTimeout(() => createStars(x, y, 6), 100)
    }

    setTimeout(() => {
      isShowingEffect.value = false
    }, 800)
  }

  /**
   * 获取按钮中心坐标
   */
  function getButtonCenter(buttonEl: HTMLElement): { x: number; y: number } {
    const rect = buttonEl.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    particles.value = []
  })

  return {
    particles,
    isShowingEffect,
    triggerSaveEffect,
    createParticles,
    createConfetti,
    createStars,
    getButtonCenter,
  }
}

/**
 * 涟漪效果
 */
export function useRipple() {
  const ripples = ref<Array<{ id: number; x: number; y: number }>>([])
  let rippleId = 0

  function createRipple(event: MouseEvent | TouchEvent, containerRect?: DOMRect) {
    let x: number, y: number

    if ('touches' in event) {
      const touch = event.touches[0] || event.changedTouches[0]
      x = touch.clientX
      y = touch.clientY
    } else {
      x = event.clientX
      y = event.clientY
    }

    // 如果提供了容器矩形，转换为相对坐标
    if (containerRect) {
      x = x - containerRect.left
      y = y - containerRect.top
    }

    ripples.value.push({ id: rippleId++, x, y })

    // 清理已完成的涟漪
    setTimeout(() => {
      ripples.value = ripples.value.filter(r => r.id < rippleId - 5)
    }, 600)
  }

  return {
    ripples,
    createRipple,
  }
}
