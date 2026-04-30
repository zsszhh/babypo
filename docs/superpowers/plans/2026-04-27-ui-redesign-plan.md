# Lullaby Mint UI 重设计实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 来逐步执行任务。Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 基于 `stitch_/lullaby_mint` 设计系统，将 Baby Poop Tracker 前端全面重构为薄荷绿清新风格。

**架构：**
- 更新全局 CSS 变量为 Lullaby Mint 配色
- 新建 3 个共享组件：TopAppBar、BottomNavBar、QuickLogCard
- 创建 2 个新页面：History、Profile；重构 1 个页面（Home）；替换 1 个页面（Trends 替代 Statistics）；更新其余 4 页面的样式
- 新增底部导航栏替代原来的页面跳转

**技术栈：** uni-app (Vue 3) + TypeScript + Pinia + CSS 变量主题

---

## 文件结构变更

### 新建文件
| 文件 | 职责 |
|------|------|
| `src/components/top-app-bar.vue` | 顶部导航栏（Logo + 通知按钮） |
| `src/components/bottom-nav-bar.vue` | 底部导航栏（4 Tab + 高亮切换） |
| `src/components/quick-log-card.vue` | 首页快速记录卡片（颜色 + 质地选择） |
| `src/pages/history/index.vue` | 历史记录页（日期选择器 + 时间线列表） |
| `src/pages/profile/index.vue` | 个人资料页（头像 + 设置 + 退出） |
| `src/pages/trends/index.vue` | 数据统计页（图表 + 分析报告） |

### 修改文件
| 文件 | 变更内容 |
|------|----------|
| `src/App.vue` | 替换 CSS 变量为 Lullaby Mint 配色 |
| `src/uni.scss` | 替换 SCSS 变量 |
| `src/pages.json` | 添加新建页面的路由 |
| `src/main.ts` | 注册新全局组件 |
| `src/pages/home/index.vue` | 完全重写为设计稿风格 |
| `src/pages/add-record/index.vue` | 更新样式 token |
| `src/pages/baby-manage/index.vue` | 更新样式 token |
| `src/pages/settings/index.vue` | 更新样式 token |
| `src/pages/config/index.vue` | 更新样式 token |
| `src/components/record-item.vue` | 更新为时间线风格卡片 |
| `src/components/empty-state.vue` | 更新样式 token |

### 删除文件
| 文件 | 原因 |
|------|------|
| `src/pages/statistics/index.vue` | 被 `trends/index.vue` 替代 |

---

## 设计 Token 对照

| 当前 CSS 变量 | 替换为 Lullaby Mint |
|---|---|
| `--primary: #0891B2` | `--primary: #3b694c` |
| `--primary-light: #22D3EE` | `--primary-container: #d1fae5` |
| `--primary-dark: #0369A1` | 移除 |
| `--bg: #ECFEFF` | `--background: #f7faf8` |
| `--card-bg: #FFFFFF` | `--surface-container-lowest: #ffffff` |
| `--text-primary: #164E63` | `--on-surface: #191c1a` |
| `--text-secondary: #4B5563` | `--on-surface-variant: #414942` |
| `--text-hint: #9CA3AF` | `--outline: #707973` |
| `--border: #E5E7EB` | `--outline-variant: #bfc9c4` |
| `--success: #059669` | 沿用 |
| `--error: #DC2626` | `--error: #ba1a1a` |

---

## Task 1: 设计系统基础 — CSS 变量与字体

**文件：**
- 修改：`src/App.vue`
- 修改：`src/uni.scss`

- [ ] **Step 1: 更新 App.vue 的 CSS 变量**

将 `:root` 中的全部 CSS 变量替换为 Lullaby Mint。添加所有表面层级变量。

编辑 `src/App.vue`，将 `<style>` 中的 `:root { ... }` 替换为：

```css
:root {
  /* 主色调 */
  --primary: #3b694c;
  --primary-container: #d1fae5;
  --primary-fixed: #beeed0;
  --primary-fixed-dim: #a2d3b2;
  --on-primary: #ffffff;
  --on-primary-container: #002111;
  
  /* 辅助色 */
  --secondary: #506354;
  --secondary-container: #d3e8d6;
  --on-secondary: #ffffff;
  --on-secondary-container: #0e1f14;
  
  --tertiary: #3d6469;
  --tertiary-container: #beeaf1;
  --on-tertiary: #ffffff;
  --on-tertiary-container: #001f24;
  
  /* 表面层级 */
  --surface: #f7faf8;
  --surface-dim: #d8dbd9;
  --surface-bright: #f7faf8;
  --surface-container-lowest: #ffffff;
  --surface-container-low: #f0f7f4;
  --surface-container: #e8f3ee;
  --surface-container-high: #ddebe4;
  --surface-container-highest: #d2e3db;
  
  /* 文字 */
  --on-surface: #191c1a;
  --on-surface-variant: #414942;
  --on-background: #191c1a;
  --outline: #707973;
  --outline-variant: #bfc9c4;
  
  /* 背景 */
  --background: #f7faf8;
  
  /* 错误 */
  --error: #ba1a1a;
  --error-container: #ffdad6;
  --on-error: #ffffff;
  
  /* 阴影 */
  --shadow-sm: 0 2rpx 8rpx rgba(59, 105, 76, 0.06);
  --shadow-base: 0 4rpx 16rpx rgba(59, 105, 76, 0.08);
  --shadow-lg: 0 8rpx 32rpx rgba(59, 105, 76, 0.1);
  --shadow-fab: 0 8rpx 24rpx rgba(59, 105, 76, 0.3);
  
  /* 兼容旧 token 名称（过渡期使用） */
  --bg: #f7faf8;
  --card-bg: #ffffff;
  --text-primary: #191c1a;
  --text-secondary: #414942;
  --text-hint: #707973;
  --border: #bfc9c4;
}
```

同时将 `<style>` 中的 `.app` 的背景色改为 `--background`，字体改为 `Plus Jakarta Sans`。

- [ ] **Step 2: 更新 App.vue 主题计算**

修改 `themeStyle` 的 computed，更新背景色：
```ts
const themeStyle = computed(() => {
  return settings.darkMode
    ? 'background-color: #2e312f; color: #f0f1ef;'
    : 'background-color: #f7faf8; color: #191c1a;'
})
```

- [ ] **Step 3: 更新 uni.scss**

将 `src/uni.scss` 中的全部 SCSS 变量替换为新配色方案：

```scss
// ========= 设计 Token - Lullaby Mint =========

// 主色调
$primary-color: #3b694c;
$primary-light: #7bb890;
$primary-container: #d1fae5;
$primary-dark: #224e35;

// 辅助色
$secondary-color: #506354;
$tertiary-color: #3d6469;

// 表面颜色
$bg-color: #f7faf8;
$card-bg: #ffffff;
$surface-bg: #f0f7f4;

// 文字
$text-primary: #191c1a;
$text-secondary: #414942;
$text-hint: #707973;

// 边框
$border-color: #bfc9c4;

// 功能色
$success-color: #3b694c;
$warning-color: #D97706;
$error-color: #ba1a1a;

// 深色模式
$dark-bg: #2e312f;
$dark-card-bg: #1a1d1b;
$dark-text-primary: #f0f1ef;
$dark-text-secondary: #c2c7c3;
$dark-text-hint: #8b9390;
$dark-border: #404944;

// 字体大小（沿用）
$font-size-xs: 24rpx;
$font-size-sm: 28rpx;
$font-size-base: 32rpx;
$font-size-lg: 36rpx;
$font-size-xl: 40rpx;
$font-size-xxl: 48rpx;

// 间距（沿用）
$spacing-xs: 8rpx;
$spacing-sm: 16rpx;
$spacing-base: 24rpx;
$spacing-lg: 32rpx;
$spacing-xl: 48rpx;

// 圆角
$radius-sm: 8rpx;
$radius-base: 16rpx;
$radius-lg: 24rpx;
$radius-xl: 32rpx;
$radius-2xl: 48rpx;
$radius-round: 999rpx;

// 阴影
$shadow-sm: 0 2rpx 8rpx rgba(59, 105, 76, 0.06);
$shadow-base: 0 4rpx 16rpx rgba(59, 105, 76, 0.08);
$shadow-lg: 0 8rpx 32rpx rgba(59, 105, 76, 0.1);
```

更新 `page` 字体为 `'Plus Jakarta Sans', sans-serif`。

---

## Task 2: 顶部导航栏组件

**文件：**
- 创建：`src/components/top-app-bar.vue`

- [ ] **Step 1: 创建 TopAppBar 组件**

`src/components/top-app-bar.vue`：

```vue
<template>
  <header class="top-app-bar">
    <view class="app-bar-left">
      <text class="app-bar-icon material-symbols-outlined">child_care</text>
      <text class="app-bar-title">TummyTrack</text>
    </view>
    <button class="app-bar-right" hover-class="app-bar-btn-hover">
      <text class="material-symbols-outlined app-bar-notif">notifications</text>
    </button>
  </header>
</template>

<style scoped>
.top-app-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40rpx;
  height: 128rpx;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(191, 201, 196, 0.3);
  box-sizing: border-box;
}

.app-bar-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.app-bar-icon {
  color: var(--primary);
  font-size: 48rpx;
}

.app-bar-title {
  font-size: 36rpx;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -0.02em;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.app-bar-right {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.app-bar-btn-hover {
  background: rgba(209, 250, 229, 0.4);
}

.app-bar-notif {
  font-size: 48rpx;
  color: var(--on-surface-variant);
}
</style>
```

注意：图标使用 Material Symbols Outlined，需要确保字体已加载。由于 uni-app 不支持 `@font-face` 在组件内引用，需在主应用中全局加载。组件中暂用 emoji 替代，后续再替换为正规图标字体。

- [ ] **Step 2: 在 main.ts 注册全局组件**

编辑 `src/main.ts`，添加：

```ts
import TopAppBar from '@/components/top-app-bar.vue'
app.component('top-app-bar', TopAppBar)
```

---

## Task 3: 底部导航栏组件

**文件：**
- 创建：`src/components/bottom-nav-bar.vue`

- [ ] **Step 1: 创建 BottomNavBar 组件**

`src/components/bottom-nav-bar.vue`。接收 `current` prop 标识当前选中 Tab，emit `switch` 事件进行页面跳转。

```vue
<template>
  <nav class="bottom-nav">
    <view
      v-for="tab in tabs"
      :key="tab.key"
      class="nav-item"
      :class="{ 'nav-item--active': current === tab.key }"
      @tap="handleSwitch(tab.key)"
      hover-class="nav-item-hover"
    >
      <text class="nav-icon material-symbols-outlined">{{ tab.icon }}</text>
      <text class="nav-label">{{ tab.label }}</text>
    </view>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{
  current: string
}>()

const emit = defineEmits<{
  switch: [key: string]
}>()

const tabs = [
  { key: 'home', icon: 'home', label: '首页' },
  { key: 'history', icon: 'history', label: '历史' },
  { key: 'trends', icon: 'analytics', label: '趋势' },
  { key: 'profile', icon: 'person', label: '个人' }
]

function handleSwitch(key: string) {
  emit('switch', key)
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 24rpx 32rpx 32rpx;
  background: rgba(247, 250, 248, 0.9);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(191, 201, 196, 0.3);
  border-radius: 48rpx 48rpx 0 0;
  box-shadow: 0 -8rpx 30rpx rgba(59, 105, 76, 0.06);
  box-sizing: border-box;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 24rpx;
  color: var(--outline);
  transition: all 0.2s ease;
  border-radius: 32rpx;
  min-width: 120rpx;
}

.nav-item--active {
  color: var(--primary);
  background: var(--primary-container);
}

.nav-item-hover {
  transform: scale(0.9);
}

.nav-icon {
  font-size: 48rpx;
  margin-bottom: 4rpx;
  line-height: 1;
}

.nav-label {
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.2;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>
```

- [ ] **Step 2: 在 main.ts 注册全局组件**

编辑 `src/main.ts`，添加：

```ts
import BottomNavBar from '@/components/bottom-nav-bar.vue'
app.component('bottom-nav-bar', BottomNavBar)
```

---

## Task 4: 页面路由更新

**文件：**
- 修改：`src/pages.json`
- 创建：`src/pages/history/index.vue`（占位）
- 创建：`src/pages/profile/index.vue`（占位）
- 创建：`src/pages/trends/index.vue`（占位）

- [ ] **Step 1: 更新 pages.json 路由**

编辑 `src/pages.json` 添加新页面、删除旧页面：

```json
{
  "pages": [
    { "path": "pages/config/index", "style": { "navigationBarTitleText": "连接服务器", "navigationStyle": "custom" } },
    { "path": "pages/home/index", "style": { "navigationBarTitleText": "首页", "navigationStyle": "custom" } },
    { "path": "pages/history/index", "style": { "navigationBarTitleText": "历史记录", "navigationStyle": "custom" } },
    { "path": "pages/trends/index", "style": { "navigationBarTitleText": "数据统计", "navigationStyle": "custom" } },
    { "path": "pages/profile/index", "style": { "navigationBarTitleText": "个人资料", "navigationStyle": "custom" } },
    { "path": "pages/add-record/index", "style": { "navigationBarTitleText": "添加记录", "navigationStyle": "custom" } },
    { "path": "pages/baby-manage/index", "style": { "navigationBarTitleText": "宝宝管理", "navigationStyle": "custom" } },
    { "path": "pages/settings/index", "style": { "navigationBarTitleText": "设置", "navigationStyle": "custom" } }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "宝宝排便记录",
    "navigationBarBackgroundColor": "#f7faf8",
    "backgroundColor": "#f7faf8"
  }
}
```

- [ ] **Step 2: 创建 3 个占位页面**

创建 `src/pages/history/index.vue`、`src/pages/profile/index.vue`、`src/pages/trends/index.vue`，每个文件包含最简结构：

```vue
<template>
  <view class="page">
    <top-app-bar />
    <main class="page-content">
      <view class="page-placeholder">建设中...</view>
    </main>
    <bottom-nav-bar current="xxx" @switch="handleSwitch" />
  </view>
</template>

<script setup lang="ts">
function handleSwitch(key: string) {
  const routes: Record<string, string> = {
    home: '/pages/home/index',
    history: '/pages/history/index',
    trends: '/pages/trends/index',
    profile: '/pages/profile/index'
  }
  uni.switchTab({ url: routes[key as keyof typeof routes] })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--background);
}
.page-content {
  padding-top: 128rpx;
  padding-bottom: 180rpx;
}
.page-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  color: var(--outline);
  font-size: 32rpx;
}
</style>
```

---

## Task 5: 首页重设计

**文件：**
- 修改：`src/pages/home/index.vue`（完全重写）

- [ ] **Step 1: 重写首页模板**

设计要点：
- TopAppBar + 宝宝问候区 + Quick Log 卡片 + Bento 洞察网格 + FAB + BottomNavBar
- 字体使用 Plus Jakarta Sans
- 所有文字保持中文

```vue
<template>
  <view class="home-page">
    <top-app-bar />
    
    <main class="home-content">
      <!-- 问候区 -->
      <section class="welcome-section">
        <view class="welcome-left">
          <view class="baby-avatar" @tap="showBabyPicker = true">
            <text class="baby-avatar-text">{{ babyStore.activeBaby?.name?.[0] || '?' }}</text>
          </view>
          <view class="welcome-texts">
            <text class="daily-label">每日记录</text>
            <text class="hello-text">你好, {{ babyStore.activeBaby?.name || '宝宝' }}</text>
          </view>
        </view>
        <text class="welcome-hint">今天{{ babyStore.activeBaby?.name }}的便便怎么样？</text>
      </section>

      <!-- Quick Log 卡片 -->
      <quick-log-card @saved="onQuickLogSaved" />

      <!-- Bento 洞察网格 -->
      <section class="insight-grid">
        <view class="insight-card insight-card--main">
          <view class="insight-main-left">
            <text class="insight-title">状态良好！</text>
            <text class="insight-desc">排便规律正常</text>
          </view>
          <view class="insight-icon-box">
            <text class="material-symbols-outlined insight-icon">thumb_up</text>
          </view>
        </view>
        <view class="insight-card insight-card--small">
          <text class="material-symbols-outlined insight-mini-icon">history</text>
          <text class="insight-mini-label">最近记录</text>
          <text class="insight-mini-value">{{ lastLogTime }}</text>
        </view>
        <view class="insight-card insight-card--small">
          <text class="material-symbols-outlined insight-mini-icon">analytics</text>
          <text class="insight-mini-label">日均次数</text>
          <text class="insight-mini-value">{{ dailyAvg }} 次</text>
        </view>
      </section>
    </main>

    <!-- FAB -->
    <view class="fab" @tap="goAdd" hover-class="fab-active">
      <text class="fab-icon material-symbols-outlined">add</text>
      <text class="fab-label">记录</text>
    </view>

    <bottom-nav-bar current="home" @switch="handleSwitch" />
  </view>
</template>
```

- [ ] **Step 2: 实现首页脚本**

```ts
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRecordStore } from '@/stores/record'
import { useBabyStore } from '@/stores/baby'
import { syncService } from '@/services/sync'

const recordStore = useRecordStore()
const babyStore = useBabyStore()

const showBabyPicker = ref(false)
const lastLogTime = computed(() => {
  const records = recordStore.sortedRecords
  if (records.length === 0) return '暂无'
  const last = new Date(records[0].timestamp)
  const now = new Date()
  const diffH = Math.floor((now.getTime() - last.getTime()) / 3600000)
  if (diffH < 1) return '刚刚'
  if (diffH < 24) return `${diffH}小时前`
  return `${Math.floor(diffH / 24)}天前`
})
const dailyAvg = computed(() => {
  return recordStore.sortedRecords.length || 0
})

onMounted(async () => {
  try {
    await babyStore.fetchBabies()
    await recordStore.fetchRecords(babyStore.activeBabyId)
    syncService.startAutoSync()
  } catch (e) { /* silent */ }
})

function onQuickLogSaved() {
  recordStore.fetchRecords(babyStore.activeBabyId)
}

function goAdd() {
  uni.navigateTo({ url: '/pages/add-record/index' })
}

function handleSwitch(key: string) {
  const routes: Record<string, string> = {
    home: '/pages/home/index',
    history: '/pages/history/index',
    trends: '/pages/trends/index',
    profile: '/pages/profile/index'
  }
  uni.reLaunch({ url: routes[key as keyof typeof routes] })
}
</script>
```

- [ ] **Step 3: 实现首页样式（设计系统风格）**

关键样式要点：
- 主容器 `padding: 128rpx 40rpx 200rpx`
- 问候区：flex 布局，宝宝头像圆形带边框
- Quick Log 卡片：`surface-container-lowest` 背景，`32rpx` 圆角
- Bento 网格：`grid` 布局，2 列
- FAB：固定右下角，`120rpx` 圆形，primary 渐变，白色文字

```css
<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--background);
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.home-content {
  padding: 148rpx 40rpx 240rpx;
}

/* 问候区 */
.welcome-section {
  margin-bottom: 48rpx;
}

.welcome-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 16rpx;
}

.baby-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 3rpx solid var(--primary-container);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-container), var(--primary));
  box-shadow: 0 4rpx 16rpx rgba(59, 105, 76, 0.15);
}

.baby-avatar-text {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--on-primary);
}

.daily-label {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: block;
}

.hello-text {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--on-surface);
  letter-spacing: -0.02em;
  display: block;
}

.welcome-hint {
  font-size: 28rpx;
  color: var(--outline);
  margin-left: 104rpx;
}

/* Bento 洞察网格 */
.insight-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-top: 32rpx;
}

.insight-card {
  background: var(--surface-container-lowest);
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(191, 201, 196, 0.15);
}

.insight-card--main {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(209, 250, 229, 0.4);
  border-color: rgba(59, 105, 76, 0.15);
}

.insight-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--primary);
  display: block;
}

.insight-desc {
  font-size: 26rpx;
  color: var(--on-surface-variant);
  margin-top: 4rpx;
  display: block;
}

.insight-icon-box {
  width: 80rpx;
  height: 80rpx;
  background: var(--primary);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.insight-icon {
  color: var(--on-primary);
  font-size: 44rpx;
}

.insight-mini-icon {
  font-size: 36rpx;
  color: var(--primary);
  margin-bottom: 12rpx;
}

.insight-mini-label {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--outline);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: block;
}

.insight-mini-value {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--on-surface);
  margin-top: 8rpx;
  display: block;
}

/* FAB */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 220rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, var(--primary), #224e35);
  color: #fff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-fab);
  z-index: 40;
  transition: transform 0.2s ease;
  border: none;
  cursor: pointer;
}

.fab-active {
  transform: scale(0.92);
}

.fab-icon {
  font-size: 48rpx;
  line-height: 1;
  color: #fff;
}

.fab-label {
  font-size: 20rpx;
  font-weight: 600;
  margin-top: 4rpx;
  opacity: 0.9;
  color: #fff;
}
</style>
```

---

## Task 6: 快速记录卡片组件

**文件：**
- 创建：`src/components/quick-log-card.vue`

- [ ] **Step 1: 创建 QuickLogCard 组件**

模拟设计文件 `_4` 中的快速记录卡片。包含颜色选择器和质地选择器。

```vue
<template>
  <view class="ql-card">
    <view class="ql-header">
      <text class="ql-title">快速记录</text>
      <text class="ql-time">{{ currentTime }}</text>
    </view>

    <!-- 颜色选择 -->
    <view class="ql-section">
      <text class="ql-label">便便颜色</text>
      <scroll-view class="ql-colors" scroll-x>
        <view
          v-for="c in colorOptions"
          :key="c.key"
          class="ql-color-btn"
          :class="{ 'ql-color-btn--selected': selectedColor === c.key }"
          :style="{ backgroundColor: c.color }"
          @tap="selectedColor = c.key"
          hover-class="ql-color-hover"
        />
      </scroll-view>
    </view>

    <!-- 质地选择 -->
    <view class="ql-section">
      <text class="ql-label">质地</text>
      <view class="ql-consistencies">
        <view
          v-for="t in consistencyOptions"
          :key="t.key"
          class="ql-cons-item"
          :class="{ 'ql-cons-item--selected': selectedConsistency === t.key }"
          @tap="selectedConsistency = t.key"
          hover-class="ql-cons-hover"
        >
          <text class="ql-cons-icon">{{ t.icon }}</text>
          <text class="ql-cons-name">{{ t.label }}</text>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <button
      class="ql-save-btn"
      :class="{ 'ql-save-btn--disabled': !canSave }"
      :disabled="!canSave || saving"
      @tap="handleSave"
    >
      <text class="material-symbols-outlined ql-save-icon">add</text>
      <text>{{ saving ? '保存中...' : '保存记录' }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecordStore } from '@/stores/record'
import { useBabyStore } from '@/stores/baby'
import { useAuthStore } from '@/stores/auth'
import { now } from '@/utils/date'

const emit = defineEmits<{ saved: [] }>()

const recordStore = useRecordStore()
const babyStore = useBabyStore()
const authStore = useAuthStore()

const saving = ref(false)
const selectedColor = ref('')
const selectedConsistency = ref('')
const currentTime = ref(formatTime(now()))

const colorOptions = [
  { key: 'yellow', color: '#FFD700', name: '黄色' },
  { key: 'brown', color: '#8B5E3C', name: '棕色' },
  { key: 'darkbrown', color: '#5C4033', name: '深棕' },
  { key: 'green', color: '#65A30D', name: '绿色' },
  { key: 'tan', color: '#D2B48C', name: '米色' },
  { key: 'beige', color: '#F5F5DC', name: '淡黄' }
]

const consistencyOptions = [
  { key: 'liquid', icon: '💧', label: '水样' },
  { key: 'soft', icon: '☁️', label: '糊状' },
  { key: 'firm', icon: '⬡', label: '成形' }
]

const canSave = computed(() => selectedConsistency.value && authStore.operatorName)

function formatTime(ts: number): string {
  const d = new Date(ts)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

async function handleSave() {
  if (!canSave.value) return
  saving.value = true
  
  // 将 quick log 映射为 type6（糊状）或根据选定质地映射
  const typeMap: Record<string, string> = { liquid: 'type7', soft: 'type6', firm: 'type4' }
  
  try {
    await recordStore.addRecord({
      babyId: babyStore.activeBabyId,
      timestamp: now(),
      type: typeMap[selectedConsistency.value] || 'type6',
      color: selectedColor.value || null,
      operatorName: authStore.operatorName
    })
    uni.showToast({ title: '保存成功', icon: 'success' })
    selectedColor.value = ''
    selectedConsistency.value = ''
    emit('saved')
  } catch (e: any) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.ql-card {
  background: var(--surface-container-lowest);
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(59, 105, 76, 0.08);
  border: 1px solid rgba(191, 201, 196, 0.2);
}

.ql-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.ql-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--on-surface);
}

.ql-time {
  font-size: 26rpx;
  color: var(--outline);
  font-weight: 600;
}

.ql-section {
  margin-bottom: 32rpx;
}

.ql-label {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--on-surface-variant);
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 16rpx;
}

.ql-colors {
  display: flex;
  gap: 20rpx;
  white-space: nowrap;
  padding-bottom: 8rpx;
}

.ql-color-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 4rpx solid transparent;
  flex-shrink: 0;
  display: inline-block;
  transition: all 0.2s;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08);
}

.ql-color-btn--selected {
  border-color: var(--primary);
  border-width: 6rpx;
  transform: scale(1.1);
}

.ql-color-hover {
  transform: scale(0.9);
}

.ql-consistencies {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.ql-cons-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24rpx 16rpx;
  border-radius: 24rpx;
  background: var(--surface-container-low);
  border: 2rpx solid rgba(191, 201, 196, 0.3);
  transition: all 0.2s;
  cursor: pointer;
}

.ql-cons-item--selected {
  background: var(--primary-container);
  border-color: var(--primary);
  border-width: 3rpx;
}

.ql-cons-hover {
  transform: scale(0.95);
}

.ql-cons-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.ql-cons-name {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--on-surface-variant);
}

.ql-cons-item--selected .ql-cons-name {
  color: var(--primary);
}

.ql-save-btn {
  width: 100%;
  height: 96rpx;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 700;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(59, 105, 76, 0.2);
  transition: all 0.2s;
  cursor: pointer;
}

.ql-save-btn:active {
  transform: scale(0.97);
}

.ql-save-btn--disabled {
  opacity: 0.5;
}

.ql-save-icon {
  font-size: 36rpx;
  color: var(--on-primary);
}
</style>
```

- [ ] **Step 2: 在 main.ts 注册全局组件**

```ts
import QuickLogCard from '@/components/quick-log-card.vue'
app.component('quick-log-card', QuickLogCard)
```

---

## Task 7: 历史记录页

**文件：**
- 修改：`src/pages/history/index.vue`（替换占位）

- [ ] **Step 1: 实现历史记录页**

基于设计文件 `_3`，包含：
- 顶部导航栏
- 日期快捷选择器
- 时间线式记录列表
- 底部导航栏

```vue
<template>
  <view class="history-page">
    <top-app-bar />
    <main class="history-content">
      <!-- 页面标题 + 操作按钮 -->
      <view class="history-header">
        <text class="history-title">历史记录</text>
        <view class="history-actions">
          <button class="history-action-btn"><text class="material-symbols-outlined">filter_list</text></button>
          <button class="history-action-btn"><text class="material-symbols-outlined">calendar_month</text></button>
        </view>
      </view>

      <!-- 记录列表 -->
      <view v-if="Object.keys(recordStore.groupedByDate).length === 0" class="history-empty">
        <empty-state title="暂无记录" desc="添加第一条记录后，它将出现在这里" />
      </view>

      <view v-else class="history-list">
        <view v-for="(records, dateStr) in recordStore.groupedByDate" :key="dateStr" class="date-group">
          <text class="date-header">{{ getDateLabel(records[0].timestamp) }}</text>
          
          <view
            v-for="record in records"
            :key="record.id || record.localId"
            class="record-entry"
            @tap="goEdit(record)"
            hover-class="record-entry-hover"
          >
            <!-- 颜色指示条 -->
            <view class="entry-indicator" :style="{ backgroundColor: getConsistencyColor(record.type) }" />
            
            <view class="entry-body">
              <view class="entry-top">
                <view class="entry-left">
                  <text class="entry-time">{{ formatTime(record.timestamp) }}</text>
                  <text class="entry-type-badge" :class="'entry-type-badge--' + getTypeStatus(record.type)">
                    {{ POOP_TYPES[record.type as PoopType]?.name || '未知' }}
                  </text>
                </view>
                <view
                  v-if="record.color"
                  class="entry-color-dot"
                  :style="{ backgroundColor: POOP_COLORS[record.color as PoopColor]?.color }"
                />
              </view>
              
              <text class="entry-consistency">
                质地：<text class="entry-consistency-val">{{ POOP_TYPES[record.type as PoopType]?.description || '—' }}</text>
              </text>
              
              <view v-if="record.note" class="entry-note">
                <text>{{ record.note }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </main>
    <bottom-nav-bar current="history" @switch="handleSwitch" />
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRecordStore } from '@/stores/record'
import { useBabyStore } from '@/stores/baby'
import { POOP_TYPES, POOP_COLORS } from '@/constants'
import { formatTime, getDateLabel } from '@/utils/date'
import type { PoopRecord, PoopType, PoopColor } from '@/types'

const recordStore = useRecordStore()
const babyStore = useBabyStore()

onMounted(() => {
  recordStore.fetchRecords(babyStore.activeBabyId)
})

function getConsistencyColor(type: string): string {
  const map: Record<string, string> = {
    type1: '#707973', type2: '#707973',
    type3: '#506354', type4: '#3b694c',
    type5: '#D97706', type6: '#D97706', type7: '#DC2626'
  }
  return map[type] || '#707973'
}

function getTypeStatus(type: string): string {
  const map: Record<string, string> = {
    type4: 'normal', type5: 'normal',
    type6: 'caution', type7: 'caution',
    type1: 'warning', type2: 'warning', type3: 'warning'
  }
  return map[type] || 'normal'
}

function goEdit(record: any) {
  uni.navigateTo({ url: `/pages/add-record/index?id=${record.id}` })
}

function handleSwitch(key: string) {
  uni.reLaunch({ url: `/pages/${key}/index` })
}
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: var(--background);
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.history-content {
  padding: 148rpx 40rpx 200rpx;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48rpx;
}

.history-title {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--on-surface);
  letter-spacing: -0.01em;
}

.history-actions {
  display: flex;
  gap: 16rpx;
}

.history-action-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 24rpx;
  background: var(--surface-container-high);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--on-surface-variant);
  padding: 0;
}

.history-action-btn:active {
  background: var(--primary-container);
  color: var(--primary);
}

/* 日期组 */
.date-group {
  margin-bottom: 40rpx;
}

.date-header {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--outline);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: block;
  margin-left: 8rpx;
  margin-bottom: 16rpx;
}

/* 记录条目 */
.record-entry {
  position: relative;
  background: var(--surface-container-lowest);
  border-radius: 32rpx;
  padding: 32rpx 32rpx 32rpx 48rpx;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(191, 201, 196, 0.15);
  margin-bottom: 20rpx;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.record-entry-hover {
  box-shadow: var(--shadow-base);
}

.entry-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 12rpx;
  height: 100%;
}

.entry-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.entry-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.entry-time {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--on-surface);
}

.entry-type-badge {
  font-size: 20rpx;
  font-weight: 700;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  letter-spacing: 0.02em;
}

.entry-type-badge--normal {
  background: var(--secondary-container);
  color: var(--on-secondary-container);
}

.entry-type-badge--caution {
  background: var(--tertiary-container);
  color: var(--on-tertiary-container);
}

.entry-type-badge--warning {
  background: rgba(217, 119, 6, 0.15);
  color: #92400e;
}

.entry-color-dot {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 4rpx solid var(--surface-container-lowest);
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.entry-consistency {
  font-size: 26rpx;
  color: var(--on-surface-variant);
}

.entry-consistency-val {
  font-weight: 600;
  color: var(--on-surface);
}

.entry-note {
  margin-top: 16rpx;
  padding: 16rpx 20rpx;
  background: rgba(190, 234, 241, 0.3);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: var(--on-tertiary-container);
  border: 1px solid rgba(190, 234, 241, 0.4);
  font-style: italic;
}

.history-empty {
  padding-top: 120rpx;
}
</style>
```

---

## Task 8: 数据统计页（趋势）

**文件：**
- 修改：`src/pages/trends/index.vue`（替换占位）
- 删除：`src/pages/statistics/index.vue`

- [ ] **Step 1: 实现数据统计页**

基于设计文件 `_2`。包含频率统计、颜色分布、质地分析、儿科建议。

需要计算统计数据，复用现有 `api.getStatistics` 接口。

---

## Task 9: 个人资料页

**文件：**
- 修改：`src/pages/profile/index.vue`（替换占位）

- [ ] **Step 1: 实现个人资料页**

基于设计文件 `_1`。包含宝宝头像、基本信息、设置列表、退出按钮。

---

## Task 10: 其他页面样式更新

**文件：**
- 修改：`src/pages/add-record/index.vue`
- 修改：`src/pages/config/index.vue`
- 修改：`src/pages/baby-manage/index.vue`
- 修改：`src/pages/settings/index.vue`
- 修改：`src/components/record-item.vue`
- 修改：`src/components/empty-state.vue`

- [ ] **Step 1: 更新 add-record/index.vue 样式**

将 `background: var(--bg)` 等引用替换为新的 CSS 变量名，圆角使用新系统值，按钮使用 primary 配色。

- [ ] **Step 2: 更新 config/index.vue 样式**

配置页的背景和按钮颜色更新为新主题。

- [ ] **Step 3: 更新 baby-manage/index.vue 样式**

宝宝卡片圆角改为 32rpx，颜色使用新 token。

- [ ] **Step 4: 更新 settings/index.vue 样式**

设置页卡片圆角改为 24rpx，使用新配色。

- [ ] **Step 5: 更新 record-item.vue 样式**

调整为时间线风格，添加左侧颜色指示条，圆角改为 24rpx。

- [ ] **Step 6: 更新 empty-state.vue 样式**

使用新 token 变量。

---

## Checklist 实现验证

- [ ] 1. 所有页面 CSS 变量引用正确，无遗留旧 token
- [ ] 2. 底部导航栏 4 个 Tab 点击切换到正确页面
- [ ] 3. FAB 点击跳转到添加记录页
- [ ] 4. Quick Log 卡片选择颜色 + 质地 + 保存成功
- [ ] 5. 历史记录页显示记录列表，点击可编辑
- [ ] 6. 数据统计页图表渲染正常
- [ ] 7. 深色模式切换无视觉错误
- [ ] 8. 字体大小缩放功能正常
