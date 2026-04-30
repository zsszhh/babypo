# 日历视图页面实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增日历视图页面，支持月历/年历切换，以日历网格形式展示所有历史记录。

**Architecture:** 新增独立日历页面 `/pages/calendar/index.vue`，复用现有 record store 和 API。月历/年历视图在同一页面切换，使用底部抽屉展示选中日期的记录详情。历史记录页面限制显示 10 条并添加入口跳转日历。

**Tech Stack:** Vue 3 + TypeScript + Pinia + uni-app + dayjs

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `src/stores/record.ts` | 扩展：按时间范围加载记录 |
| `src/pages/calendar/index.vue` | 新增：日历视图主页面 |
| `src/pages/history/index.vue` | 修改：限制 10 条 + 添加入口 |
| `src/pages.json` | 修改：添加路由配置 |
| `src/utils/date.ts` | 扩展：日历相关日期工具函数 |

---

### Task 1: 扩展日期工具函数

**Files:**
- Modify: `src/utils/date.ts`

- [ ] **Step 1: 添加日历相关日期工具函数**

在 `src/utils/date.ts` 文件末尾添加以下函数：

```typescript
/**
 * 获取月份的日历网格数据
 * @param year 年份
 * @param month 月份 (1-12)
 * @returns 日历网格数据，包含日期、是否本月、是否今天
 */
export function getCalendarMonth(year: number, month: number): Array<{
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}> {
  const result: Array<{
    date: Date
    day: number
    isCurrentMonth: boolean
    isToday: boolean
  }> = []
  
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 获取本月第一天是星期几（0=周日）
  const startWeekday = firstDay.getDay()
  
  // 填充上月末尾日期
  for (let i = startWeekday - 1; i >= 0; i--) {
    const date = new Date(year, month - 2, lastDay.getDate() - i)
    result.push({
      date,
      day: date.getDate(),
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime()
    })
  }
  
  // 填充本月日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month - 1, i)
    result.push({
      date,
      day: i,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime()
    })
  }
  
  // 填充下月初日期，补齐6行
  const remaining = 42 - result.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month, i)
    result.push({
      date,
      day: i,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime()
    })
  }
  
  return result
}

/**
 * 获取日期的开始时间戳（00:00:00）
 */
export function getStartOfDay(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * 获取日期的结束时间戳（23:59:59）
 */
export function getEndOfDay(date: Date): number {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

/**
 * 获取月份的第一天时间戳
 */
export function getMonthStart(year: number, month: number): number {
  return new Date(year, month - 1, 1, 0, 0, 0, 0).getTime()
}

/**
 * 获取月份的最后一天时间戳
 */
export function getMonthEnd(year: number, month: number): number {
  return new Date(year, month, 0, 23, 59, 59, 999).getTime()
}

/**
 * 获取年份的第一天时间戳
 */
export function getYearStart(year: number): number {
  return new Date(year, 0, 1, 0, 0, 0, 0).getTime()
}

/**
 * 获取年份的最后一天时间戳
 */
export function getYearEnd(year: number): number {
  return new Date(year, 11, 31, 23, 59, 59, 999).getTime()
}

/**
 * 获取星期几的中文名称
 */
export function getWeekdayName(date: Date): string {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return weekdays[date.getDay()]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/date.ts
git commit -m "feat: add calendar date utility functions"
```

---

### Task 2: 扩展 Record Store 支持按时间范围加载

**Files:**
- Modify: `src/stores/record.ts`

- [ ] **Step 1: 添加按时间范围加载记录的方法**

在 `src/stores/record.ts` 的 `return` 语句之前添加以下函数：

```typescript
  // 缓存已加载的时间范围
  const loadedMonths = ref<Set<string>>(new Set())

  /**
   * 按时间范围加载记录
   */
  async function fetchRecordsByRange(babyId: number, startDate: number, endDate: number) {
    loading.value = true
    try {
      const res = await request<RecordsData>({
        url: `/api/v1/records?baby_id=${babyId}&start_date=${startDate}&end_date=${endDate}&limit=1000`
      })
      // 合并记录，去重
      const existingIds = new Set(records.value.map(r => r.id))
      for (const sr of res.data.records) {
        if (!existingIds.has(sr.id)) {
          records.value.push(sr)
        }
      }
      return res.data.records
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载指定月份的记录（带缓存）
   */
  async function fetchMonthRecords(babyId: number, year: number, month: number) {
    const cacheKey = `${year}-${month}`
    if (loadedMonths.value.has(cacheKey)) {
      return records.value.filter(r => {
        const d = new Date(r.timestamp)
        return d.getFullYear() === year && d.getMonth() === month - 1
      })
    }
    
    const startDate = getMonthStart(year, month)
    const endDate = getMonthEnd(year, month)
    await fetchRecordsByRange(babyId, startDate, endDate)
    loadedMonths.value.add(cacheKey)
  }

  /**
   * 获取指定日期的记录
   */
  function getRecordsByDate(date: Date): PoopRecord[] {
    const start = getStartOfDay(date)
    const end = getEndOfDay(date)
    return records.value.filter(r => r.timestamp >= start && r.timestamp <= end)
  }

  /**
   * 获取指定月份的记录统计（用于年历视图）
   */
  function getMonthStats(year: number, month: number): { count: number; dates: number[] } {
    const startDate = getMonthStart(year, month)
    const endDate = getMonthEnd(year, month)
    const monthRecords = records.value.filter(r => r.timestamp >= startDate && r.timestamp <= endDate)
    
    const datesSet = new Set<number>()
    monthRecords.forEach(r => {
      const d = new Date(r.timestamp)
      datesSet.add(d.getDate())
    })
    
    return {
      count: monthRecords.length,
      dates: Array.from(datesSet)
    }
  }

  /**
   * 清除月份缓存（用于刷新数据）
   */
  function clearMonthCache(year?: number, month?: number) {
    if (year && month) {
      loadedMonths.value.delete(`${year}-${month}`)
    } else {
      loadedMonths.value.clear()
    }
  }
```

需要在文件顶部导入新函数：

```typescript
import { formatDate, getMonthStart, getMonthEnd, getStartOfDay, getEndOfDay } from '@/utils/date'
```

更新 return 语句：

```typescript
  return {
    records, localRecords, loading, hasMore, totalCount, loadedMonths,
    sortedRecords, groupedByDate,
    fetchRecords, fetchRecordsByRange, fetchMonthRecords, getRecordsByDate, getMonthStats,
    addRecord, updateRecord, deleteRecord,
    addLocalRecord, removeLocalRecord, markLocalSynced, mergeServerRecords,
    clearMonthCache
  }
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/record.ts
git commit -m "feat: add time range query methods to record store"
```

---

### Task 3: 添加路由配置

**Files:**
- Modify: `src/pages.json`

- [ ] **Step 1: 添加 calendar 页面路由**

在 `src/pages.json` 的 `pages` 数组中添加新页面（添加在 `history` 页面之后）：

```json
{
  "pages": [
    { "path": "pages/config/index", "style": { "navigationBarTitleText": "连接服务器", "navigationStyle": "custom" } },
    { "path": "pages/home/index", "style": { "navigationBarTitleText": "首页", "navigationStyle": "custom" } },
    { "path": "pages/history/index", "style": { "navigationBarTitleText": "历史记录", "navigationStyle": "custom" } },
    { "path": "pages/calendar/index", "style": { "navigationBarTitleText": "日历视图", "navigationStyle": "custom" } },
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

- [ ] **Step 2: Commit**

```bash
git add src/pages.json
git commit -m "feat: add calendar page route"
```

---

### Task 4: 创建日历视图页面

**Files:**
- Create: `src/pages/calendar/index.vue`

- [ ] **Step 1: 创建日历视图页面完整代码**

创建目录并创建文件 `src/pages/calendar/index.vue`：

```vue
<template>
  <view class="calendar-page">
    <!-- 顶部导航栏 -->
    <header class="calendar-header">
      <view class="header-nav">
        <view class="nav-arrow" @tap="goPrev" hover-class="nav-arrow-hover">
          <text class="material-symbols-outlined">chevron_left</text>
        </view>
        <view class="nav-title" @tap="showPicker = true">
          <text class="title-text">{{ viewMode === 'month' ? `${currentYear}年${currentMonth}月` : `${currentYear}年` }}</text>
          <text class="material-symbols-outlined title-arrow">expand_more</text>
        </view>
        <view class="nav-arrow" @tap="goNext" hover-class="nav-arrow-hover">
          <text class="material-symbols-outlined">chevron_right</text>
        </view>
      </view>
      <view class="view-toggle">
        <view
          class="toggle-btn"
          :class="{ 'toggle-btn--active': viewMode === 'month' }"
          @tap="viewMode = 'month'"
        >月</view>
        <view
          class="toggle-btn"
          :class="{ 'toggle-btn--active': viewMode === 'year' }"
          @tap="viewMode = 'year'"
        >年</view>
      </view>
    </header>

    <!-- 月历视图 -->
    <view v-if="viewMode === 'month'" class="month-view">
      <!-- 星期行 -->
      <view class="weekday-row">
        <text v-for="w in weekdays" :key="w" class="weekday-text">{{ w }}</text>
      </view>
      
      <!-- 日历网格 -->
      <view class="calendar-grid">
        <view
          v-for="(cell, index) in calendarDays"
          :key="index"
          class="day-cell"
          :class="{
            'day-cell--other': !cell.isCurrentMonth,
            'day-cell--today': cell.isToday,
            'day-cell--selected': selectedDate && isSameDay(cell.date, selectedDate)
          }"
          @tap="selectDate(cell)"
        >
          <text class="day-number">{{ cell.day }}</text>
          <view v-if="getDateRecordCount(cell.date) > 0" class="day-indicator">
            <text class="day-count">{{ getDateRecordCount(cell.date) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 年历视图 -->
    <scroll-view v-else class="year-view" scroll-y>
      <view class="year-grid">
        <view
          v-for="m in 12"
          :key="m"
          class="month-card"
          @tap="selectMonth(m)"
        >
          <text class="month-card-title">{{ m }}月</text>
          <view class="mini-calendar">
            <view class="mini-weekdays">
              <text v-for="w in miniWeekdays" :key="w" class="mini-weekday">{{ w }}</text>
            </view>
            <view class="mini-grid">
              <view
                v-for="(cell, idx) in getMiniCalendarDays(currentYear, m)"
                :key="idx"
                class="mini-cell"
              >
                <text v-if="cell.isCurrentMonth" class="mini-day">{{ cell.day }}</text>
                <view v-if="cell.isCurrentMonth && hasRecordOnDay(currentYear, m, cell.day)" class="mini-dot" />
              </view>
            </view>
          </view>
          <view class="month-card-footer">
            <text class="month-count">共 {{ getMonthRecordCount(currentYear, m) }} 条</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部导航 -->
    <bottom-nav-bar current="history" @switch="handleSwitch" />

    <!-- 日期详情抽屉 -->
    <view v-if="showDrawer" class="drawer-overlay" @tap="closeDrawer">
      <view class="drawer-panel" @tap.stop>
        <view class="drawer-handle" @tap="closeDrawer">
          <view class="handle-bar" />
        </view>
        <view class="drawer-header">
          <text class="drawer-date">{{ drawerDateText }}</text>
          <text class="drawer-count">共 {{ drawerRecords.length }} 条记录</text>
        </view>
        <scroll-view class="drawer-content" scroll-y>
          <view v-if="drawerRecords.length === 0" class="drawer-empty">
            <text class="material-symbols-outlined empty-icon">event_note</text>
            <text class="empty-text">暂无记录</text>
          </view>
          <view
            v-for="record in drawerRecords"
            :key="record.id"
            class="drawer-record"
            @tap="editRecord(record)"
          >
            <view class="record-time-type">
              <text class="record-time">{{ formatTime(record.timestamp) }}</text>
              <text class="record-type">{{ POOP_TYPES[record.type as PoopType]?.name }}</text>
            </view>
            <view class="record-info">
              <view
                v-if="record.color"
                class="record-color"
                :style="{ backgroundColor: POOP_COLORS[record.color as PoopColor]?.color }"
              />
              <text v-if="record.amount" class="record-amount">{{ POOP_AMOUNTS[record.amount as PoopAmount]?.name }}</text>
            </view>
            <text v-if="record.note" class="record-note">{{ record.note }}</text>
          </view>
        </scroll-view>
        <view class="drawer-footer">
          <button class="add-btn" @tap="addRecordForDate">
            <text class="material-symbols-outlined">add</text>
            <text>添加记录</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 年月选择器 -->
    <view v-if="showPicker" class="picker-overlay" @tap="showPicker = false">
      <view class="picker-panel" @tap.stop>
        <view class="picker-header">
          <text class="picker-title">选择年月</text>
        </view>
        <picker-view
          class="picker-view"
          :value="pickerValue"
          @change="onPickerChange"
        >
          <picker-view-column>
            <view v-for="y in pickerYears" :key="y" class="picker-item">{{ y }}年</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="m in 12" :key="m" class="picker-item">{{ m }}月</view>
          </picker-view-column>
        </picker-view>
        <view class="picker-footer">
          <button class="picker-btn" @tap="confirmPicker">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useRecordStore } from '@/stores/record'
import { useBabyStore } from '@/stores/baby'
import { POOP_TYPES, POOP_COLORS, POOP_AMOUNTS } from '@/constants'
import { formatTime, getCalendarMonth, getWeekdayName, getMonthStats } from '@/utils/date'
import type { PoopRecord, PoopType, PoopColor, PoopAmount } from '@/types'

const recordStore = useRecordStore()
const babyStore = useBabyStore()

const viewMode = ref<'month' | 'year'>('month')
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const selectedDate = ref<Date | null>(null)
const showDrawer = ref(false)
const showPicker = ref(false)

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const miniWeekdays = ['日', '一', '二', '三', '四', '五', '六']

// 年月选择器数据
const currentYearNum = new Date().getFullYear()
const pickerYears = Array.from({ length: 5 }, (_, i) => currentYearNum - 2 + i)
const pickerValue = ref([2, currentMonth.value - 1])

// 月历网格数据
const calendarDays = computed(() => getCalendarMonth(currentYear.value, currentMonth.value))

// 抽屉数据
const drawerRecords = computed(() => {
  if (!selectedDate.value) return []
  return recordStore.getRecordsByDate(selectedDate.value)
})

const drawerDateText = computed(() => {
  if (!selectedDate.value) return ''
  return `${selectedDate.value.getMonth() + 1}月${selectedDate.value.getDate()}日 · ${getWeekdayName(selectedDate.value)}`
})

// 监听视图模式变化，加载对应数据
watch(viewMode, async (mode) => {
  if (mode === 'year') {
    // 加载全年数据
    await recordStore.fetchRecordsByRange(
      babyStore.activeBabyId,
      new Date(currentYear.value, 0, 1).getTime(),
      new Date(currentYear.value, 11, 31, 23, 59, 59).getTime()
    )
  }
})

// 监听月份变化，加载数据
watch([currentYear, currentMonth], async ([year, month]) => {
  if (viewMode.value === 'month') {
    await recordStore.fetchMonthRecords(babyStore.activeBabyId, year, month)
  }
})

onMounted(async () => {
  await recordStore.fetchMonthRecords(babyStore.activeBabyId, currentYear.value, currentMonth.value)
})

onShow(() => {
  // 返回页面时刷新当月数据
  recordStore.clearMonthCache(currentYear.value, currentMonth.value)
  recordStore.fetchMonthRecords(babyStore.activeBabyId, currentYear.value, currentMonth.value)
})

function getDateRecordCount(date: Date): number {
  return recordStore.getRecordsByDate(date).length
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate()
}

function selectDate(cell: { date: Date; isCurrentMonth: boolean }) {
  selectedDate.value = cell.date
  showDrawer.value = true
}

function closeDrawer() {
  showDrawer.value = false
}

function selectMonth(month: number) {
  currentMonth.value = month
  viewMode.value = 'month'
}

function goPrev() {
  if (viewMode.value === 'month') {
    if (currentMonth.value === 1) {
      currentMonth.value = 12
      currentYear.value--
    } else {
      currentMonth.value--
    }
  } else {
    currentYear.value--
  }
}

function goNext() {
  if (viewMode.value === 'month') {
    if (currentMonth.value === 12) {
      currentMonth.value = 1
      currentYear.value++
    } else {
      currentMonth.value++
    }
  } else {
    currentYear.value++
  }
}

function onPickerChange(e: any) {
  pickerValue.value = e.detail.value
}

function confirmPicker() {
  currentYear.value = pickerYears[pickerValue.value[0]]
  currentMonth.value = pickerValue.value[1] + 1
  showPicker.value = false
}

function getMiniCalendarDays(year: number, month: number) {
  return getCalendarMonth(year, month)
}

function hasRecordOnDay(year: number, month: number, day: number): boolean {
  const stats = recordStore.getMonthStats(year, month)
  return stats.dates.includes(day)
}

function getMonthRecordCount(year: number, month: number): number {
  return recordStore.getMonthStats(year, month).count
}

function editRecord(record: PoopRecord) {
  if (record.id) {
    uni.navigateTo({ url: `/pages/add-record/index?id=${record.id}` })
  }
}

function addRecordForDate() {
  if (selectedDate.value) {
    const timestamp = selectedDate.value.getTime()
    uni.navigateTo({ url: `/pages/add-record/index?timestamp=${timestamp}` })
  }
}

function handleSwitch(key: string) {
  uni.reLaunch({ url: `/pages/${key}/index` })
}
</script>

<style scoped>
.calendar-page {
  min-height: 100vh;
  background: var(--background);
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* 顶部导航栏 */
.calendar-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 108rpx 32rpx 24rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(191, 201, 196, 0.3);
  box-sizing: border-box;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.nav-arrow {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.nav-arrow-hover {
  background: var(--surface-container);
}

.nav-arrow .material-symbols-outlined {
  font-size: 40rpx;
  color: var(--on-surface);
}

.nav-title {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
}

.nav-title:active {
  background: var(--surface-container);
}

.title-text {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--on-surface);
}

.title-arrow {
  font-size: 28rpx;
  color: var(--on-surface-variant);
}

.view-toggle {
  display: flex;
  gap: 8rpx;
  background: var(--surface-container-low);
  padding: 6rpx;
  border-radius: 999rpx;
}

.toggle-btn {
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: var(--on-surface-variant);
}

.toggle-btn--active {
  background: var(--primary);
  color: var(--on-primary);
}

/* 月历视图 */
.month-view {
  padding: 200rpx 32rpx 200rpx;
}

.weekday-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16rpx;
}

.weekday-text {
  width: 80rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--outline);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8rpx;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  background: var(--surface-container-lowest);
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.day-cell--other {
  opacity: 0.4;
}

.day-cell--today {
  background: var(--primary-container);
}

.day-cell--selected {
  border-color: var(--primary);
  background: var(--primary-container);
}

.day-number {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--on-surface);
}

.day-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4rpx;
}

.day-count {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--primary);
}

/* 年历视图 */
.year-view {
  padding: 200rpx 32rpx 200rpx;
  height: calc(100vh - 200rpx);
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.month-card {
  background: var(--surface-container-lowest);
  border-radius: 24rpx;
  padding: 20rpx;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(191, 201, 196, 0.15);
}

.month-card-title {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--on-surface);
  margin-bottom: 12rpx;
  display: block;
}

.mini-calendar {
  margin-bottom: 12rpx;
}

.mini-weekdays {
  display: flex;
  justify-content: space-around;
  margin-bottom: 4rpx;
}

.mini-weekday {
  font-size: 16rpx;
  color: var(--outline);
  width: 28rpx;
  text-align: center;
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2rpx;
}

.mini-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mini-day {
  font-size: 18rpx;
  color: var(--on-surface-variant);
}

.mini-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: var(--primary);
  margin-top: 2rpx;
}

.month-card-footer {
  text-align: center;
  padding-top: 8rpx;
  border-top: 1px solid rgba(191, 201, 196, 0.15);
}

.month-count {
  font-size: 22rpx;
  color: var(--primary);
  font-weight: 600;
}

/* 抽屉 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.drawer-panel {
  width: 100%;
  max-height: 70vh;
  background: var(--surface-container-lowest);
  border-radius: 40rpx 40rpx 0 0;
  display: flex;
  flex-direction: column;
}

.drawer-handle {
  padding: 20rpx;
  display: flex;
  justify-content: center;
}

.handle-bar {
  width: 80rpx;
  height: 8rpx;
  background: var(--outline);
  border-radius: 4rpx;
}

.drawer-header {
  padding: 0 32rpx 24rpx;
  border-bottom: 1px solid rgba(191, 201, 196, 0.15);
}

.drawer-date {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--on-surface);
  display: block;
}

.drawer-count {
  font-size: 26rpx;
  color: var(--on-surface-variant);
  margin-top: 4rpx;
  display: block;
}

.drawer-content {
  flex: 1;
  padding: 24rpx 32rpx;
  max-height: 50vh;
}

.drawer-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  color: var(--outline);
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: var(--on-surface-variant);
}

.drawer-record {
  padding: 24rpx;
  background: var(--surface-container-low);
  border-radius: 20rpx;
  margin-bottom: 16rpx;
}

.record-time-type {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.record-time {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--on-surface);
}

.record-type {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-container);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.record-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.record-color {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
}

.record-amount {
  font-size: 24rpx;
  color: var(--on-surface-variant);
}

.record-note {
  font-size: 24rpx;
  color: var(--on-surface-variant);
  font-style: italic;
  background: rgba(190, 234, 241, 0.3);
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  margin-top: 8rpx;
  display: block;
}

.drawer-footer {
  padding: 24rpx 32rpx 48rpx;
  border-top: 1px solid rgba(191, 201, 196, 0.15);
}

.add-btn {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: linear-gradient(135deg, var(--primary), var(--primary-fixed-dim));
  color: var(--on-primary);
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
  border: none;
}

.add-btn .material-symbols-outlined {
  font-size: 36rpx;
}

/* 年月选择器 */
.picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.picker-panel {
  width: 100%;
  background: var(--surface-container-lowest);
  border-radius: 40rpx 40rpx 0 0;
}

.picker-header {
  padding: 32rpx;
  border-bottom: 1px solid rgba(191, 201, 196, 0.15);
}

.picker-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--on-surface);
}

.picker-view {
  height: 400rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: var(--on-surface);
}

.picker-footer {
  padding: 24rpx 32rpx 48rpx;
}

.picker-btn {
  width: 100%;
  height: 88rpx;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
  border: none;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/calendar/index.vue
git commit -m "feat: add calendar view page with month/year modes"
```

---

### Task 5: 修改历史记录页面

**Files:**
- Modify: `src/pages/history/index.vue`

- [ ] **Step 1: 限制显示 10 条记录并添加入口**

修改 `src/pages/history/index.vue`，找到模板部分，在 `history-list` 的 `v-for` 循环前添加限制逻辑：

将现有的：
```vue
<view v-else class="history-list">
  <view v-for="(records, dateStr) in recordStore.groupedByDate" :key="dateStr" class="date-group">
```

修改为：
```vue
<view v-else class="history-list">
  <view v-for="(records, dateStr) in recentGroupedRecords" :key="dateStr" class="date-group">
```

在 script 部分，添加 computed 属性并移除分页相关代码：

```vue
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRecordStore } from '@/stores/record'
import { useBabyStore } from '@/stores/baby'
import { POOP_TYPES, POOP_COLORS } from '@/constants'
import { formatTime, getDateLabel } from '@/utils/date'
import type { PoopType, PoopColor } from '@/types'

const recordStore = useRecordStore()
const babyStore = useBabyStore()

// 只显示最近10条记录
const recentGroupedRecords = computed(() => {
  const groups: Record<string, any[]> = {}
  let count = 0
  for (const record of recordStore.sortedRecords) {
    if (count >= 10) break
    const key = formatDate(record.timestamp, 'YYYY-MM-DD')
    if (!groups[key]) groups[key] = []
    groups[key].push(record)
    count++
  }
  return groups
})

onMounted(() => {
  recordStore.fetchRecords(babyStore.activeBabyId, { limit: 10 })
})

// ... 保留原有的 getConsistencyColor, getTypeStatus, goEdit, handleSwitch 函数
```

需要导入 `formatDate`：
```typescript
import { formatTime, getDateLabel, formatDate } from '@/utils/date'
```

在模板底部，将现有的分页提示替换为「查看全部记录」入口：

```vue
      <!-- 查看全部入口 -->
      <view class="history-footer" @tap="goCalendar" hover-class="history-footer-hover">
        <text class="history-footer-text">
          <text class="material-symbols-outlined footer-icon">calendar_month</text>
          查看全部记录
        </text>
        <text class="material-symbols-outlined footer-arrow">chevron_right</text>
      </view>
```

添加 `goCalendar` 函数：
```typescript
function goCalendar() {
  uni.navigateTo({ url: '/pages/calendar/index' })
}
```

更新底部样式：
```css
.history-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 24rpx;
  background: var(--surface-container-lowest);
  border-radius: 24rpx;
  margin-top: 24rpx;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(191, 201, 196, 0.15);
}

.history-footer-hover {
  background: var(--surface-container);
}

.history-footer-text {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--primary);
}

.footer-icon {
  font-size: 36rpx;
  color: var(--primary);
}

.footer-arrow {
  font-size: 36rpx;
  color: var(--on-surface-variant);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/history/index.vue
git commit -m "feat: limit history to 10 records and add calendar entry"
```

---

### Task 6: 验证与测试

- [ ] **Step 1: 启动开发服务器验证页面**

```bash
# 在项目根目录运行
npm run dev:h5
```

验证项目：
1. 历史记录页面只显示 10 条记录
2. 点击「查看全部记录」跳转日历页面
3. 日历页面默认显示当前月份
4. 点击日期格子弹出底部抽屉
5. 切换「年」视图显示 12 个月的小月历
6. 点击小月历进入该月视图

- [ ] **Step 2: 最终 Commit**

```bash
git add -A
git commit -m "feat: complete calendar view implementation"
```
