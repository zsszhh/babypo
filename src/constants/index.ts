import type { PoopType, PoopColor, PoopAmount } from '@/types'

/** 布里斯托大便分类法 */
export const POOP_TYPES: Record<PoopType, { name: string; description: string; icon: string }> = {
  type1: { name: '硬球状', description: '颗粒状，难以排出', icon: '/static/images/poop-type1.png' },
  type2: { name: '条状凹凸', description: '表面凹凸不平', icon: '/static/images/poop-type2.png' },
  type3: { name: '条状裂纹', description: '表面有裂纹', icon: '/static/images/poop-type3.png' },
  type4: { name: '条状光滑', description: '柔软光滑，理想状态', icon: '/static/images/poop-type4.png' },
  type5: { name: '软团状', description: '边缘清晰', icon: '/static/images/poop-type5.png' },
  type6: { name: '糊状', description: '蓬松边缘不齐', icon: '/static/images/poop-type6.png' },
  type7: { name: '水样', description: '完全液体', icon: '/static/images/poop-type7.png' }
}

export const POOP_TYPE_LIST: PoopType[] = ['type1', 'type2', 'type3', 'type4', 'type5', 'type6', 'type7']

export const POOP_COLORS: Record<PoopColor, { name: string; color: string }> = {
  yellow: { name: '黄色', color: '#FFD700' },
  green: { name: '绿色', color: '#65A30D' },
  brown: { name: '棕色', color: '#8B5E3C' },
  black: { name: '黑色', color: '#1C1917' },
  red: { name: '红色', color: '#EF4444' }
}

export const POOP_COLOR_LIST: PoopColor[] = ['yellow', 'green', 'brown', 'black', 'red']

export const POOP_AMOUNTS: Record<PoopAmount, { name: string }> = {
  small: { name: '少量' },
  medium: { name: '中等' },
  large: { name: '大量' }
}

export const POOP_AMOUNT_LIST: PoopAmount[] = ['small', 'medium', 'large']

/** 存储 Key 常量 */
export const STORAGE_KEYS = {
  TOKEN: 'babypoop-token',
  SERVER_URL: 'babypoop-server-url',
  OPERATOR_NAME: 'babypoop-operator-name',
  LAST_SYNC: 'babypoop-last-sync'
} as const
