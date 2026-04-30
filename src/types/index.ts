/** 布里斯托分类 */
export type PoopType = 'type1' | 'type2' | 'type3' | 'type4' | 'type5' | 'type6' | 'type7'

/** 颜色 */
export type PoopColor = 'yellow' | 'green' | 'brown' | 'black' | 'red'

/** 排便量 */
export type PoopAmount = 'small' | 'medium' | 'large'

/** 排便记录 */
export interface PoopRecord {
  id: number
  babyId: number
  timestamp: number
  type: PoopType
  color?: PoopColor | null
  amount?: PoopAmount | null
  note?: string | null
  operatorName: string
  createdAt: number
  updatedAt: number
}

/** 本地记录（离线使用） */
export interface LocalRecord {
  localId: string
  id?: number
  babyId: number
  timestamp: number
  type: PoopType
  color?: PoopColor | null
  amount?: PoopAmount | null
  note?: string | null
  operatorName: string
  createdAt: number
  updatedAt: number
  isDeleted: boolean
}

/** 宝宝信息 */
export interface Baby {
  id: number
  name: string
  birthdate: number
  gender?: 'male' | 'female' | null
  createdAt: number
  updatedAt: number
}

/** 同步状态 */
export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

/** API 统一响应 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

/** 认证响应 */
export interface AuthData {
  token: string
  expiresIn: number
}

/** 记录列表响应 */
export interface RecordsData {
  records: PoopRecord[]
  total: number
}

/** 同步拉取响应 */
export interface SyncPullData {
  records: PoopRecord[]
  deletedIds: number[]
  serverTime: number
}

/** 同步推送响应 */
export interface SyncPushData {
  mapping: { localId: string; serverId: number }[]
}

/** 统计摘要 */
export interface StatisticsData {
  totalCount: number
  avgPerDay: number
  typeDistribution: Record<string, number>
  colorDistribution: Record<string, number>
}

/** 用户设置 */
export interface AppSettings {
  fontScale: number
  darkMode: boolean
}
