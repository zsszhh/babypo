# 宝宝排便记录 App 开发文档

**文档版本**：v2.0
**目标受众**：AI 代码助手
**开发模式**：前后端分离
**核心要求**：精确、可直接生成代码、无歧义、符合最佳实践

---

## 一、项目核心定义

### 1.1 项目名称

BabyPoopTracker

### 1.2 核心功能

- 家庭成员通过输入服务器地址和共享密码连接到同一个后端
- 记录宝宝排便信息（时间、性状、颜色、排便量、备注）
- 所有设备实时同步数据
- 查看历史记录时间线
- 简单的数据统计
- 数据导出功能

### 1.3 非功能需求

- 离线可用（无网络时本地存储，联网后自动同步）
- 老人也能快速上手（大按钮、简洁界面、可调节字体大小）
- 数据完全自托管（不依赖任何第三方云服务）
- 多端适配（微信小程序、H5、Android/iOS App）
- 部署简单（Docker 一键部署）

### 1.4 用户角色

| 角色 | 说明 |
|------|------|
| 操作人 | 记录添加者，用昵称区分家庭成员 |

---

## 二、技术栈规范

### 2.1 前端（uniapp + Vue 3 + TypeScript）

```json
// package.json 核心依赖
{
  "name": "babypoop-tracker",
  "version": "1.0.0",
  "scripts": {
    "dev:mp-weixin": "uni -p mp-weixin",
    "dev:h5": "uni",
    "dev:app": "uni -p app",
    "build:mp-weixin": "uni build -p mp-weixin",
    "build:h5": "uni build",
    "build:app": "uni build -p app"
  },
  "dependencies": {
    "@dcloudio/uni-app": "3.0.0-4010520250114001",
    "@dcloudio/uni-app-plus": "3.0.0-4010520250114001",
    "@dcloudio/uni-components": "3.0.0-4010520250114001",
    "@dcloudio/uni-h5": "3.0.0-4010520250114001",
    "@dcloudio/uni-mp-weixin": "3.0.0-4010520250114001",
    "vue": "^3.4.21",
    "pinia": "^2.1.7",
    "pinia-plugin-persistedstate": "^3.2.1",
    "lodash-es": "^4.17.21",
    "dayjs": "^1.11.10"
  },
  "devDependencies": {
    "@dcloudio/types": "^3.4.8",
    "@dcloudio/uni-automator": "3.0.0-4010520250114001",
    "@dcloudio/uni-cli-shared": "3.0.0-4010520250114001",
    "@dcloudio/uni-stacktracey": "3.0.0-4010520250114001",
    "@dcloudio/vite-plugin-uni": "3.0.0-4010520250114001",
    "typescript": "^5.4.5",
    "vite": "^5.2.8"
  }
}
```

### 2.2 后端（Node.js）

```json
// package.json 核心依赖
{
  "name": "babypoop-tracker-server",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "better-sqlite3": "^11.0.0",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.4.5",
    "archiver": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

### 2.3 命名规范

| 层级 | 命名风格 | 示例 |
|------|----------|------|
| 后端 JavaScript | camelCase | `getRecords`, `createRecord` |
| 前端 TypeScript/Vue | camelCase | `fetchRecords`, `addRecord` |
| Vue 组件 | PascalCase | `RecordItem.vue`, `TypeSelector.vue` |
| 数据库 | snake_case | `poop_records`, `operator_name` |
| API 端点 | kebab-case | `/api/v1/records` |
| CSS 类名 | kebab-case | `.record-item`, `.btn-primary` |

---

## 三、后端 API 规范

### 3.1 基础信息

- **基础 URL**：`http://<server-ip>:3000/api/v1`
- **数据格式**：JSON
- **认证方式**：Header 携带 `Authorization: Bearer <token>`

**响应状态码**：

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/密码错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

**统一响应格式**：

```typescript
// 成功响应
{
  "success": true,
  "data": T,
  "message": "操作成功"
}

// 失败响应
{
  "success": false,
  "message": "错误描述"
}
```

### 3.2 认证接口

#### POST /auth/login

验证家庭密码，获取 JWT 令牌

**请求体**：

```json
{
  "password": "string"
}
```

**成功响应 (200)**：

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 31536000
  }
}
```

**失败响应 (401)**：

```json
{
  "success": false,
  "message": "密码错误"
}
```

#### POST /auth/verify

验证当前 token 是否有效

**成功响应 (200)**：

```json
{
  "success": true,
  "data": {
    "valid": true
  }
}
```

### 3.3 记录接口

#### GET /records

获取排便记录列表

**查询参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| baby_id | number | 否 | 1 | 宝宝 ID |
| limit | number | 否 | 100 | 返回数量 |
| offset | number | 否 | 0 | 偏移量 |
| start_date | number | 否 | - | 开始时间戳（毫秒） |
| end_date | number | 否 | - | 结束时间戳（毫秒） |

**成功响应 (200)**：

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 1,
        "babyId": 1,
        "timestamp": 1714204800000,
        "type": "type4",
        "color": "yellow",
        "amount": "medium",
        "note": "今天吃了胡萝卜泥",
        "operatorName": "妈妈",
        "createdAt": 1714204800000,
        "updatedAt": 1714204800000
      }
    ],
    "total": 42
  }
}
```

#### GET /records/:id

获取单条记录详情

**成功响应 (200)**：

```json
{
  "success": true,
  "data": {
    "id": 1,
    "babyId": 1,
    "timestamp": 1714204800000,
    "type": "type4",
    "color": "yellow",
    "amount": "medium",
    "note": "今天吃了胡萝卜泥",
    "operatorName": "妈妈",
    "createdAt": 1714204800000,
    "updatedAt": 1714204800000
  }
}
```

#### POST /records

创建新记录

**请求体**：

```json
{
  "babyId": 1,
  "timestamp": 1714204800000,
  "type": "type4",
  "color": "yellow",
  "amount": "medium",
  "note": "今天吃了胡萝卜泥",
  "operatorName": "妈妈"
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| babyId | number | 是 | 宝宝 ID，默认传 1 |
| timestamp | number | 是 | 排便时间戳（毫秒） |
| type | string | 是 | 布里斯托分类：type1-type7 |
| color | string | 否 | 颜色：yellow/green/brown/black/red |
| amount | string | 否 | 排便量：small/medium/large |
| note | string | 否 | 备注信息 |
| operatorName | string | 是 | 操作人昵称 |

**成功响应 (201)**：

```json
{
  "success": true,
  "data": {
    "id": 43,
    "babyId": 1,
    "timestamp": 1714204800000,
    "type": "type4",
    "color": "yellow",
    "amount": "medium",
    "note": "今天吃了胡萝卜泥",
    "operatorName": "妈妈",
    "createdAt": 1714204800000,
    "updatedAt": 1714204800000
  }
}
```

#### PUT /records/:id

更新记录

**请求体**：同 POST /records

**成功响应 (200)**：

```json
{
  "success": true,
  "message": "记录更新成功"
}
```

#### DELETE /records/:id

删除记录（软删除）

**成功响应 (200)**：

```json
{
  "success": true,
  "message": "记录删除成功"
}
```

### 3.4 同步接口

#### POST /sync/pull

拉取服务器最新数据

**请求体**：

```json
{
  "lastSyncTime": 1714204800000
}
```

**成功响应 (200)**：

```json
{
  "success": true,
  "data": {
    "records": [/* 新增或更新的记录 */],
    "deletedIds": [1, 2, 3],
    "serverTime": 1714291200000
  }
}
```

#### POST /sync/push

推送本地变更到服务器

**请求体**：

```json
{
  "records": [
    {
      "localId": "local_123",
      "babyId": 1,
      "timestamp": 1714204800000,
      "type": "type4",
      "color": "yellow",
      "amount": "medium",
      "note": "离线添加的记录",
      "operatorName": "爸爸",
      "createdAt": 1714204800000,
      "updatedAt": 1714204800000
    }
  ],
  "deletedLocalIds": ["local_124"]
}
```

**成功响应 (200)**：

```json
{
  "success": true,
  "data": {
    "mapping": [
      {
        "localId": "local_123",
        "serverId": 44
      }
    ]
  }
}
```

### 3.5 统计接口

#### GET /statistics/summary

获取统计摘要

**查询参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| baby_id | number | 否 | 1 | 宝宝 ID |
| days | number | 否 | 7 | 统计天数 |

**成功响应 (200)**：

```json
{
  "success": true,
  "data": {
    "totalCount": 14,
    "avgPerDay": 2.0,
    "typeDistribution": {
      "type1": 0,
      "type2": 1,
      "type3": 3,
      "type4": 8,
      "type5": 2,
      "type6": 0,
      "type7": 0
    },
    "colorDistribution": {
      "yellow": 10,
      "green": 2,
      "brown": 2
    }
  }
}
```

### 3.6 导出接口

#### GET /export/json

导出所有数据为 JSON 文件

**成功响应**：返回 JSON 文件下载

#### GET /export/csv

导出所有数据为 CSV 文件

**成功响应**：返回 CSV 文件下载

---

## 四、数据模型规范

### 4.1 后端数据库模型 (SQLite)

```sql
-- 宝宝信息表
CREATE TABLE IF NOT EXISTS babies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  birthdate INTEGER NOT NULL,
  gender TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 排便记录表
CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  baby_id INTEGER NOT NULL DEFAULT 1,
  timestamp INTEGER NOT NULL,
  type TEXT NOT NULL,
  color TEXT,
  amount TEXT,
  note TEXT,
  operator_name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (baby_id) REFERENCES babies(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_records_baby_id ON records(baby_id);
CREATE INDEX IF NOT EXISTS idx_records_timestamp ON records(timestamp);
CREATE INDEX IF NOT EXISTS idx_records_updated_at ON records(updated_at);

-- 默认插入一个宝宝
INSERT OR IGNORE INTO babies (id, name, birthdate, created_at, updated_at)
VALUES (1, '宝宝', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);
```

### 4.2 前端数据模型 (TypeScript)

```typescript
// types/record.ts

/** 排便记录 */
export interface PoopRecord {
  id: number
  babyId: number
  timestamp: number
  type: PoopType
  color?: PoopColor
  amount?: PoopAmount
  note?: string
  operatorName: string
  createdAt: number
  updatedAt: number
  isDeleted: boolean
}

/** 布里斯托分类 */
export type PoopType = 'type1' | 'type2' | 'type3' | 'type4' | 'type5' | 'type6' | 'type7'

/** 颜色 */
export type PoopColor = 'yellow' | 'green' | 'brown' | 'black' | 'red'

/** 排便量 */
export type PoopAmount = 'small' | 'medium' | 'large'

/** 宝宝信息 */
export interface Baby {
  id: number
  name: string
  birthdate: number
  gender?: 'male' | 'female'
  createdAt: number
  updatedAt: number
}

/** 同步状态 */
export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

/** 本地记录（离线使用） */
export interface LocalRecord extends Omit<PoopRecord, 'id'> {
  localId: string
  id?: number
  isLocal: boolean
}
```

### 4.3 布里斯托大便分类法定义

```typescript
// constants/poop-types.ts

export const POOP_TYPES: Record<PoopType, { name: string; description: string; icon: string }> = {
  type1: {
    name: '坚果状',
    description: '硬球状，难以排出',
    icon: '🪨'
  },
  type2: {
    name: '香肠状（凹凸）',
    description: '表面凹凸不平',
    icon: '🌭'
  },
  type3: {
    name: '香肠状（裂纹）',
    description: '表面有裂纹',
    icon: '🌭'
  },
  type4: {
    name: '香肠状（光滑）',
    description: '光滑柔软，理想状态',
    icon: '✅'
  },
  type5: {
    name: '软团状',
    description: '边缘清晰',
    icon: '🟤'
  },
  type6: {
    name: '糊状',
    description: '蓬松边缘不齐',
    icon: '🥧'
  },
  type7: {
    name: '水样',
    description: '完全液体',
    icon: '💧'
  }
}

export const POOP_COLORS: Record<PoopColor, { name: string; color: string }> = {
  yellow: { name: '黄色', color: '#FFD700' },
  green: { name: '绿色', color: '#32CD32' },
  brown: { name: '棕色', color: '#8B4513' },
  black: { name: '黑色', color: '#000000' },
  red: { name: '红色', color: '#FF0000' }
}

export const POOP_AMOUNTS: Record<PoopAmount, { name: string }> = {
  small: { name: '少量' },
  medium: { name: '中等' },
  large: { name: '大量' }
}
```

---

## 五、前端架构规范

### 5.1 目录结构

```
src/
├── pages/                          # 页面
│   ├── config/                     # 连接服务器页
│   │   └── index.vue
│   ├── home/                       # 首页
│   │   └── index.vue
│   ├── add-record/                 # 添加/编辑记录页
│   │   └── index.vue
│   └── statistics/                 # 统计页
│       └── index.vue
├── components/                     # 组件
│   ├── record-item.vue            # 记录项组件
│   ├── type-selector.vue          # 类型选择器
│   ├── sync-status.vue            # 同步状态指示器
│   └── empty-state.vue            # 空状态组件
├── stores/                         # Pinia 状态管理
│   ├── auth.ts                    # 认证状态
│   ├── record.ts                  # 记录状态
│   ├── sync.ts                    # 同步状态
│   └── settings.ts                # 设置状态
├── services/                       # 服务层
│   ├── api.ts                     # API 请求封装
│   ├── storage.ts                 # 本地存储服务
│   └── sync.ts                    # 同步服务
├── types/                          # TypeScript 类型
│   ├── record.ts
│   ├── baby.ts
│   └── api.ts
├── constants/                      # 常量
│   ├── poop-types.ts
│   └── app.ts
├── utils/                          # 工具函数
│   ├── request.ts                 # 请求封装
│   ├── date.ts                    # 日期处理
│   └── validator.ts               # 验证函数
├── static/                         # 静态资源
│   └── images/
├── App.vue
├── main.ts
├── manifest.json                   # uniapp 配置
├── pages.json                      # 页面路由配置
└── uni.scss                        # 全局样式变量
```

### 5.2 状态管理架构

```typescript
// stores/record.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PoopRecord, LocalRecord } from '@/types/record'

export const useRecordStore = defineStore('record', () => {
  // 状态
  const records = ref<PoopRecord[]>([])
  const localRecords = ref<LocalRecord[]>([])
  const loading = ref(false)

  // 计算属性
  const sortedRecords = computed(() => {
    return [...records.value, ...localRecords.value]
      .filter(r => !r.isDeleted)
      .sort((a, b) => b.timestamp - a.timestamp)
  })

  const groupedByDate = computed(() => {
    const groups: Record<string, (PoopRecord | LocalRecord)[]> = {}
    sortedRecords.value.forEach(record => {
      const dateKey = formatDate(record.timestamp, 'YYYY-MM-DD')
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(record)
    })
    return groups
  })

  // 方法
  async function fetchRecords() { /* ... */ }
  async function addRecord(record: Omit<PoopRecord, 'id' | 'createdAt' | 'updatedAt'>) { /* ... */ }
  async function updateRecord(id: number, record: Partial<PoopRecord>) { /* ... */ }
  async function deleteRecord(id: number) { /* ... */ }

  return {
    records,
    localRecords,
    loading,
    sortedRecords,
    groupedByDate,
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord
  }
}, {
  persist: {
    key: 'babypoop-records',
    paths: ['records', 'localRecords']
  }
})
```

### 5.3 离线同步机制

```typescript
// services/sync.ts

export class SyncService {
  private syncInterval = 30000 // 30秒同步一次
  private timer: number | null = null

  /** 启动自动同步 */
  startAutoSync() {
    this.timer = setInterval(() => {
      this.sync()
    }, this.syncInterval)
  }

  /** 执行同步 */
  async sync(): Promise<void> {
    const syncStore = useSyncStore()
    const recordStore = useRecordStore()

    syncStore.setStatus('syncing')

    try {
      // 1. 推送本地变更
      await this.pushLocalChanges()

      // 2. 拉取服务器更新
      await this.pullServerChanges()

      syncStore.setStatus('synced')
      syncStore.setLastSyncTime(Date.now())
    } catch (error) {
      syncStore.setStatus('error')
      throw error
    }
  }

  /** 推送本地变更 */
  private async pushLocalChanges(): Promise<void> {
    const recordStore = useRecordStore()
    const localRecords = recordStore.localRecords.filter(r => r.isLocal)

    if (localRecords.length === 0) return

    const response = await api.syncPush({
      records: localRecords.map(r => ({
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
      }))
    })

    // 更新本地记录的服务器ID
    response.data.mapping.forEach(m => {
      const local = recordStore.localRecords.find(r => r.localId === m.localId)
      if (local) {
        local.id = m.serverId
        local.isLocal = false
      }
    })
  }

  /** 拉取服务器更新 */
  private async pullServerChanges(): Promise<void> {
    const syncStore = useSyncStore()
    const recordStore = useRecordStore()

    const response = await api.syncPull({
      lastSyncTime: syncStore.lastSyncTime || 0
    })

    // 合并更新
    response.data.records.forEach(serverRecord => {
      const index = recordStore.records.findIndex(r => r.id === serverRecord.id)
      if (index >= 0) {
        recordStore.records[index] = serverRecord
      } else {
        recordStore.records.push(serverRecord)
      }
    })

    // 删除已删除的记录
    response.data.deletedIds.forEach(id => {
      const index = recordStore.records.findIndex(r => r.id === id)
      if (index >= 0) {
        recordStore.records.splice(index, 1)
      }
    })
  }
}
```

### 5.4 本地存储策略

| 平台 | 存储方式 | 容量限制 |
|------|----------|----------|
| 微信小程序 | `uni.setStorage` | 10MB |
| H5 | `localStorage` | 5MB |
| App | `plus.sqlite` 或 `uni.setStorage` | 无限制 |

**存储 Key 规范**：

| Key | 说明 | 类型 |
|-----|------|------|
| `babypoop-token` | JWT 令牌 | string |
| `babypoop-server-url` | 服务器地址 | string |
| `babypoop-operator-name` | 当前操作人昵称 | string |
| `babypoop-records` | 记录列表缓存 | PoopRecord[] |
| `babypoop-local-records` | 离线记录 | LocalRecord[] |
| `babypoop-last-sync` | 上次同步时间 | number |
| `babypoop-settings` | 用户设置 | Settings |

---

## 六、UI 界面规范

### 6.1 设计原则

1. **大按钮、大字体**：主要操作按钮高度 ≥ 48px，字体 ≥ 16px
2. **高对比度**：文字与背景对比度 ≥ 4.5:1
3. **简洁明了**：每页信息层级不超过 3 层
4. **即时反馈**：所有操作提供明确的成功/失败提示

### 6.2 配色方案

```scss
// uni.scss

// 主色调
$primary-color: #4CAF50;      // 绿色 - 健康
$primary-light: #81C784;
$primary-dark: #388E3C;

// 辅助色
$secondary-color: #2196F3;    // 蓝色
$warning-color: #FF9800;      // 橙色 - 警告
$error-color: #F44336;        // 红色 - 错误
$success-color: #4CAF50;      // 绿色 - 成功

// 中性色
$background-color: #F5F5F5;   // 页面背景
$card-background: #FFFFFF;    // 卡片背景
$text-primary: #333333;       // 主要文字
$text-secondary: #666666;     // 次要文字
$text-hint: #999999;          // 提示文字
$border-color: #E0E0E0;       // 边框

// 便便颜色
$poop-yellow: #FFD700;
$poop-green: #32CD32;
$poop-brown: #8B4513;
$poop-black: #000000;
$poop-red: #FF0000;
```

### 6.3 页面详细规范

#### 6.3.1 连接服务器页 (pages/config/index.vue)

**布局**：
```
┌─────────────────────────────┐
│                             │
│         📱 Logo             │
│     宝宝排便记录             │
│                             │
│  ┌───────────────────────┐  │
│  │ 服务器地址             │  │
│  │ http://192.168.1.100:3000 │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 家庭密码               │  │
│  │ ••••••                │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 您的昵称               │  │
│  │ 妈妈/爸爸/奶奶...      │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │       连 接           │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

**交互**：
- 输入框支持自动填充历史地址
- 连接按钮点击后显示 loading 状态
- 连接失败使用 `uni.showToast` 提示错误
- 连接成功自动跳转首页

#### 6.3.2 首页 (pages/home/index.vue)

**布局**：
```
┌─────────────────────────────┐
│ ← 宝宝排便记录      📊 统计 │  ← AppBar
├─────────────────────────────┤
│ 同步状态: ✅ 已同步          │  ← 同步状态栏
├─────────────────────────────┤
│ 今天 (4月27日)               │
│ ┌─────────────────────────┐ │
│ │ 09:30  💩 type4         │ │
│ │        黄色 · 中等 · 妈妈 │ │
│ │        "今天吃了胡萝卜泥" │ │
│ └─────────────────────────┘ │
│                             │
│ 昨天 (4月26日)               │
│ ┌─────────────────────────┐ │
│ │ 14:20  💩 type3         │ │
│ │        棕色 · 少量 · 爸爸 │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 08:15  💩 type4         │ │
│ │        黄色 · 中等 · 妈妈 │ │
│ └─────────────────────────┘ │
│                             │
│              ＋              │  ← FAB 添加按钮
└─────────────────────────────┘
```

**交互**：
- 下拉刷新触发同步
- 长按记录弹出菜单：编辑 / 删除
- 点击记录跳转编辑页
- 右上角统计按钮跳转统计页
- 右下角 FAB 按钮跳转添加记录页

#### 6.3.3 添加/编辑记录页 (pages/add-record/index.vue)

**布局**：
```
┌─────────────────────────────┐
│ ← 添加记录                   │
├─────────────────────────────┤
│                             │
│  时间                        │
│  ┌───────────────────────┐  │
│  │ 2024-04-27  09:30  ▼  │  │
│  └───────────────────────┘  │
│                             │
│  便便类型                    │
│  ┌─────┬─────┬─────┬─────┐  │
│  │🪨   │🌭   │🌭   │✅   │  │
│  │坚果 │香肠 │香肠 │香肠 │  │
│  │type1│type2│type3│type4│  │
│  └─────┴─────┴─────┴─────┘  │
│  ┌─────┬─────┬─────┐         │
│  │🟤   │🥧   │💧   │         │
│  │软团 │糊状 │水样 │         │
│  │type5│type6│type7│         │
│  └─────┴─────┴─────┘         │
│                             │
│  颜色                        │
│  ┌───────────────────────┐  │
│  │ 黄色 ▼                 │  │
│  └───────────────────────┘  │
│                             │
│  排便量                      │
│  ┌───────────────────────┐  │
│  │ 中等 ▼                 │  │
│  └───────────────────────┘  │
│                             │
│  备注                        │
│  ┌───────────────────────┐  │
│  │ 今天吃了胡萝卜泥...     │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │       保 存           │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

**交互**：
- 时间选择器使用 `uni.showPicker`
- 类型选择使用网格布局，选中高亮
- 颜色/排便量使用下拉选择
- 备注多行输入
- 保存按钮点击后验证必填项，保存成功返回首页

#### 6.3.4 统计页 (pages/statistics/index.vue)

**布局**：
```
┌─────────────────────────────┐
│ ← 数据统计                   │
├─────────────────────────────┤
│                             │
│  近7天统计                   │
│  ┌───────────────────────┐  │
│  │ 总次数: 14次           │  │
│  │ 日均: 2.0次            │  │
│  └───────────────────────┘  │
│                             │
│  类型分布                    │
│  ┌───────────────────────┐  │
│  │ type4 ████████ 8      │  │
│  │ type3 ████ 3          │  │
│  │ type5 ██ 2            │  │
│  │ type2 █ 1             │  │
│  └───────────────────────┘  │
│                             │
│  颜色分布                    │
│  ┌───────────────────────┐  │
│  │ 🟡 黄色 10次           │  │
│  │ 🟢 绿色 2次            │  │
│  │ 🟤 棕色 2次            │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │      导出数据          │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

### 6.4 字体大小规范

```scss
// 字体大小
$font-size-xs: 24rpx;   // 12px - 辅助文字
$font-size-sm: 28rpx;   // 14px - 次要文字
$font-size-base: 32rpx; // 16px - 正文
$font-size-lg: 36rpx;   // 18px - 标题
$font-size-xl: 40rpx;   // 20px - 大标题

// 用户可调节的字体大小倍率
// 在设置页面提供: 小、中、大 三档
$font-scale-small: 0.875;
$font-scale-medium: 1;
$font-scale-large: 1.125;
```

---

## 七、错误处理规范

### 7.1 后端错误处理

```javascript
// 中间件统一错误处理
function errorHandler(err, req, res, next) {
  console.error(err)

  const status = err.status || 500
  const message = err.message || '服务器内部错误'

  res.status(status).json({
    success: false,
    message
  })
}

// 路由中使用
app.get('/api/v1/records', async (req, res, next) => {
  try {
    const records = await getRecords()
    res.json({ success: true, data: records })
  } catch (error) {
    next(error)
  }
})
```

### 7.2 前端错误处理

```typescript
// utils/request.ts

interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

export async function request<T>(config: RequestConfig): Promise<T> {
  const token = uni.getStorageSync('babypoop-token')
  const serverUrl = uni.getStorageSync('babypoop-server-url')

  try {
    const response = await uni.request({
      url: `${serverUrl}${config.url}`,
      method: config.method || 'GET',
      data: config.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...config.header
      }
    })

    const { statusCode, data } = response

    if (statusCode === 401) {
      // Token 过期，跳转到配置页
      uni.removeStorageSync('babypoop-token')
      uni.reLaunch({ url: '/pages/config/index' })
      throw new Error('连接已失效，请重新连接服务器')
    }

    if (statusCode >= 400) {
      throw new Error(data.message || '请求失败')
    }

    return data
  } catch (error) {
    if (error.errMsg?.includes('request:fail')) {
      throw new Error('网络连接失败，请检查网络')
    }
    throw error
  }
}

// 错误提示
export function showError(message: string): void {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 3000
  })
}
```

---

## 八、部署规范

### 8.1 Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src
COPY data ./data

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  babypoop-server:
    build: .
    container_name: babypoop-tracker
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-secret-key-change-me
      - PASSWORD=your-family-password
    restart: unless-stopped
```

### 8.2 环境变量

```bash
# .env.example

# 服务器端口
PORT=3000

# JWT 密钥（生产环境必须修改）
JWT_SECRET=your-secret-key-change-me

# 家庭密码
PASSWORD=your-family-password

# Token 有效期（秒），默认1年
TOKEN_EXPIRES=31536000
```

### 8.3 启动命令

```bash
# 开发环境
npm run dev

# 生产环境
npm start

# Docker 启动
docker-compose up -d

# Docker 查看日志
docker-compose logs -f

# Docker 停止
docker-compose down
```

---

## 九、测试规范

### 9.1 后端测试

```javascript
// tests/api.test.js

const request = require('supertest')
const app = require('../src/app')

describe('Records API', () => {
  let token

  beforeAll(async () => {
    // 获取测试 token
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: process.env.PASSWORD })
    token = res.body.data.token
  })

  test('GET /records should return records', async () => {
    const res = await request(app)
      .get('/api/v1/records')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data.records)).toBe(true)
  })

  test('POST /records should create record', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${token}`)
      .send({
        babyId: 1,
        timestamp: Date.now(),
        type: 'type4',
        color: 'yellow',
        amount: 'medium',
        note: '测试记录',
        operatorName: '测试'
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBeDefined()
  })
})
```

### 9.2 前端测试要点

- 测试离线添加记录功能
- 测试网络恢复后自动同步
- 测试数据持久化（关闭 App 重开数据不丢失）
- 测试各页面在不同屏幕尺寸下的显示

---

## 十、版本规划

### v1.0 基础版

- [x] 连接服务器
- [x] 添加/编辑/删除记录
- [x] 记录列表展示
- [x] 离线存储
- [x] 数据同步
- [x] 基础统计

### v1.1 增强版

- [ ] 多宝宝支持
- [ ] 数据导出（JSON/CSV）
- [ ] 提醒功能（定时提醒记录）
- [ ] 数据备份与恢复

### v1.2 高级版

- [ ] 图表可视化
- [ ] 数据趋势分析
- [ ] 健康建议

---

## 十一、开发注意事项

1. **时间处理**：统一使用毫秒时间戳，避免时区问题
2. **软删除**：删除操作标记 `is_deleted` 而非物理删除，便于数据恢复
3. **幂等性**：同步接口需支持重复调用不产生副作用
4. **防抖节流**：频繁操作（如滚动、输入）需做防抖/节流处理
5. **内存管理**：记录数量超过 1000 条时考虑分页加载
